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
    """
    Improved enrichment logic with polling and status verification.
    """
    url = "https://api.anymailfinder.com/v5.1/find-email/company"
    payload = {
        "domain": domain
    }
    headers = {
        "Authorization": ANY_API_KEY,
        "Content-Type": "application/json"
    }
    
    # Retry loop for pending results (Long Poll)
    max_retries = 6
    retry_delay = 10 # 10 seconds between retries
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                
                # Check for definitive status keys as requested by user
                # AMF v5.1 standard response structure for company:
                # { "emails": [...], "status": "ok", "metadata": {...} }
                
                status = data.get("status")
                emails = data.get("emails", [])
                
                if status == "pending":
                    print(f"  Attempt {attempt + 1}: Status pending, waiting {retry_delay}s...")
                    time.sleep(retry_delay)
                    continue
                
                # If we get here, status is definitive (ok, not_found, etc.)
                if emails and len(emails) > 0:
                    # Pick the highest quality one
                    for email_obj in emails:
                        if isinstance(email_obj, dict):
                            email = email_obj.get("email")
                            v_status = email_obj.get("status") # valid, risky, etc.
                            if v_status in ["valid", "risky"]:
                                return email, v_status
                        else:
                            return str(email_obj), "valid"
                
                if status == "not_found":
                    return None, "not_found"
                    
                return None, status
            elif response.status_code == 202: # Often used for 'Accepted / Processing'
                print(f"  Attempt {attempt + 1}: 202 Accepted, waiting {retry_delay}s...")
                time.sleep(retry_delay)
                continue
            else:
                print(f"  API Error {response.status_code}")
                return None, f"error_{response.status_code}"
                
        except Exception as e:
            print(f"  Enrichment Error: {e}")
            return None, "exception"
            
    return None, "timeout"

def main():
    print("Fetching Grade A leads without emails...")
    # Clear previous failed match notes to retry with new logic
    supabase.table("roofing_leads").update({"notes": None}).eq("notes", "enrichment_attempted_no_match").execute()
    
    response = supabase.table("roofing_leads").select("*").eq("grade", "A").is_("email", "NULL").execute()
    leads = response.data
    
    if not leads:
        print("No Grade A leads ready for enrichment.")
        return
        
    print(f"Enriching {len(leads)} leads with Long-Poll logic...")
    
    found_count = 0
    
    for lead in leads:
        business_name = lead.get("business_name")
        website = lead.get("website_url")
        
        domain = get_domain(website)
        
        if not domain:
            continue
            
        print(f"Searching for: {business_name} ({domain})...")
        email, status = find_emails_by_company(domain)
        
        if email:
            print(f"  FOUND [{status.upper()}]: {email}")
            supabase.table("roofing_leads").update({
                "email": email,
                "email_confidence": 100 if status == "valid" else 50,
                "email_source": f"anymailfinder_{status}"
            }).eq("id", lead["id"]).execute()
            found_count += 1
        else:
            print(f"  No match ({status}).")
            supabase.table("roofing_leads").update({
                "notes": f"enrichment_{status}"
            }).eq("id", lead["id"]).execute()
            
        # Small delay between different domains to avoid rate limits
        time.sleep(2)
        
    print(f"\nEnrichment Complete!")
    print(f"Successfully found {found_count} new emails.")

if __name__ == "__main__":
    main()
