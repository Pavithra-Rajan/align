import boto3
import json
from botocore.exceptions import ClientError
import logging  
logger = logging.getLogger()
logger.setLevel(logging.INFO)   

AWS_REGION = "us-east-1"
BUCKET_NAME = "align-jobs"
INPUT_JSON_FILE = "apify_results.json" 

s3_client = boto3.client('s3', region_name=AWS_REGION)

def contains_unicode(obj):
    """Check if object contains non-ASCII unicode characters"""
    if isinstance(obj, str):
        try:
            obj.encode('ascii')
            return False
        except UnicodeEncodeError:
            return True
    elif isinstance(obj, dict):
        for value in obj.values():
            if contains_unicode(value):
                return True
    elif isinstance(obj, list):
        for item in obj:
            if contains_unicode(item):
                return True
    return False

def setup_and_upload():
    # Create the Bucket
    try:
        logger.info(f"Creating bucket: {BUCKET_NAME}...")
        s3_client.create_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        if e.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
            print("Bucket already exists and is owned by you.")
        else:
            print(f"Error creating bucket: {e}")
            return

    # Load and Upload Jobs
    with open(INPUT_JSON_FILE, 'r') as f:
        jobs = json.load(f)

    print(f"Starting upload of {len(jobs)} jobs...")
    count = 0
    for i, job in enumerate(jobs):
        base_name = f"job_{i}.txt"
        count += 1

        # Upload Job Content (The 'body' of the job)
        content = job.get('ai_core_responsibilities', 'No description provided.')
        if content is None:
            content = 'No description provided.'
        # print(content)  
        
        # Upload Metadata (The 'filters' for RAG)
        skills = job.get('ai_key_skills', [])
        if skills:
            skills = skills[:10]    # for bedrock

        location = job.get('locations_derived', 'Remote')
        url = job.get('url', 'https://www.linkedin.com/jobs/view/')  # in case url is missing, provide a default one to avoid None values in metadata
        metadata = {
            "metadataAttributes": {
                "seniority": job.get('seniority', 'Entry-level'),
                "industry": job.get('linkedin_org_industry', 'General'),
                "title": job.get('title', 'Unknown Role'), 
                "skills": skills,
                "location": location,
                "url": url,
                "organization": job.get('organization', 'Unknown Organization')
            }
        }
        
        # Skip if content or metadata contains unicode
        if contains_unicode(content) or contains_unicode(metadata):
            print(f"Skipping {base_name} - contains unicode characters.")
            count -= 1
            continue

        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=f"data/{base_name}",
            Body=content,
            ContentType="text/plain"
        )
        
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=f"data/{base_name}.metadata.json",
            Body=json.dumps(metadata),
            ContentType="application/json"
        )
        print(f"Uploaded {base_name} and its metadata.")
        print(f"Metadata for {base_name}: {json.dumps(metadata)}")

        if i % 100 == 0:
            print(f"Uploaded {i} jobs...")

    print(f"Total jobs uploaded: {count} in s3://{BUCKET_NAME}/data/")

if __name__ == "__main__":
    setup_and_upload()