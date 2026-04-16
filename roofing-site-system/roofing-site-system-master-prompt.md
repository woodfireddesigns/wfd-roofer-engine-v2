# Roofing Preview Site System — Master Build Prompt
### For: Gemini 2.5 Flash in Antigravity
### Project: Wood Fired Designs — Dynamic Lead Preview Sites

---

## HOW TO USE THIS PROMPT

Read this entire document before touching any code. You are refactoring and extending an existing working MVP — not building from scratch. Respect what already works. Only change what is explicitly listed as needing change.

At the start of each phase, give a short summary of what you are about to do. At the end of each phase, summarize what changed, confirm it works, and wait for the user to say "confirmed" or "next" before proceeding.

Do not write code that depends on environment variables before those variables are confirmed. Do not refactor the entire codebase when a targeted edit will do.

---

## WHAT THIS SYSTEM IS

A single Vite + React app deployed once to Vercel. It serves personalized roofing landing pages for cold outreach leads. Each lead gets a unique URL:

```
https://your-app.vercel.app/roofing/their-slug
```

When a roofing contractor clicks that link, the page loads in milliseconds and renders a fully personalized landing page using their brand colors, their company name, their services, their real Google review snippets, and their service areas — all pulled live from Supabase.

There are zero new builds per lead. One deployment. One app. Infinite personalized pages.

The goal: the contractor opens this link, sees their own brand reflected back at them in a cinematic, premium website, and thinks — "if they did this for free, what happens when I actually hire them?"

---

## EXISTING STACK — DO NOT CHANGE

- React 19 + Vite 6
- Tailwind CSS v4 (via @tailwindcss/vite)
- Framer Motion (via `motion` package)
- React Router DOM v7
- Supabase JS client
- Lucide React icons
- TypeScript
- Deployed to Vercel

The routing is already built. `App.tsx` routes `/roofing/:slug` to `RoofingPage`. Do not change the router setup.

---

## PHASE 0 — CREDENTIALS AND ENVIRONMENT

Before writing any code, confirm the following with the user:

**Checklist:**
- [ ] Supabase Project URL
- [ ] Supabase Anon Key (public, safe for client-side)
- [ ] Vercel project connected and CLI authenticated
- [ ] Node.js installed (v18+)

Ask the user to confirm their `.env.local` file contains:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Confirm the existing `src/lib/supabase.ts` uses `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. If it uses different variable names, flag it and fix it before proceeding.

Ask the user to run `npm install` and `npm run dev` to confirm the MVP loads at `localhost:3000` before you change anything.

**Do not proceed to Phase 1 until the user confirms the app runs locally.**

---

## PHASE 1 — SUPABASE TABLE UPDATE

**Summary:** We are updating the Supabase `lead_queue` table to support the full brand DNA the system needs. The current table only has 5 fields. We need to expand it.

### Current table fields (from MVP):
```
company_name, hero_copy, brand_color, service_area[], logo_url
```

### New fields to add:

Run these ALTER TABLE statements in the Supabase SQL editor. Show the user exactly what to run and ask them to confirm execution:

```sql
-- Add secondary accent color (their brand gold/red/blue equivalent)
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_color_accent text;

-- Add dark base color (their primary dark — navy, forest, obsidian, etc.)
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_color_dark text DEFAULT '#0a0a0a';

-- Add light/text color
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_color_light text DEFAULT '#f5f5f4';

-- Add brand font name (Google Fonts compatible name or null)
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_font text;

-- Add real review snippets from their site
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS review_snippets text[];

-- Add services list
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS services text[];

-- Add reviewer names (parallel array to review_snippets)
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS review_authors text[];

-- Add certifications
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS certifications text[];

-- Add owner name
ALTER TABLE lead_quote ADD COLUMN IF NOT EXISTS owner_name text;

-- Add city and state
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS state text;

-- Add Google review count and star rating
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS google_review_count integer;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS google_star_rating numeric(3,1);

-- Add page view tracking
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS preview_views integer DEFAULT 0;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz;
```

After the user confirms execution, move to Phase 2.

---

## PHASE 2 — COLOR ARCHITECTURE REFACTOR

**Summary:** Right now `#c5a059` (gold) and `#0a0a0a` (obsidian) are hardcoded in 40+ places throughout `RoofingPage.tsx`. We are replacing every hardcoded color reference with CSS custom properties that get set dynamically from Supabase data. This is the most important change in the entire build.

### The new color model:

| Variable | Role | Source | Fallback |
|---|---|---|---|
| `--brand-accent` | Primary accent — buttons, highlights, gold equivalent | `brand_color_accent` from Supabase | `#c5a059` |
| `--brand-dark` | Dark base — page background, dark sections | `brand_color_dark` from Supabase | `#0a0a0a` |
| `--brand-light` | Light text/backgrounds | `brand_color_light` from Supabase | `#f5f5f4` |

### How to implement:

In `RoofingPage.tsx`, add a `useEffect` that sets CSS custom properties on the document root as soon as data loads:

```typescript
useEffect(() => {
  if (!data) return;
  const root = document.documentElement;
  root.style.setProperty('--brand-accent', data.brand_color_accent || '#c5a059');
  root.style.setProperty('--brand-dark', data.brand_color_dark || '#0a0a0a');
  root.style.setProperty('--brand-light', data.brand_color_light || '#f5f5f4');
  
  // Cleanup on unmount
  return () => {
    root.style.removeProperty('--brand-accent');
    root.style.removeProperty('--brand-dark');
    root.style.removeProperty('--brand-light');
  };
}, [data]);
```

### Then do a full find-and-replace throughout RoofingPage.tsx:

Replace all instances of:
- `#c5a059` → `var(--brand-accent)` in inline styles, or `[--brand-accent]` in Tailwind arbitrary values
- `#0a0a0a` → `var(--brand-dark)`
- `#f5f5f4` → `var(--brand-light)`
- `data.brand_color` → `var(--brand-accent)` (the old single field is now replaced by the CSS var system)

**Important:** Where colors are used in Tailwind class strings like `bg-[#c5a059]` or `text-[#0a0a0a]`, convert them to inline styles using `style={{ backgroundColor: 'var(--brand-accent)' }}` since Tailwind arbitrary values do not support CSS custom properties at runtime.

**Also update `index.css`:**
Replace the static theme values with CSS var defaults:
```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Bebas Neue", sans-serif;
  --font-tight: "Inter Tight", sans-serif;
}

:root {
  --brand-accent: #c5a059;
  --brand-dark: #0a0a0a;
  --brand-light: #f5f5f4;
}
```

**After this phase:** The page should look identical to the MVP with the fallback colors, but every color is now driven by CSS variables. Confirm this by running `npm run dev` and checking that the preview still renders at `/roofing/apex-heritage`.

---

## PHASE 3 — INTERFACE AND DATA EXPANSION

**Summary:** We are updating the TypeScript interface and Supabase query to fetch all the new fields, and updating the mock data to include realistic examples.

### Update the `LeadQueueData` interface:

```typescript
interface LeadQueueData {
  company_name: string;
  hero_copy: string;
  brand_color_accent: string;
  brand_color_dark: string;
  brand_color_light: string;
  brand_font: string | null;
  service_area: string[];
  services: string[] | null;
  logo_url: string;
  review_snippets: string[] | null;
  review_authors: string[] | null;
  certifications: string[] | null;
  owner_name: string | null;
  city: string | null;
  state: string | null;
  google_review_count: number | null;
  google_star_rating: number | null;
  slug: string;
}
```

### Update the Supabase query:

```typescript
const { data: dbData, error } = await supabase
  .from("lead_queue")
  .select(`
    company_name, hero_copy, brand_color_accent, brand_color_dark,
    brand_color_light, brand_font, service_area, services, logo_url,
    review_snippets, review_authors, certifications, owner_name,
    city, state, google_review_count, google_star_rating, slug
  `)
  .eq("slug", slug)
  .single();
```

### Add a page view tracker:

After a successful data fetch, fire a separate upsert to increment the view count:

```typescript
await supabase.rpc('increment_preview_views', { lead_slug: slug });
```

Create this Postgres function in Supabase SQL editor (show the user this SQL and ask them to run it):

```sql
CREATE OR REPLACE FUNCTION increment_preview_views(lead_slug text)
RETURNS void AS $$
  UPDATE lead_queue 
  SET preview_views = COALESCE(preview_views, 0) + 1,
      last_viewed_at = now()
  WHERE slug = lead_slug;
$$ LANGUAGE sql;
```

This tells you in the command center dashboard when a lead has actually opened their preview. That's a hot signal.

### Update MOCK_DATA to be realistic and comprehensive:

```typescript
const MOCK_DATA: LeadQueueData = {
  company_name: "Apex Forge Roofing",
  hero_copy: "UNFAILING PROTECTION FOR GENERATIONS.",
  brand_color_accent: "#c5a059",
  brand_color_dark: "#0a0a0a",
  brand_color_light: "#f5f5f4",
  brand_font: null,
  service_area: ["Salisbury", "Ocean City", "Easton", "Cambridge", "Crisfield", "Pocomoke", "Berlin", "Snow Hill"],
  services: ["Asphalt Shingles", "Metal Roofing", "Slate", "Gutters", "Emergency Repair", "Commercial"],
  logo_url: "",
  review_snippets: [
    "The crew was meticulous. They didn't just build a roof — they engineered a shield for our home.",
    "Uncompromising quality and absolute professionalism from the first handshake to the final inspection.",
    "When the storm hit, their emergency response was immediate. True architectural authority."
  ],
  review_authors: ["James T.", "Sarah L.", "Michael R."],
  certifications: ["GAF Master Elite", "Owens Corning Preferred", "BBB A+"],
  owner_name: "Mike",
  city: "Salisbury",
  state: "MD",
  google_review_count: 87,
  google_star_rating: 4.8,
  slug: "apex-heritage"
};
```

---

## PHASE 4 — DYNAMIC FONT LOADING

**Summary:** If a lead's brand font is detected from Firecrawl, we load it dynamically from Google Fonts and apply it to the display elements. If not, we fall back to Bebas Neue.

Add this to the `useEffect` that sets CSS variables:

```typescript
// Dynamic font loading
if (data.brand_font) {
  const fontName = data.brand_font;
  const fontSlug = fontName.replace(/\s+/g, '+');
  
  // Check if already loaded
  const existingLink = document.querySelector(`link[data-brand-font]`);
  if (existingLink) existingLink.remove();
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}:wght@400;700;900&display=swap`;
  link.setAttribute('data-brand-font', 'true');
  document.head.appendChild(link);
  
  // Apply to display elements
  document.documentElement.style.setProperty('--font-display', `"${fontName}", sans-serif`);
} else {
  document.documentElement.style.setProperty('--font-display', '"Bebas Neue", sans-serif');
}
```

This means if a lead uses Oswald, Montserrat, or any Google Font we detected, their own font family shows up in their preview. That detail alone will make contractors do a double-take.

---

## PHASE 5 — LIVE DATA WIRING IN COMPONENTS

**Summary:** Wire all the new dynamic data into the components that currently use static/hardcoded content.

### 5a — Testimonials: Replace static array with real reviews

The `TESTIMONIALS` constant is currently hardcoded. Replace the `TestimonialsSection` component to accept and use real review data:

Update the component signature:
```typescript
function TestimonialsSection({ reviews, authors }: { 
  reviews: string[], 
  authors: string[] 
})
```

Update the call in the main render:
```typescript
<TestimonialsSection 
  reviews={data.review_snippets || MOCK_DATA.review_snippets!}
  authors={data.review_authors || MOCK_DATA.review_authors!}
/>
```

Inside the component, replace `TESTIMONIALS[currentIndex].quote` with `reviews[currentIndex]` and `.author` with `authors[currentIndex]`. Remove the `.role` field or replace with "Verified Customer".

If `reviews` array has fewer than 3 items, pad with the mock reviews silently.

### 5b — SpecSheet: Replace static services with dynamic list

Update `SpecSheetSection` to accept a `services` prop:
```typescript
function SpecSheetSection({ services }: { services: string[] })
```

Map the incoming services array to the existing `services` format. Keep the image mapping — use a lookup object to match common roofing service names to the Unsplash image URLs already in use. Any unmatched service gets a default roofing image.

Service-to-image map:
```typescript
const serviceImages: Record<string, string> = {
  "asphalt": "https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=1200",
  "metal": "https://images.unsplash.com/photo-1516655855035-d5215be56042?q=80&w=1200",
  "slate": "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1200",
  "gutters": "https://images.unsplash.com/photo-1621905235277-f25426d51790?q=80&w=1200",
  "emergency": "https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=1200",
  "commercial": "https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=1200",
  "default": "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200"
};
```

Match by checking if the service string (lowercased) contains any of the keys.

### 5c — Trust Signals: Wire real review count and star rating

Update `TrustSignalsSection` to accept real data:
```typescript
function TrustSignalsSection({ 
  reviewCount, 
  starRating,
  certifications
}: { 
  reviewCount: number | null, 
  starRating: number | null,
  certifications: string[] | null
})
```

Replace the static 5-star displays with the actual star rating. Show the review count next to the Google logo: `"87 Reviews"`.

If certifications exist, render them as small badge-style elements alongside the BBB/Google trust bar.

### 5d — Territory Ticker: Already dynamic, no change needed.

### 5e — Navigation: Add real review count pill

In the nav header, add a subtle social proof element after the company name:
```typescript
{data.google_review_count && (
  <span className="hidden md:flex items-center gap-1 text-[10px] font-black tracking-widest opacity-40">
    <Star size={10} fill="currentColor" style={{ color: 'var(--brand-accent)' }} />
    {data.google_review_count} Reviews
  </span>
)}
```

### 5f — Hero: Add city/state context line

Below the tagline divider in the hero, add a subtle location line:
```typescript
{data.city && data.state && (
  <motion.p 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1, delay: 1.8 }}
    className="text-xs font-black tracking-[0.5em] uppercase opacity-30 mt-4"
  >
    Serving {data.city}, {data.state} and surrounding areas
  </motion.p>
)}
```

---

## PHASE 6 — "THIS IS YOUR SITE" BANNER

**Summary:** Add a non-intrusive banner at the very bottom of the page that only appears on preview links. This is the conversion element. It reminds the contractor they're looking at a free site built for them and gives them one clear CTA to respond.

This banner should NOT break the cinematic aesthetic. It should feel like a title card at the end of a film.

Add this component:

```typescript
function PreviewBanner({ companyName }: { companyName: string }) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 3, ease: [0.19, 1, 0.22, 1] }}
      className="fixed bottom-0 left-0 right-0 z-[120] hidden md:flex items-center justify-between px-12 py-6 backdrop-blur-md border-t"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--brand-dark) 90%, transparent)',
        borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)'
      }}
    >
      <div>
        <p className="text-xs font-black tracking-[0.4em] uppercase" style={{ color: 'var(--brand-accent)' }}>
          This site was built for you — free
        </p>
        <p className="text-sm font-medium opacity-50 mt-1">
          Want us to make it yours? It takes one conversation.
        </p>
      </div>
      
      <div className="flex items-center gap-6">
        <a
          href="mailto:michael@woodfireddesigns.com?subject=I saw my free site"
          className="px-8 py-4 text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-dark)' }}
        >
          Let's Talk
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs font-black tracking-widest uppercase opacity-30 hover:opacity-60 transition-opacity"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
```

Add `<PreviewBanner companyName={data.company_name} />` just before the closing div of the main return in `RoofingPage`.

Update the `href` to use Michael's actual email address.

---

## PHASE 7 — VERCEL DEPLOYMENT

**Summary:** Deploy the app to Vercel so every lead URL is live instantly.

### Step 7a — vercel.json

Create a `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router handles all routes client-side instead of Vercel trying to find static files for `/roofing/slug`.

### Step 7b — Build test

Ask the user to run:
```
npm run build
```

Confirm it completes without TypeScript errors. If there are errors, fix them before deploying.

### Step 7c — Deploy via Vercel CLI or MCP

Using Vercel MCP (preferred) or CLI:

1. Create/link the Vercel project named `wfd-roofing-preview`
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

Confirm the live URL with the user.

### Step 7d — Test a real lead URL

Insert one test row into the `lead_queue` table in Supabase:

```sql
INSERT INTO lead_queue (
  slug, company_name, hero_copy, brand_color_accent, brand_color_dark,
  brand_color_light, service_area, city, state, google_review_count, google_star_rating
) VALUES (
  'test-roofing-co',
  'Test Roofing Co.',
  'BUILT TO OUTLAST THE STORM.',
  '#c5a059',
  '#0a0a0a',
  '#f5f5f4',
  ARRAY['Salisbury', 'Ocean City', 'Berlin'],
  'Salisbury',
  'MD',
  64,
  4.7
);
```

Ask the user to open `https://your-deployment-url.vercel.app/roofing/test-roofing-co` and confirm it loads correctly.

---

## PHASE 8 — SLUG GENERATOR SCRIPT

**Summary:** Write a Python script that takes a lead from the `roofing_leads` table (the scraper database), maps it to the `lead_queue` table format, generates a slug, inserts the record, and returns the preview URL. This is the bridge between the lead pipeline and the preview site.

Write `generate_preview.py`:

```python
import os
import re
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])

BASE_URL = "https://your-deployment.vercel.app"  # update this after deploy

def slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug[:50]

def generate_hero_copy(company_name: str, city: str) -> str:
    """Simple hero copy generator. Upgrade with Gemini API call later."""
    templates = [
        "BUILT TO OUTLAST THE STORM.",
        "YOUR HOME. OUR LEGACY.",
        "PROTECTION FORGED IN CRAFTSMANSHIP.",
        f"SERVING {city.upper()} FOR GENERATIONS.",
        "THE ROOF THAT STANDS WHEN IT MATTERS."
    ]
    import random
    return random.choice(templates)

def create_preview(lead_id: str) -> str:
    """
    Takes a lead from roofing_leads, creates a lead_queue entry, returns preview URL.
    """
    # Fetch from roofing_leads
    result = supabase.table('roofing_leads').select('*').eq('id', lead_id).single().execute()
    lead = result.data
    
    if not lead:
        raise ValueError(f"Lead {lead_id} not found")
    
    slug = slugify(lead['business_name'])
    
    # Check for slug collision, append city if needed
    existing = supabase.table('lead_queue').select('slug').eq('slug', slug).execute()
    if existing.data:
        slug = f"{slug}-{slugify(lead.get('city', 'co'))}"
    
    hero_copy = generate_hero_copy(lead['business_name'], lead.get('city', ''))
    
    # Map roofing_leads fields to lead_queue fields
    queue_record = {
        'slug': slug,
        'company_name': lead['business_name'],
        'hero_copy': hero_copy,
        'brand_color_accent': lead.get('brand_primary_color') or '#c5a059',
        'brand_color_dark': '#0a0a0a',  # Default — can be enhanced later
        'brand_color_light': '#f5f5f4',
        'brand_font': lead.get('brand_font'),
        'service_area': lead.get('service_areas') or [lead.get('city', '')],
        'services': lead.get('services'),
        'logo_url': lead.get('logo_url') or '',
        'review_snippets': lead.get('review_snippets'),
        'certifications': lead.get('certifications'),
        'city': lead.get('city'),
        'state': lead.get('state'),
        'google_review_count': lead.get('google_review_count'),
        'google_star_rating': lead.get('google_star_rating'),
    }
    
    # Upsert to lead_queue
    supabase.table('lead_queue').upsert(queue_record, on_conflict='slug').execute()
    
    # Write preview URL back to roofing_leads
    preview_url = f"{BASE_URL}/roofing/{slug}"
    supabase.table('roofing_leads').update({'site_url': preview_url, 'site_generated': True}).eq('id', lead_id).execute()
    
    print(f"Preview created: {preview_url}")
    return preview_url

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        url = create_preview(sys.argv[1])
        print(url)
    else:
        print("Usage: python generate_preview.py <lead_id>")
```

---

## PHASE 9 — END-TO-END TEST

Run through this checklist. Do not declare the system complete until every item passes:

- [ ] `npm run dev` loads the mock preview at `/roofing/apex-heritage`
- [ ] Mock preview shows correct fallback colors (gold accent, obsidian dark)
- [ ] Color CSS vars are visible in browser dev tools under `:root`
- [ ] Supabase table `lead_queue` has all new columns
- [ ] Test record inserted and loads at `/roofing/test-roofing-co`
- [ ] Changing `brand_color_accent` in Supabase updates the page on refresh
- [ ] Changing `brand_color_dark` to a navy `#1a2744` shifts the dark base color throughout
- [ ] Real review snippets render in the testimonials carousel
- [ ] Page view counter increments on each visit (check Supabase)
- [ ] Preview banner appears after 3 seconds on desktop
- [ ] Build completes without errors: `npm run build`
- [ ] Deployed URL is live on Vercel
- [ ] `generate_preview.py` creates a lead_queue entry and returns a valid URL

---

## DESIGN RULES — DO NOT VIOLATE

These apply to every component edit in this build:

1. The cinematic dark aesthetic is sacred. Do not add white backgrounds, card shadows, or "modern SaaS" styling anywhere.
2. Every new UI element must use CSS custom properties (`var(--brand-accent)`, `var(--brand-dark)`, `var(--brand-light)`) — never hardcoded hex values.
3. The film grain overlay, preloader animation, and scroll-driven effects must remain untouched.
4. All new text follows the existing typographic system: `font-display` for headlines, `font-tight font-black` for subheads, `font-sans` for body.
5. New sections must match the existing spacing rhythm: `py-40` for major sections.
6. The PreviewBanner must feel like a film title card — not a cookie consent popup.
7. If a data field is null or empty, degrade gracefully to the mock data equivalent. Never show empty sections or broken layouts.

---

## GENERAL RULES FOR GEMINI DURING THIS BUILD

- Summarize before each phase, confirm after
- Never change files not mentioned in the current phase
- Never hardcode hex colors — always use CSS custom properties
- Fix TypeScript errors immediately — do not leave the build broken
- If a Supabase query change is needed, show the SQL and ask the user to run it manually
- Keep all edits surgical — this is a refactor, not a rewrite
- The app must be runnable locally after every phase
- If something produces unexpected visual results, stop and show the user a screenshot description and ask how to proceed
