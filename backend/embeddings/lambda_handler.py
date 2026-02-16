import json
import boto3
import time
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

textract = boto3.client('textract')
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')
bedrock_runtime = boto3.client('bedrock-runtime')

secrets_client = boto3.client('secretsmanager')

def get_secrets(secret_name='align-config'):
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

def get_personalized_match(resume_text, kb_id):
    # Semantic Retrieval: Fetch the top 20 candidate jobs
    retrieval_response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=kb_id,
        retrievalConfiguration={
            'vectorSearchConfiguration': {
                'numberOfResults': 20 
            }
        },
        retrievalQuery={'text': resume_text}
    )
    
    # Format the retrieved jobs for the LLM
    candidate_jobs = []
    for result in retrieval_response['retrievalResults']:
        candidate_jobs.append({
            "content": result['content']['text'],
            "metadata": result.get('metadata', {})
        })
    print(f"Retrieved {len(candidate_jobs)} candidate jobs for LLM reasoning.")
    print(f"Candidate Jobs Sample: {candidate_jobs[:2]}")  # Print first 2 for verification

    # Using Claude to select and explain the match
    # XML tags to clearly separate instructions and data for Claude
    prompt = f"""
    You are an expert career advisor. I will provide a resume and a list of 20 potential jobs.
    
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
    
    Output your answer in JSON format.
    """
    
    response = bedrock_runtime.converse(
        modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
        messages=[{"role": "user", "content": [{"text": prompt}]}]
    )
    print("Raw LLM Response:", response)  
    
    return response['output']['message']['content'][0]['text']

def lambda_handler(event, context):
    try:
        # Get file details from S3 event
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        
        # Start Asynchronous Text Detection
        response = textract.start_document_text_detection(
            DocumentLocation={'S3Object': {'Bucket': bucket, 'Name': key}}
        )
        job_id = response['JobId']
        logger.info(f"Started Job ID: {job_id}")

        # Wait for job to complete (Polling)
        status = 'IN_PROGRESS'
        while status == 'IN_PROGRESS':
            time.sleep(2)
            job_status = textract.get_document_text_detection(JobId=job_id)
            status = job_status['JobStatus']
        
        if status == 'SUCCEEDED':
            logger.info("Textract Analysis Complete")
            # Extract text from the paginated results
            pages = []
            next_token = None
            
            while True:
                params = {'JobId': job_id}
                if next_token:
                    params['NextToken'] = next_token
                
                result = textract.get_document_text_detection(**params)
                for item in result['Blocks']:
                    if item['BlockType'] == 'LINE':
                        pages.append(item['Text'])
                
                next_token = result.get('NextToken')
                if not next_token:
                    break
            logger.info(f"Extracted Text: {pages}")
            resume_text = "\n".join(pages) 
        
            job_results = get_personalized_match(resume_text, kb_id)
            print(f"Personalized Job Match Result: {job_results}")
            return {
                'statusCode': 200,
                'body': json.dumps({'recommendations': job_results})
            }
        
        return {'statusCode': 500, 'body': 'Textract job failed'}

    except Exception as e:
        logger.error(str(e))
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}