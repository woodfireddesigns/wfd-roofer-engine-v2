"""
fetch_reviews.py

Fetches real Google review text for every lead that has a google_place_id,
using the Apify Google Maps Reviews Scraper (actor: Xb8osYTwd23knoXjp).

Stores up to 5 review snippets + reviewer first names in roofing_leads:
  - review_snippets  TEXT[]
  - review_authors   TEXT[]   ← column added by this script if missing

Run:
  python fetch_reviews.py            # process all leads without reviews
  python fetch_reviews.py --all      # re-fetch even leads that already have reviews
"""

import os
import sys
import time
import json
from supabase import create_client, Client
from apify_client import ApifyClient
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")

if not all([SUPABASE_URL, SUPABASE_KEY, APIFY_TOKEN]):
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or APIFY_API_TOKEN")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
apify = ApifyClient(APIFY_TOKEN)

# Apify actor: Google Maps Reviews Scraper
ACTOR_ID = "Xb8osYTwd23knoXjp"
MAX_REVIEWS_PER_LEAD = 5
MIN_STARS = 4          # only pull 4-5 star reviews for the preview
DELAY_BETWEEN_RUNS = 3  # seconds


def ensure_review_authors_column():
    """
    review_authors doesn't exist yet in roofing_leads.
    Run this SQL in Supabase if the column is missing:
      ALTER TABLE roofing_leads ADD COLUMN IF NOT EXISTS review_authors text[];
    This function just prints the reminder — schema changes need the SQL editor.
    """
    try:
        supabase.table("roofing_leads").select("review_authors").limit(1).execute()
    except Exception:
        print(
            "\n⚠️  Column 'review_authors' is missing from roofing_leads.\n"
            "   Run this in the Supabase SQL editor before continuing:\n\n"
            "   ALTER TABLE roofing_leads ADD COLUMN IF NOT EXISTS review_authors text[];\n"
        )
        sys.exit(1)


def fetch_reviews_for_place(place_id: str, business_name: str):
    """
    Calls the Apify Google Maps Reviews Scraper for one place_id.
    Returns (snippets: list[str], authors: list[str]) — up to MAX_REVIEWS_PER_LEAD items.
    """
    print(f"  Fetching reviews for {business_name} ({place_id})...")

    run_input = {
        "placeIds": [place_id],
        "maxReviews": 20,           # fetch more so we can filter for quality
        "reviewsSort": "relevant",
        "language": "en",
    }

    try:
        run = apify.actor(ACTOR_ID).call(run_input=run_input)
        items = list(apify.dataset(run["defaultDatasetId"]).iterate_items())
    except Exception as e:
        print(f"  Apify error: {e}")
        return None, None

    snippets = []
    authors = []

    for item in items:
        stars = item.get("stars") or item.get("rating") or 0
        text = (item.get("text") or item.get("reviewText") or "").strip()

        if stars < MIN_STARS or not text or len(text) < 40:
            continue

        # First name only for privacy
        full_name = item.get("name") or item.get("reviewerName") or "Verified Customer"
        first_name = full_name.strip().split()[0] if full_name.strip() else "Verified Customer"
        author = f"{first_name} {full_name.strip().split()[-1][0]}." if len(full_name.strip().split()) > 1 else first_name

        snippets.append(text[:300])   # cap at 300 chars for display
        authors.append(author)

        if len(snippets) >= MAX_REVIEWS_PER_LEAD:
            break

    if not snippets:
        print(f"  No qualifying reviews found.")
        return None, None

    print(f"  Got {len(snippets)} reviews.")
    return snippets, authors


def process_all(refetch: bool = False):
    """Fetch reviews for all leads that have a google_place_id."""
    query = supabase.table("roofing_leads").select(
        "id, business_name, google_place_id, review_snippets"
    ).not_.is_("google_place_id", "null")

    if not refetch:
        query = query.is_("review_snippets", "null")

    leads = query.execute().data
    print(f"\nProcessing {len(leads)} leads...\n")

    success = 0
    failed = 0

    for lead in leads:
        place_id = lead["google_place_id"]
        name = lead["business_name"]

        snippets, authors = fetch_reviews_for_place(place_id, name)

        if snippets:
            supabase.table("roofing_leads").update(
                {"review_snippets": snippets, "review_authors": authors}
            ).eq("id", lead["id"]).execute()
            success += 1
        else:
            failed += 1

        time.sleep(DELAY_BETWEEN_RUNS)

    print(f"\n✓  Done. {success} leads enriched, {failed} skipped (no qualifying reviews).")


if __name__ == "__main__":
    ensure_review_authors_column()
    refetch = "--all" in sys.argv
    process_all(refetch=refetch)
