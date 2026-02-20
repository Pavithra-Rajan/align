import boto3
import json
import requests
from requests_aws4auth import AWS4Auth

# --- CONFIGURATION ---
region = 'us-east-1'
service = 'aoss'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, 
                   region, service, session_token=credentials.token)

host = 'https://vzxgbnwchzrvwpl8i7j6.us-east-1.aoss.amazonaws.com' 
index = 'bedrock-knowledge-base-default-index'

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters', {}) or {}
    
    # Extract Search Parameters
    search_text = query_params.get('q', '').strip()
    seniority = query_params.get('seniority', '').strip()
    page = int(query_params.get('page', 0))
    size = 12 

    # Construct the OpenSearch Bool Query
    url = f"{host}/{index}/_search"
    
    # Base structure
    query_dsl = {
        "from": page * size,
        "size": size,
        "query": {
            "bool": {
                "must": [],
                "filter": []
            }
        }
    }

    # Handle Full-Text Search (Search in Title, Skills, and Bedrock Text)
    if search_text:
        query_dsl["query"]["bool"]["must"].append({
            "multi_match": {
                "query": search_text,
                "fields": ["title^3", "skills^2", "AMAZON_BEDROCK_TEXT"],
                "fuzziness": "AUTO" # Handles typos
            }
        })
    else:
        query_dsl["query"]["bool"]["must"].append({"match_all": {}})

    # Handle Seniority Filter (Exact match)
    if seniority and seniority.lower() != 'all':
        query_dsl["query"]["bool"]["filter"].append({
            "match_phrase": { "seniority": seniority }
        })

    # Execute request
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, auth=awsauth, json=query_dsl, headers=headers)
        response.raise_for_status()
        results = response.json()

        # Format for Frontend
        jobs = []
        for hit in results.get('hits', {}).get('hits', []):
            # Flatten the source so frontend gets a clean object
            job_data = hit['_source']
            job_data['id'] = hit['_id'] # Including ID for React keys
            jobs.append(job_data)
        print(len(jobs))

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(jobs)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({"error": "Search failed", "details": str(e)})
        }