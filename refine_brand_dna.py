import os
import time
import json
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Config
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

genai.configure(api_key=GEMINI_KEY)
# We use gemini-1.5-flash for speed and reliability in JSON mode
model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def refine_lead(lead):
    name = lead.get("business_name")
    primary = lead.get("brand_primary_color")
    secondary = lead.get("brand_secondary_color")
    tagline = lead.get("tagline")
    
    print(f"\n--- Refining Brand DNA: {name} ---")
    
    prompt = f"""
    You are a professional UX Designer specializing in high-conversion branding for premium roofing contractors.
    Given the following brand input, craft a "Full UX Color Kit" that will be used to generate a cinematic, Nike-style landing page.
    
    Inputs:
    - Business Name: {name}
    - Primary Scraped Color: {primary}
    - Secondary Scraped Color: {secondary}
    - Current Tagline: {tagline}
    
    Instructions:
    1. Color Harmony: Create a palette that feels masculine, professional, and expensive (premium roofing aesthetic).
    2. Accent Strategy: Select an 'accent' color that is vibrant and has high contrast against dark backgrounds (#0a0a0a or similar). If the provided colors are too dark, choose a lighter/neon version of them.
    3. Background Strategy: Decide if the site should be pure black (#0a0a0a) or a 'deep brand' background (very dark navy, charcoal, or forest green based on their primary).
    4. Typography: Pick a 'font_display' (Google Font) that is heavy and bold (like Anton, Montserrat Black, or Inter ExtraBold) and a 'font_body' that is clean (like Inter or Roboto).
    5. JSON Output: Return ONLY a JSON object with these keys:
    {{
      "accent": "#hex",
      "background": "#hex",
      "surface": "#hex (slightly lighter than background for cards)",
      "text_primary": "#hex (usually #ffffff or similar)",
      "text_secondary": "#hex (muted gray/brand color)",
      "font_display": "Google Font Name",
      "font_body": "Google Font Name",
      "palette_type": "dark"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        kit = json.loads(response.text)
        print(f"  [SUCCESS] Accent: {kit['accent']} | BG: {kit['background']} | Font: {kit['font_display']}")
        
        supabase.table("roofing_leads").update({
            "brand_ux_kit": kit,
            "brand_font": kit.get("font_display")
        }).eq("id", lead["id"]).execute()
        
    except Exception as e:
        print(f"  [ERROR] refining {name}: {e}")

def main():
    # Fetch leads that have been scraped but not yet refined into a full kit
    res = supabase.table("roofing_leads").select("*").not_.is_("brand_primary_color", "NULL").is_("brand_ux_kit", "NULL").execute()
    leads = res.data
    
    if not leads:
        print("No leads in queue for refinement.")
        return
        
    print(f"Found {len(leads)} leads to refine.")
    
    for lead in leads:
        refine_lead(lead)
        # Gentle rate limiting for Gemini
        time.sleep(1)

if __name__ == "__main__":
    main()
