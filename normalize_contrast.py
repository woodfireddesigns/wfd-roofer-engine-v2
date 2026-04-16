import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing env vars")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_luminance(hex_color):
    if not hex_color: return 1.0 # Default to light if missing
    hex_clean = hex_color.lstrip('#')
    if len(hex_clean) == 3: hex_clean = ''.join([c*2 for c in hex_clean])
    try:
        r, g, b = int(hex_clean[0:2],16), int(hex_clean[2:4],16), int(hex_clean[4:6],16)
        # Relative luminance formula
        return (0.299*r + 0.587*g + 0.114*b) / 255
    except: return 1.0

def main():
    print("Normalizing 81 leads for Dark/Light contrast...")
    response = supabase.table("roofing_leads").select("*").execute()
    leads = response.data
    
    count = 0
    for lead in leads:
        c1 = lead.get("brand_primary_color")
        c2 = lead.get("brand_secondary_color")
        
        if c1 and c2:
            l1 = get_luminance(c1)
            l2 = get_luminance(c2)
            
            # We want Primary to be the DARKER one (Foundation)
            # and Secondary to be the LIGHTER one (Accent)
            if l1 > l2:
                # Swap them
                print(f"  Swapping for {lead['business_name']}: {c1}(L:{l1:.2f}) <-> {c2}(L:{l2:.2f})")
                supabase.table("roofing_leads").update({
                    "brand_primary_color": c2,
                    "brand_secondary_color": c1,
                    "notes": "contrast_normalized"
                }).eq("id", lead["id"]).execute()
                count += 1
            else:
                print(f"  Correct order for {lead['business_name']} ({c1} is darker)")

    print(f"\n✅ Normalized contrast for {count} leads.")

if __name__ == "__main__":
    main()
