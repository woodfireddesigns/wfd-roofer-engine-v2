import os
import time
import requests
import re
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
PAGESPEED_API_KEY = os.getenv("PAGESPEED_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, FIRECRAWL_API_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

# Initialize client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_colors(html):
    # Simple regex to find hex colors in HTML/CSS
    hex_colors = re.findall(r'#[0-9a-fA-F]{3,6}', html)
    # Filter out common extremes (white/black)
    filtered = [c for c in hex_colors if c.lower() not in ['#ffffff', '#000000', '#fff', '#000']]
    if not filtered:
        return None, None
    
    # Get top 2 most frequent
    counts = {}
    for c in filtered:
        counts[c] = counts.get(c, 0) + 1
    
    sorted_colors = sorted(counts, key=counts.get, reverse=True)
    primary = sorted_colors[0]
    secondary = sorted_colors[1] if len(sorted_colors) > 1 else None
    return primary, secondary

def run_pagespeed(url):
    if not PAGESPEED_API_KEY:
        return None
    api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile&key={PAGESPEED_API_KEY}"
    try:
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            score = data.get("lighthouseResult", {}).get("categories", {}).get("performance", {}).get("score", 0)
            return int(score * 100)
    except:
        return None
    return None

def main():
    print("Fetching Grade A leads for Brand DNA extraction...")
    response = supabase.table("roofing_leads").select("*").eq("grade", "A").is_("brand_primary_color", "NULL").execute()
    leads = response.data
    
    if not leads:
        print("No Grade A leads ready for Brand DNA extraction.")
        return
        
    print(f"Processing {len(leads)} leads...")
    
    for lead in leads:
        url = lead.get("website_url")
        if not url:
            continue
            
        print(f"Scraping: {url}...")
        
        # Firecrawl Scrape
        fc_url = "https://api.firecrawl.dev/v1/scrape"
        payload = {
            "url": url,
            "formats": ["html", "markdown"]
        }
        headers = {
            "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(fc_url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    html = data["data"].get("html", "")
                    markdown = data["data"].get("markdown", "")
                    
                    # Extract Colors
                    primary, secondary = extract_colors(html)
                    
                    # Extract Tagline (First H1)
                    soup = BeautifulSoup(html, 'html.parser')
                    h1 = soup.find('h1')
                    tagline = h1.text.strip() if h1 else None
                    
                    # Technical Signals
                    pagespeed = run_pagespeed(url)
                    
                    print(f"  Primary Color: {primary}")
                    print(f"  PageSpeed Score: {pagespeed}")
                    
                    supabase.table("roofing_leads").update({
                        "brand_primary_color": primary,
                        "brand_secondary_color": secondary,
                        "tagline": tagline,
                        "pagespeed_mobile": pagespeed
                    }).eq("id", lead["id"]).execute()
                else:
                    print(f"  Scrape failed: {data.get('error')}")
            else:
                print(f"  Firecrawl Error {response.status_code}")
        except Exception as e:
            print(f"  Error processing {url}: {e}")
            
        time.sleep(2) # Protect API limits
        
    print("\nPhase 5 Complete!")

if __name__ == "__main__":
    main()
