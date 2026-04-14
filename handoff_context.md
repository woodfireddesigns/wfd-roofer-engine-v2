# Handoff Context: Roofer Outreach Pipeline
## Last Modified: 2026-04-13T21:30:00

### 🟢 CURRENT STATE
The project is in a **fully functional state**. The first batch of 100 leads has been scraped, scored, enriched with emails, and analyzed for Brand DNA. The Vercel dashboard is live and connected to your production Supabase database.

### 🛠️ HOW TO RESUME WORK
If you start a new session, simply run these scripts in order to continue the pipeline for new queries:

1. **Scrape:** `python3 apify_scrape.py` (Edit the script to slice the queries differently if you want to skip the first 5).
2. **Score:** `python3 filter_and_score.py` (Categorizes new leads).
3. **Enrich:** `python3 enrich_emails.py` (Finds emails for new Grade A leads).
4. **DNA:** `python3 firecrawl_brand_dna.py` (Extracts colors/taglines for new leads).

### 🔑 KEY CREDENTIALS
- All keys are stored in [`.env`](file:///Users/michaeldeschenes/Developer/Claude-Code/WFD-THE%20FORGE/.env).
- **Vercel Dashboard:** [wfd-lead-dashboard.vercel.app](https://wfd-lead-dashboard.vercel.app)
- **Supabase URL:** `https://muouevczndxcuwoxegxt.supabase.co`

### 🏗️ NEXT DEV STEPS
- **Dashboard Polish:** Add better filtering for the Grade B leads.
- **Preview Route:** Create `/app/roofing/[slug]/page.tsx` in the `dashboard` folder to show the actual design clones.
- **Git Push:** I have staged the files for you. Run `git commit -m "feat: complete automated lead pipeline and dashboard"` to save progress.

---
**Handed off by Antigravity**
