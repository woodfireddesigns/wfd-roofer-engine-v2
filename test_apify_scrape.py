import os
import json
import time
from apify_client import ApifyClient
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([APIFY_API_TOKEN, SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

# Initialize clients
apify_client = ApifyClient(APIFY_API_TOKEN)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_queries(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
        return data[:5] # ONLY TAKE FIRST 5 FOR TEST

def run_scrape(queries):
    # Apify actor: Google Maps Scraper
    actor_id = "nwua9Gu5YrADL7ZDj"
    
    run_input = {
        "searchStringsArray": queries,
        "maxCrawledPlacesPerSearch": 20,
        "language": "en",
        "countryCode": "us",
        "exportPlaceId": True
    }
    
    print(f"Starting TEST Apify run for {len(queries)} queries...")
    run = apify_client.actor(actor_id).call(run_input=run_input)
    print(f"Run completed. Dataset ID: {run['defaultDatasetId']}")
    
    return apify_client.dataset(run['defaultDatasetId']).list_items().items

def normalize_and_push(items):
    new_records = 0
    skipped_records = 0
    
    for item in items:
        place_id = item.get("placeId")
        phone = item.get("phone")
        
        # Check if place_id is None
        if not place_id:
            skipped_records += 1
            continue

        # Check for duplicates
        query = supabase.table("roofing_leads").select("id").eq("google_place_id", place_id)
        existing = query.execute()
        
        if existing.data:
            skipped_records += 1
            continue
            
        record = {
            "business_name": item.get("title"),
            "phone": phone,
            "website_url": item.get("website"),
            "address": item.get("address"),
            "city": item.get("city"),
            "state": item.get("state"),
            "zip": item.get("postalCode"),
            "google_review_count": item.get("reviewsCount", 0),
            "google_star_rating": float(item.get("totalScore")) if item.get("totalScore") else None,
            "google_maps_url": item.get("url"),
            "google_place_id": place_id,
            "has_website": bool(item.get("website")),
            "grade": "ungraded",
            "score": 0
        }
        
        try:
            supabase.table("roofing_leads").insert(record).execute()
            new_records += 1
        except Exception as e:
            print(f"Error inserting record {record['business_name']}: {e}")
            skipped_records += 1
            
    return new_records, skipped_records

def main():
    queries = load_queries("apify_queries.json")
    print(f"Running test for: {queries}")
    
    try:
        items = run_scrape(queries)
        new, skipped = normalize_and_push(items)
        print(f"\nTEST COMPLETE: {new} new records added, {skipped} skipped.")
    except Exception as e:
        print(f"Error processing test: {e}")

if __name__ == "__main__":
    main()
