import os
import csv
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

# Initialize client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_PATH = "/Users/michaeldeschenes/Downloads/roofing_leads_rows_results.csv"

def main():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {CSV_PATH}")
        return

    print(f"Reading Anymail Finder results from {CSV_PATH}...")
    
    updates = {} # Map ID -> email

    with open(CSV_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader) # Skip header
        for row in reader:
            if len(row) < 4:
                continue
            email = row[0]
            email_type = row[1]
            lead_id = row[20] if row[20] and len(row[20]) == 36 else row[3] # Fallback check for ID position
            
            # If the CSV has duplicate columns, let's be careful.
            # Looking at the sample:
            # col 0: email (verified)
            # col 1: email_type (valid/risky)
            # col 3: id (uuid)
            
            # Let's verify row[3] is a UUID
            potential_id = row[3]
            if email and email_type == "valid" and len(potential_id) == 36:
                if potential_id not in updates:
                    updates[potential_id] = email

    print(f"Found {len(updates)} unique leads to update with verified emails.")
    
    count = 0
    for lead_id, email in updates.items():
        try:
            res = supabase.table("roofing_leads").update({"email": email}).eq("id", lead_id).execute()
            count += 1
            if count % 10 == 0:
                print(f"  Updated {count} leads...")
        except Exception as e:
            print(f"  Error updating lead {lead_id}: {e}")

    print(f"\n✅ Successfully updated {count} leads with verified contact data.")
    print("Dashboard should now reflect these enriched leads.")

if __name__ == "__main__":
    main()
