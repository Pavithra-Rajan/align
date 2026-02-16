import requests
import json
import time
import os

#  https://developer.adzuna.com/
APP_ID = os.getenv("ADZUNA_APP_ID")
APP_KEY = os.getenv("ADZUNA_APP_KEY")
COUNTRY = os.getenv("ADZUNA_COUNTRY", "us")  # Default to 'us' if not set
TOTAL_JOBS_NEEDED = 10000 
RESULTS_PER_PAGE = 100  
print(f"Using App ID: {APP_ID}")
print(f"Using App Key: {APP_KEY}")  
all_jobs = []

for page in range(1, (TOTAL_JOBS_NEEDED // RESULTS_PER_PAGE) + 1):
    print(f"Fetching page {page}...")
    
    url = f"https://api.adzuna.com/v1/api/jobs/{COUNTRY}/search/{page}"
    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "results_per_page": RESULTS_PER_PAGE,
        "content-type": "application/json"
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        all_jobs.extend(data.get('results', []))
    else:
        print(f"Error: {response.status_code}")
        break
    
    # Pause to respect rate limits
    time.sleep(1)

with open('jobs_data.json', 'w') as f:
    json.dump(all_jobs, f, indent=4)

print(f"Success! Collected {len(all_jobs)} jobs.")