import os
import time
import requests
from urllib.parse import urlparse
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ANY_API_KEY = os.getenv("ANYMAILFINDER_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, ANY_API_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

# Initialize client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_domain(url):
    if not url:
        return None
    parsed = urlparse(url)
    domain = parsed.netloc
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain

def find_emails_by_company(domain):
    url = "https://api.anymailfinder.com/v5.1/find-email/company"
    payload = {
        "domain": domain
    }
    headers = {
        "Authorization": ANY_API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                emails = data.get("emails", [])
                if emails and len(emails) > 0:
                    first_email = emails[0]
                    # Check if first_email is a dict or just a string
                    if isinstance(first_email, dict):
                        return first_email.get("email"), 100
                    else:
                        return str(first_email), 100
            elif isinstance(data, list) and len(data) > 0:
                 first_item = data[0]
                 if isinstance(first_item, dict):
                     return first_item.get("email"), 100
                 else:
                     return str(first_item), 100
        else:
            print(f"  API Error {response.status_code}")
        return None, None
    except Exception as e:
        print(f"  Enrichment Error: {e}")
        return None, None

def main():
    print("Fetching Grade A leads without emails...")
    supabase.table("roofing_leads").update({"notes": None}).eq("notes", "enrichment_attempted_no_match").execute()
    
    response = supabase.table("roofing_leads").select("*").eq("grade", "A").execute()
    leads = response.data
    
    if not leads:
        print("No Grade A leads ready for enrichment.")
        return
        
    print(f"Enriching {len(leads)} leads...")
    
    found_count = 0
    
    for lead in leads:
        if lead.get("email"):
            continue 
            
        business_name = lead.get("business_name")
        website = lead.get("website_url")
        
        domain = get_domain(website)
        
        if not domain:
            continue
            
        print(f"Searching for: {business_name} ({domain})...")
        email, confidence = find_emails_by_company(domain)
        
        if email:
            print(f"  FOUND: {email}")
            supabase.table("roofing_leads").update({
                "email": email,
                "email_confidence": 100,
                "email_source": "anymailfinder_company"
            }).eq("id", lead["id"]).execute()
            found_count += 1
        else:
            print("  No match.")
            supabase.table("roofing_leads").update({
                "notes": "enrichment_attempted_no_match"
            }).eq("id", lead["id"]).execute()
            
        time.sleep(1)
        
    print(f"\nEnrichment Complete!")
    print(f"Successfully found {found_count} emails.")

if __name__ == "__main__":
    main()
