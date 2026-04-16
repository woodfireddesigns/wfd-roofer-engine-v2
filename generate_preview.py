import os
import re
import random
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_URL = "https://roofer-preview-site.vercel.app"

# ---------------------------------------------------------------------------
# Generic content — used when a lead's real data hasn't been scraped yet
# ---------------------------------------------------------------------------

DEFAULT_SERVICES = [
    "Asphalt Shingles",
    "Metal Roofing",
    "Flat & Low-Slope Roofing",
    "Roof Repair",
    "Emergency Roof Repair",
    "Gutter Installation & Repair",
    "Roof Inspection",
    "Storm Damage Restoration",
    "Insurance Claims Assistance",
    "Ventilation & Skylights",
]

DEFAULT_CERTIFICATIONS = [
    "Licensed & Insured",
    "GAF Certified Contractor",
    "Owens Corning Preferred Contractor",
    "BBB Accredited Business",
]

HERO_TEMPLATES = [
    "BUILT TO OUTLAST THE STORM.",
    "YOUR HOME. OUR LEGACY.",
    "PROTECTION FORGED IN CRAFTSMANSHIP.",
    "THE ROOF THAT STANDS WHEN IT MATTERS.",
    "STRENGTH OVERHEAD. PEACE OF MIND INSIDE.",
]


def slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    slug = re.sub(r"^-+|-+$", "", slug)
    return slug[:50]


def get_luminance(hex_color: str) -> float:
    """Returns perceptual luminance 0.0 (black) → 1.0 (white)."""
    if not hex_color:
        return 1.0
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join([c * 2 for c in h])
    try:
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255
    except Exception:
        return 1.0


def pick_accent_color(primary, secondary) -> str:
    """
    Selects the best accent color for rendering on a near-black (#0a0a0a) background.

    normalize_contrast.py stores the DARKER color as brand_primary_color and the
    LIGHTER one as brand_secondary_color. That is the opposite of what we need for
    --brand-accent on a dark canvas: we want the LIGHTER / more vibrant color.

    Strategy:
      1. If primary luminance >= 0.3  →  primary is visible enough, use it.
      2. If primary is too dark but secondary is visible  →  use secondary.
      3. Both too dark or missing  →  fall back to WFD gold.
    """
    FALLBACK = "#c5a059"
    MIN_LUMINANCE = 0.3  # increased to ensure visibility

    if primary and get_luminance(primary) >= MIN_LUMINANCE:
        return primary
    if secondary and get_luminance(secondary) >= MIN_LUMINANCE:
        return secondary
    return FALLBACK


def build_hero_copy(lead: dict) -> str:
    """
    Uses the lead's real tagline when available, otherwise picks a dramatic template.
    Tagline is uppercased and truncated to fit the hero display type.
    """
    tagline = lead.get("tagline") or ""
    # Strip newlines, collapse whitespace
    tagline = re.sub(r"\s+", " ", tagline).strip()
    # Skip placeholder error strings from earlier scrape attempts
    skip_patterns = ["403", "404", "forbidden", "not found", "error"]
    if tagline and not any(p in tagline.lower() for p in skip_patterns):
        return tagline.upper()[:120]
    return random.choice(HERO_TEMPLATES)


def create_preview(lead_id: str) -> str:
    """
    Maps one roofing_leads record into lead_queue and returns the preview URL.
    Safe to call multiple times — uses upsert on slug.
    """
    result = (
        supabase.table("roofing_leads").select("*").eq("id", lead_id).single().execute()
    )
    lead = result.data
    if not lead:
        raise ValueError(f"Lead {lead_id} not found")

    slug = slugify(lead["business_name"])

    # Handle slug collisions by appending city
    existing = (
        supabase.table("lead_queue").select("slug").eq("slug", slug).execute()
    )
    if existing.data:
        city_slug = slugify(lead.get("city") or "co")
        slug = f"{slug}-{city_slug}"

    accent = pick_accent_color(
        lead.get("brand_primary_color"),
        lead.get("brand_secondary_color"),
    )

    hero_copy = build_hero_copy(lead)

    # service_area: prefer scraped array, fall back to [city]
    service_area = lead.get("service_areas") or []
    if not service_area and lead.get("city"):
        service_area = [lead["city"]]

    # review_snippets and review_authors must stay in sync (parallel arrays)
    review_snippets = lead.get("review_snippets") or None
    review_authors = lead.get("review_authors") or None  # may not exist yet — Phase 5 enrichment

    queue_record = {
        "slug": slug,
        "company_name": lead["business_name"],
        "hero_copy": hero_copy,
        "brand_color_accent": accent,
        "brand_color_dark": "#0a0a0a",
        "brand_color_light": "#f5f5f4",
        "brand_font": lead.get("brand_font") or None,
        "service_area": service_area,
        "services": lead.get("services") or DEFAULT_SERVICES,
        "logo_url": lead.get("logo_url") or "",
        "review_snippets": review_snippets,
        "review_authors": review_authors,
        "certifications": lead.get("certifications") or DEFAULT_CERTIFICATIONS,
        "owner_name": lead.get("owner_name") or None,
        "city": lead.get("city") or None,
        "state": lead.get("state") or None,
        "google_review_count": lead.get("google_review_count") or None,
        "google_star_rating": lead.get("google_star_rating") or None,
    }

    supabase.table("lead_queue").upsert(queue_record, on_conflict="slug").execute()

    preview_url = f"{BASE_URL}/roofing/{slug}"
    supabase.table("roofing_leads").update(
        {"site_url": preview_url, "site_generated": True}
    ).eq("id", lead_id).execute()

    print(f"✓  Preview created: {preview_url}")
    print(f"   accent={accent}  hero='{hero_copy[:50]}...'")
    return preview_url


def batch_generate(force=False):
    """
    Processes all leads in roofing_leads.
    - Generates and saves slugs for everyone.
    - Creates lead_queue entries for those with Brand DNA.
    """
    # Fetch all leads
    result = supabase.table("roofing_leads").select("*").execute()
    leads = result.data
    if not leads:
        print("No leads found in roofing_leads")
        return

    print(f"Processing {len(leads)} leads...")
    
    # Keep track of slugs in a local set to avoid collisions within the same batch run
    used_slugs = set()
    
    for lead in leads:
        # 1. Generate slug if missing or force
        current_slug = lead.get("slug")
        if not current_slug or force:
            base_slug = slugify(lead["business_name"])
            new_slug = base_slug
            
            # Simple collision detection
            counter = 1
            while new_slug in used_slugs:
                if lead.get("city"):
                    city_slug = slugify(lead["city"])
                    new_slug = f"{base_slug}-{city_slug}"
                    # If even with city it exists, add number
                    if new_slug in used_slugs:
                         new_slug = f"{base_slug}-{city_slug}-{counter}"
                else:
                    new_slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Update roofing_leads with the slug
            try:
                supabase.table("roofing_leads").update({"slug": new_slug}).eq("id", lead["id"]).execute()
                lead["slug"] = new_slug
                print(f"Generated slug: {new_slug} for {lead['business_name']}")
            except Exception as e:
                print(f"Error saving slug {new_slug} for {lead['business_name']}: {e}")
                continue

        used_slugs.add(lead["slug"])

        # 2. If has Brand DNA, create/update preview in lead_queue
        if lead.get("brand_primary_color"):
            try:
                create_preview(lead["id"])
            except Exception as e:
                print(f"Error creating preview for {lead['business_name']}: {e}")


if __name__ == "__main__":
    import sys

    # Support batch flag
    if "--batch" in sys.argv:
        batch_generate(force="--force" in sys.argv)
    elif len(sys.argv) > 1:
        # Assume it's a lead_id
        try:
            url = create_preview(sys.argv[1])
            print(url)
        except Exception as e:
            # Maybe it's a list?
            print(f"Error: {e}")
    else:
        print("Usage:")
        print("  python generate_preview.py --batch           (Process all leads)")
        print("  python generate_preview.py <lead_id>        (Process single lead)")
        print("\nDry-run with G. Fedale Roofing and Siding:")
        # ... rest of dry run code ...
        test_lead = {
            "id": "7352c7f3-f70a-4dab-884f-2006c67a69ac",
            "business_name": "G. Fedale Roofing and Siding",
            "brand_primary_color": "#0188ce",
            "brand_secondary_color": "#e2e2e2",
            "brand_font": None,
            "service_areas": None,
            "services": None,
            "logo_url": None,
            "review_snippets": None,
            "review_authors": None,
            "certifications": None,
            "owner_name": None,
            "city": "Berlin",
            "state": "Maryland",
            "google_review_count": 16,
            "google_star_rating": 5.0,
            "tagline": "Berlin\u2019s #1 Exterior Remodeler\nServing Southern Maryland",
        }
        accent = pick_accent_color(
            test_lead["brand_primary_color"], test_lead["brand_secondary_color"]
        )
        hero = build_hero_copy(test_lead)
        slug = slugify(test_lead["business_name"])
        print(f"  slug:   {slug}")
        print(f"  accent: {accent}  (luminance={get_luminance(accent):.3f})")
        print(f"  hero:   {hero}")
        print(f"  url:    {BASE_URL}/roofing/{slug}")
