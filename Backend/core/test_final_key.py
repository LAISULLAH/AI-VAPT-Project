# test_key_final.py
import requests
import json

api_key = "a7e3e094-9ae1-4db7-afa8-1c9709a43a25"
print(f"Testing API Key: {api_key}")

# Direct API call to NVD
headers = {
    "apiKey": api_key
}

params = {
    "cpeName": "cpe:2.3:a:nginx:nginx:1.24.0",
    "resultsPerPage": 5
}

try:
    response = requests.get(
        "https://services.nvd.nist.gov/rest/json/cves/2.0",
        params=params,
        headers=headers,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        vulns = data.get('vulnerabilities', [])
        print(f"✅ API KEY WORKING! Found {len(vulns)} CVEs")
        for vuln in vulns[:3]:
            cve = vuln['cve']
            print(f"  - {cve['id']}")
    elif response.status_code == 403:
        print("❌ API KEY INVALID or RATE LIMITED")
    else:
        print(f"❌ Error: {response.status_code}")
        
except Exception as e:
    print(f"❌ Exception: {e}")