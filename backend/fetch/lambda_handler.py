import boto3
import json
import requests
from requests_aws4auth import AWS4Auth
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- CONFIGURATION ---
region = 'us-east-1' # Your region
service = 'aoss'      # 'aoss' is for OpenSearch Serverless
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, 
                   region, service, session_token=credentials.token)

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
    aoss_host = secrets.get('AOSS_HOST', '')  
    aoss_index = secrets.get('AOSS_INDEX', '')
except Exception as e:
    logger.warning(f"Could not load secrets, using fallback: {str(e)}")

def lambda_handler(event, context):
    query_params = event.get('queryStringParameters', {}) or {}
    page = int(query_params.get('page', 0))
    size = 10  # Jobs per page

    # OpenSearch DSL Query
    url = f"{aoss_host}/{aoss_index}/_search"
    query = {
        "from": page * size,
        "size": size,
        "query": {
            "match_all": {}
        }
    }

    # Execute request
    headers = {"Content-Type": "application/json"}
    response = requests.get(url, auth=awsauth, json=query, headers=headers)
    results = response.json()
    logger.debug(results)

    # Format for Frontend
    jobs = []
    for hit in results.get('hits', {}).get('hits', []):
        jobs.append(hit['_source'])
    logger.debug(jobs)

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*', # Required for CORS
            'Content-Type': 'application/json'
        },
        'body': json.dumps(jobs)
    }