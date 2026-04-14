# Wood Fired Designs — Roofer Outreach Engine
## Master Build Manifest — April 13, 2026

### 🏗️ WHAT HAS BEEN BUILT

#### Phase 1: Database & Schema
- ✅ **Supabase Infrastructure:** `roofing_leads` table created with 45 columns to track business info, Brand DNA, technical signals, and outreach status.
- ✅ **Targeting:** `apify_queries.json` generated with 102 target market queries across the Mid-Atlantic/East Coast.

#### Phase 2: Lead Harvest
- ✅ **Google Maps Scraper:** Integrated Apify Actor `nwua9Gu5YrADL7ZDj`.
- ✅ **First Batch:** 100 high-quality roofing leads harvested and injected into Supabase.

#### Phase 3: Qualitative Scoring
- ✅ **Logic Engine:** Created `filter_and_score.py` with custom business logic (Grade A = Score 6+).
- ✅ **Results:** 59 leads promoted to **Grade A** (Top Tier) based on reputation, location, and web status.

#### Phase 4: Email Enrichment
- ✅ **Verification Pipeline:** Created `enrich_emails.py` using Anymail Finder v5.1.
- ✅ **Conversion:** Successfully found and verified direct business emails for Grade A prospects.

#### Phase 5: Brand DNA Extraction
- ✅ **Firecrawl Integration:** Developed `firecrawl_brand_dna.py` to scrape prospect websites for primary brand colors and taglines.
- ✅ **Technical Audit:** Extraction of primary hex colors and tagline data complete for the first batch.

#### Phase 6: Command Center Dashboard
- ✅ **Next.js App:** Built a high-fidelity admin dashboard in `/dashboard`.
- ✅ **Live Deployment:** Deployed to Vercel at [wfd-lead-dashboard.vercel.app](https://wfd-lead-dashboard.vercel.app).
- ✅ **Outreach UI:** One-click email queue with personalized templates based on individual lead data.

---

### 🚀 WHAT STILL NEEDS TO BE DONE

#### 1. Automated Harvesting (Cron)
- [ ] Set up a GitHub Action or Vercel Cron to run the scraping/scoring pipeline weekly to keep the dashboard fresh.

#### 2. Full-Scale Enrichment
- [ ] Run the remaining 97 queries from `apify_queries.json` to populate the database with ~2,000+ leads.

#### 3. Outlook Integration
- [ ] Implement MS Graph API or Resend for automated mass-personalized sending if you want to move beyond the manual `mailto:` queue.

#### 4. Preview Page Engine
- [ ] Build the "Website Preview" route (`/roofing/[slug]`) that dynamically renders a high-end Wood Fired Design using the lead's Brand DNA.

---

### 📂 REPOSITORY STRUCTURE
- `/apify_queries.json` — Target market queries.
- `/apify_scrape.py` — Lead discovery engine.
- `/filter_and_score.py` — Lead qualification logic.
- `/enrich_emails.py` — Contact retrieval pipeline.
- `/firecrawl_brand_dna.py` — Brand DNA extraction.
- `/dashboard/` — Next.js Admin Command Center.
- `.env` — Global API credentials.
