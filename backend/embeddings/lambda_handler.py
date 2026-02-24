import json
import boto3
import time
import logging
from decimal import Decimal
logger = logging.getLogger()
logger.setLevel(logging.INFO)

textract = boto3.client('textract')
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')
bedrock_runtime = boto3.client('bedrock-runtime')
secrets_client = boto3.client('secretsmanager')

def get_secrets(secret_name='kb_id'):
    """Fetch secrets from AWS Secrets Manager"""
    try:
        response = secrets_client.get_secret_value(SecretId=secret_name)
        if 'SecretString' in response:
            return json.loads(response['SecretString'])
        else:
            logger.error("Secret not found or in unsupported format")
            return {}
    except Exception as e:
        logger.error(f"Error fetching secrets: {str(e)}")
        raise

try:
    secrets = get_secrets()
    kb_id = secrets.get('KB_ID', '')  
except Exception as e:
    logger.warning(f"Could not load secrets, using fallback: {str(e)}")

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('resumedetails')

def get_raw_kb_results(resume_text, kb_id):
    """Fetches the top 20 raw job matches from the Knowledge Base."""
    search_query = resume_text[:1000] 
    
    retrieval_response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=kb_id,
        retrievalConfiguration={
            'vectorSearchConfiguration': {
                'numberOfResults': 10, 
                'overrideSearchType': 'HYBRID'
            }
        },
        retrievalQuery={'text': search_query}
    )
    
    candidate_jobs = []
    print("Retrieved results from Knowledge Base:")
    print(retrieval_response['retrievalResults'])

    for result in retrieval_response['retrievalResults']:
        score = result.get('score', 0)
        candidate_jobs.append({
            "content": result['content']['text'],
            "metadata": result.get('metadata', {}),
            "score": result.get('score', 0) # The confidence score from the vector search
        })
    # print(candidate_jobs)
    prompt = f"""
    You are an expert career advisor. I will provide a resume and a list of 10 potential jobs.
    
    <resume>
    {resume_text}
    </resume>
    
    <jobs>
    {json.dumps(candidate_jobs)}
    </jobs>
    
    Task:
    1. Identify the best matches based on seniority (e.g., don't match a VP to a Junior role) and industry.
    2. Provide a 'Match Score' (0-100).
    3. Explain in 2 sentences WHY this is a great match for the candidate and don't mention the candidate in the sentence, rather say it in second-person on why it fits the profile (you and your).
    4. the keys for the json should be title, organization, location, match_score, reason, link for the linkedin Link
    Output your answer in JSON format. It should only return the JSON and no other additional data. Encase the response between ```json and ```.
    """
    
    response = bedrock_runtime.converse(
        modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
        messages=[{"role": "user", "content": [{"text": prompt}]}]
    )
    return response['output']['message']['content'][0]['text']

def lambda_handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        
        # Start Textract
        response = textract.start_document_text_detection(
            DocumentLocation={'S3Object': {'Bucket': bucket, 'Name': key}}
        )
        job_id = response['JobId']
        
        # Polling for Textract completion
        status = 'IN_PROGRESS'
        while status == 'IN_PROGRESS':
            time.sleep(2)
            job_status = textract.get_document_text_detection(JobId=job_id)
            status = job_status['JobStatus']
        
        if status == 'SUCCEEDED':
            # Extract text from blocks
            lines = []
            next_token = None
            while True:
                params = {'JobId': job_id}
                if next_token: params['NextToken'] = next_token
                
                result = textract.get_document_text_detection(**params)
                for item in result['Blocks']:
                    if item['BlockType'] == 'LINE':
                        lines.append(item['Text'])
                
                next_token = result.get('NextToken')
                if not next_token: break
            
            resume_text = "\n".join(lines)
        
            # Get jobs directly from Knowledge Base (No LLM)
            job_results = get_raw_kb_results(resume_text, kb_id)
            # print(job_results)
            print(type(job_results))
            job_results = job_results.strip()
            index = job_results.find("```json")
            
            job_results = job_results[index+7:]
            job_results = job_results.replace('```', '')
            job_results = json.loads(job_results)
            
            # print(job_results)
            # print(type(job_results))

            # Store in DynamoDB
            table.put_item(
                Item={
                    'file_id': key,
                    'status': 'COMPLETED',
                    'matches': job_results, # This is now the list of objects from KB
                    'timestamp': int(time.time()),
                    'ttl': int(time.time() + 86400) 
                }
            )
            
            return {
                'statusCode': 200,
                'body': json.dumps({'recommendations': job_results})
            }
        
        return {'statusCode': 500, 'body': 'Textract job failed'}

    except Exception as e:
        logger.error(str(e))
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}