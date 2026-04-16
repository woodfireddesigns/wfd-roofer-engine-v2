import os
import time
import requests
import re
from bs4 import BeautifulSoup
from collections import defaultdict
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, FIRECRAWL_API_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

# Initialize client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

NEUTRAL_PATTERNS = [
    r'^#(f{3,6})$',           # whites
    r'^#(0{3,6})$',           # blacks
    r'^#([2-9a-f])\1{2,5}$',  # grays
    r'^#(e[a-f]|f[0-9a-e]){3}$', 
]

ELEMENT_WEIGHTS = {
    'header': 15,
    'nav': 15,
    'button': 12,
    'h1': 10,
    'h2': 8,
    'footer': 10,
    '.hero': 10,
    'section': 2,
    'div': 1,
}

CSS_PROPERTY_WEIGHTS = {
    'background-color': 5,
    'background': 4,
    'color': 2,
    'border-color': 2,
    'fill': 3,
}

def is_neutral(hex_color):
    hex_color = hex_color.lower().strip()
    for pattern in NEUTRAL_PATTERNS:
        if re.match(pattern, hex_color):
            return True
    hex_clean = hex_color.lstrip('#')
    if len(hex_clean) == 3: hex_clean = ''.join([c*2 for c in hex_clean])
    try:
        r, g, b = int(hex_clean[0:2],16), int(hex_clean[2:4],16), int(hex_clean[4:6],16)
        luminance = (0.299*r + 0.587*g + 0.114*b) / 255
        return luminance > 0.90 or luminance < 0.10
    except: return True

def colors_are_similar(hex1, hex2, threshold=45):
    def to_rgb(h):
        h = h.lstrip('#')
        if len(h) == 3: h = ''.join([c*2 for c in h])
        return int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    try:
        r1,g1,b1 = to_rgb(hex1)
        r2,g2,b2 = to_rgb(hex2)
        return ((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2) ** 0.5 < threshold
    except: return False

def extract_brand_colors(html):
    soup = BeautifulSoup(html, 'html.parser')
    color_scores = defaultdict(float)

    # 1. Search for HEX codes in the ENTIRE HTML source string as a base (Fallback)
    # This catches colors in minified CSS or scripts that BeautifulSoup might miss
    all_hexes = re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}(?![0-9a-fA-F])', html)
    for hex_code in all_hexes:
        if not is_neutral(hex_code):
            color_scores[hex_code.lower()] += 0.5 # Very low base weight

    # 2. Priorities tagging (The Weighted logic)
    for tag, weight in ELEMENT_WEIGHTS.items():
        els = soup.find_all(tag)
        for el in els:
            style = el.get('style', '')
            # Find hexes within the style attribute
            colors = re.findall(r'#[0-9a-fA-F]{3,6}', style)
            for color in colors:
                if not is_neutral(color):
                    color_scores[color.lower()] += weight

    # 3. Explicit Brand Classes Check
    brand_class_patterns = ['btn', 'button', 'cta', 'primary', 'hero', 'brand', 'accent']
    for el in soup.find_all(class_=True):
        classes = ' '.join(el.get('class', [])).lower()
        if any(p in classes for p in brand_class_patterns):
            style = el.get('style', '')
            colors = re.findall(r'#[0-9a-fA-F]{3,6}', style)
            for color in colors:
                if not is_neutral(color):
                    color_scores[color.lower()] += 10

    if not color_scores:
        return None, None

    sorted_colors = sorted(color_scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_colors[0][0]
    secondary = None
    for color, score in sorted_colors[1:]:
        if not colors_are_similar(color, primary):
            secondary = color
            break

    return primary, secondary

def main():
    print("Fetching leads for Unbreakable Weighted DNA Scrape...")
    response = supabase.table("roofing_leads").select("*").not_.is_("email", "NULL").execute()
    leads = response.data
    
    if not leads:
        print("No leads found.")
        return
        
    print(f"Scraping {len(leads)} leads...")
    
    for lead in leads:
        url = lead.get("website_url")
        if not url: continue
            
        print(f"\n--- DNA Extraction: {lead['business_name']} ({url}) ---")
        
        payload = {"url": url, "formats": ["html"], "waitFor": 10000}
        headers = {"Authorization": f"Bearer {FIRECRAWL_API_KEY}", "Content-Type": "application/json"}
        
        try:
            res = requests.post("https://api.firecrawl.dev/v1/scrape", json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data.get("success"):
                    html = data["data"].get("html", "")
                    primary, secondary = extract_brand_colors(html)
                    
                    # Tagline from H1
                    soup = BeautifulSoup(html, 'html.parser')
                    h1 = soup.find('h1')
                    tagline = h1.text.strip()[:200] if h1 else None
                    
                    print(f"  Result -> Primary: {primary} | Secondary: {secondary}")
                    
                    supabase.table("roofing_leads").update({
                        "brand_primary_color": primary,
                        "brand_secondary_color": secondary,
                        "tagline": tagline,
                        "notes": "unbreakable_weighted_dna_complete"
                    }).eq("id", lead["id"]).execute()
                else:
                    print(f"  Scrape failed.")
            else:
                print(f"  API error: {res.status_code}")
        except Exception as e:
            print(f"  Err: {e}")
            
        time.sleep(4)
        
    print("\n--- Unbreakable DNA Extraction Complete ---")

if __name__ == "__main__":
    main()
