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
    2. Accent Strategy: Select an 'accent' color that is vibrant and has high contrast against dark backgrounds. If the provided colors are too dark, choose a lighter/brighter tint of them. The accent MUST have a perceptual luminance above 0.35.
    3. Background Strategy: NEVER use pure black (#0a0a0a or any color with RGB values all below 20). ALWAYS create a 'deep brand' background based on their primary color hue. Examples: blue brand -> #0d1b4f (dark navy), red brand -> #2d0a0a (deep crimson), green brand -> #0a2d1a (forest). The background must have a VISIBLE color tint — minimum RGB range of 30 between channels so it reads as a real color, not black.
    4. Surface: Must be 15-25 points lighter than background across all channels so cards are visibly distinct.
    5. Typography: Pick a 'font_display' (Google Font) that is heavy and bold (like Anton, Montserrat Black, or Inter ExtraBold) and a 'font_body' that is clean (like Inter or Roboto).
    6. JSON Output: Return ONLY a JSON object with these keys:
    {{
      "accent": "#hex — vibrant, luminance > 0.35",
      "background": "#hex — deep brand dark, NEVER pure black, must have visible color tint",
      "surface": "#hex — 15-25 points lighter than background for cards",
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
