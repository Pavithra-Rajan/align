import boto3
import uuid
import json

s3 = boto3.client('s3')
BUCKET_NAME = 'align-resumes-store'

def lambda_handler(event, context):
    file_name = f"{uuid.uuid4()}.pdf"
    
    # Generate a temporary URL valid for 5 minutes
    url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': BUCKET_NAME, 'Key': file_name, 'ContentType': 'application/pdf'},
        ExpiresIn=300
    )
    
    return {
        "statusCode": 200,
        "headers": { "Access-Control-Allow-Origin": "*" },
        "body": json.dumps({"uploadURL": url, "fileName": file_name})
    }