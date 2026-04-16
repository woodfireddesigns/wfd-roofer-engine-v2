# Roofing Preview Site — Gemini Build Handoff
### Project: Wood Fired Designs — Dynamic Lead Preview Sites
### Stack: React 19 + Vite 6 + Tailwind CSS v4 + Framer Motion + Supabase + TypeScript

---

## WHAT YOU ARE BUILDING

A single Vite + React app deployed to Vercel. It serves personalized roofing landing pages for cold outreach leads. Each roofing contractor gets a unique URL:

```
https://your-app.vercel.app/roofing/their-slug
```

When a contractor clicks the link, they see a fully personalized premium website built around their own brand — their colors, their company name, their real reviews, their service areas — all pulled live from Supabase.

**The goal:** The contractor opens the link, sees their own brand reflected back at them in a premium website, and thinks — "if they did this for free, what happens when I actually hire them?"

---

## EXISTING STACK — DO NOT CHANGE

```json
{
  "react": "19",
  "vite": "6",
  "tailwindcss": "v4 via @tailwindcss/vite",
  "framer-motion": "via motion package",
  "react-router-dom": "v7",
  "supabase-js": "latest",
  "lucide-react": "latest",
  "typescript": "latest"
}
```

- Routing is already wired: `App.tsx` routes `/roofing/:slug` to `RoofingPage`
- Do not change the router setup

---

## SUPABASE DATA MODEL

### `lead_queue` table (the preview data source)

```typescript
interface LeadQueueData {
  slug: string;
  company_name: string;
  hero_copy: string;                    // uppercase tagline, e.g. "BERLIN'S #1 EXTERIOR REMODELER"
  brand_color_accent: string;           // their brand color — used as CSS var --brand-accent
  brand_color_dark: string;             // always #0a0a0a
  brand_color_light: string;            // always #f5f5f4
  brand_font: string | null;            // Google Font name, or null → fall back to display font
  service_area: string[];               // ["Berlin", "Ocean City", "Salisbury"]
  services: string[] | null;            // ["Asphalt Shingles", "Metal Roofing", ...]
  logo_url: string;                     // may be empty string — handle gracefully
  review_snippets: string[] | null;     // real Google review text, up to 5
  review_authors: string[] | null;      // parallel array to review_snippets
  certifications: string[] | null;      // ["GAF Certified Contractor", ...]
  owner_name: string | null;
  city: string | null;
  state: string | null;
  google_review_count: number | null;
  google_star_rating: number | null;    // e.g. 4.8
}
```

### Fallback / Mock data (used when Supabase returns null fields)

```typescript
const MOCK_DATA: LeadQueueData = {
  slug: "apex-heritage",
  company_name: "Apex Forge Roofing",
  hero_copy: "UNFAILING PROTECTION FOR GENERATIONS.",
  brand_color_accent: "#c5a059",
  brand_color_dark: "#0a0a0a",
  brand_color_light: "#f5f5f4",
  brand_font: null,
  service_area: ["Salisbury", "Ocean City", "Easton", "Cambridge", "Berlin"],
  services: [
    "Asphalt Shingles", "Metal Roofing", "Flat & Low-Slope Roofing",
    "Roof Repair", "Emergency Roof Repair", "Gutter Installation & Repair",
    "Roof Inspection", "Storm Damage Restoration",
    "Insurance Claims Assistance", "Ventilation & Skylights"
  ],
  logo_url: "",
  review_snippets: [
    "The crew was meticulous. They didn't just build a roof — they engineered a shield for our home.",
    "Uncompromising quality and absolute professionalism from the first handshake to the final inspection.",
    "When the storm hit, their emergency response was immediate. True craftsmanship under pressure."
  ],
  review_authors: ["James T.", "Sarah L.", "Michael R."],
  certifications: [
    "Licensed & Insured",
    "GAF Certified Contractor",
    "Owens Corning Preferred Contractor",
    "BBB Accredited Business"
  ],
  owner_name: "Mike",
  city: "Salisbury",
  state: "MD",
  google_review_count: 87,
  google_star_rating: 4.8,
};
```

---

## CSS VARIABLE SYSTEM — NON-NEGOTIABLE

Every color tied to the lead's brand must use CSS custom properties. Never hardcode brand colors.

```typescript
// Set this in a useEffect when data loads
useEffect(() => {
  if (!data) return;
  const root = document.documentElement;
  root.style.setProperty('--brand-accent', data.brand_color_accent || '#c5a059');
  root.style.setProperty('--brand-dark', data.brand_color_dark || '#0a0a0a');
  root.style.setProperty('--brand-light', data.brand_color_light || '#f5f5f4');
  return () => {
    root.style.removeProperty('--brand-accent');
    root.style.removeProperty('--brand-dark');
    root.style.removeProperty('--brand-light');
  };
}, [data]);
```

```css
/* index.css */
:root {
  --brand-accent: #c5a059;
  --brand-dark: #0a0a0a;
  --brand-light: #f5f5f4;
}
```

In Tailwind arbitrary values, CSS vars don't work at runtime — use inline styles instead:
```tsx
// ✗ Wrong
<div className="bg-[var(--brand-accent)]">

// ✓ Correct
<div style={{ backgroundColor: 'var(--brand-accent)' }}>
```

---

## DESIGN SYSTEM — TWO-LAYER APPROACH

### Layer 1: Nike (Primary — Hero, Services, Gallery, Navigation)
**Atmosphere:** Monochromatic authority. Massive uppercase display type. Full-bleed photography with zero border radius. Flat elevation — no shadows anywhere. Pill-shaped buttons (30px radius).

**Key tokens:**
- Background light: `#FFFFFF`
- Background dark sections: `#111111`
- Primary text: `#111111`
- Secondary text: `#707072`
- Surface gray: `#F5F5F5`
- Border: `#CACACB`
- Button radius: `30px` (pill)
- Display type: condensed, uppercase, tight line-height `0.90`, use `font-black` + `tracking-tight`
- Body type: clean sans, weight 500 for interactive elements
- Images: always full-bleed, `border-radius: 0`
- No card shadows — ever

**Where it applies:** Navigation, Hero, Services section, Gallery/Portfolio, Process steps, Emergency CTA banner, Footer

### Layer 2: Stripe (Secondary — Trust, Forms, Testimonials, FAQ)
**Atmosphere:** Weight-300 elegance. Blue-tinted depth. Clean white surfaces with precise borders. Trust-forward. Multi-layer shadows with blue undertone.

**Key tokens:**
- Background: `#FFFFFF`
- Dark section bg: `#1c1e54` (Brand Dark indigo)
- Primary text: `#061b31` (Deep Navy — not black)
- Secondary text: `#425466`
- Accent: `#533afd` (Stripe Purple) → **REPLACE with `var(--brand-accent)` for lead personalization**
- Shadow: `0 4px 16px rgba(50,50,93,0.12), 0 2px 6px rgba(0,0,0,0.08)`
- Border radius: `6px` cards, `4px` inputs
- Display type: weight 300, tight negative letter-spacing
- Body type: weight 400–500, generous line-height 1.6+

**Where it applies:** Trust bar, Testimonials carousel, Certifications badges, FAQ accordion, Free Estimate form, Review count + stars display

### How they coexist
The page alternates rhythm:
```
[NIKE]   Navigation
[NIKE]   Hero — full-bleed, massive type, dark overlay
[STRIPE] Trust bar — stars, review count, certifications
[NIKE]   Services grid — monochrome, full-bleed imagery
[STRIPE] Testimonials — clean white, card shadows, real review text
[NIKE]   Process steps — dark section, numbered, bold
[STRIPE] Free Estimate form — clean white, Stripe input styling
[NIKE]   Gallery — edge-to-edge before/after photography
[STRIPE] FAQ accordion — clean white, light borders
[NIKE]   Service area ticker — dark strip, scrolling city names
[NIKE]   Emergency CTA — full-width dark banner
[NIKE]   Footer — dark, structured
```

---

## PAGE SECTIONS — BUILD SPEC

### 1. Navigation
- Sticky, white background
- Left: company logo (if `logo_url` exists, show it; else show `company_name` in display font)
- Right: phone number (click-to-call) + "Get Free Estimate" pill button in `var(--brand-accent)`
- Mobile: hamburger collapse
- Subtle bottom border `#CACACB` on scroll

### 2. Hero
- Full-viewport height (`100vh`)
- Full-bleed roofing photography (Unsplash) with dark overlay scrim
- `hero_copy` in massive uppercase display type — condensed, tight line-height
- Subline: `{city}, {state}` serving area if available
- Two CTAs: "Get Your Free Estimate" (pill button, `var(--brand-accent)` bg) + "See Our Work" (ghost, white border)
- Framer Motion entrance animations: headline fades in at 0.3s, subline at 0.8s, CTAs at 1.2s

### 3. Trust Bar
- Full-width strip immediately below hero — light gray `#F5F5F5` background
- 4 columns: Google Stars (`google_star_rating` ★ — `google_review_count` Reviews) · Years in Business · Licensed & Insured · Primary certification
- Stars rendered as filled SVG stars in `var(--brand-accent)`
- Stripe-style — clean, no decoration

### 4. Services Grid
- Section title: "WHAT WE DO" — Nike display type, uppercase, `#111111`
- 3-column grid (2 on tablet, 1 on mobile)
- Each service card: full-bleed photo (no border radius) + service name overlay
- Service-to-image map:
```typescript
const serviceImages: Record<string, string> = {
  "asphalt":    "https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=800",
  "metal":      "https://images.unsplash.com/photo-1516655855035-d5215be56042?q=80&w=800",
  "flat":       "https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=800",
  "repair":     "https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=800",
  "emergency":  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800",
  "gutter":     "https://images.unsplash.com/photo-1621905235277-f25426d51790?q=80&w=800",
  "inspection": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
  "storm":      "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?q=80&w=800",
  "insurance":  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800",
  "ventilation":"https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
  "default":    "https://images.unsplash.com/photo-1618090584126-129cd1f3fbae?q=80&w=800",
};
```
Match by: `Object.keys(serviceImages).find(k => service.toLowerCase().includes(k)) || 'default'`
- Use `data.services || MOCK_DATA.services` — never show empty grid

### 5. Testimonials
- White background, Stripe-style
- Section title: "What Our Customers Say"
- Carousel of up to 5 cards — auto-rotates every 5s, manual arrows
- Each card: quote text, reviewer name, 5 stars in `var(--brand-accent)`, "Verified Google Review" label
- Card shadow: `0 4px 16px rgba(50,50,93,0.12), 0 2px 6px rgba(0,0,0,0.08)`
- Use `data.review_snippets || MOCK_DATA.review_snippets` (parallel with `review_authors`)
- Pad to minimum 3 items using mock data if needed

### 6. The Process
- Dark section (`#111111` background, white text)
- 4 numbered steps: 1. Free Inspection → 2. Custom Quote → 3. Expert Installation → 4. Final Walkthrough
- Nike style — large step numbers in `var(--brand-accent)`, step name in display type

### 7. Certifications & Trust
- White section, Stripe-style
- Badge-style pills for each certification in `data.certifications || MOCK_DATA.certifications`
- "Licensed, Bonded & Insured" always shown
- BBB logo placeholder, Google Reviews badge with real star count

### 8. Free Estimate Form
- White background, Stripe input styling
- Fields: Name, Phone, Email, Property Address, Service Needed (dropdown), Message
- Submit button: full-width pill, `var(--brand-accent)` background
- On submit: Supabase insert to `estimate_requests` table (create if needed)
- Form title: "Get Your Free Estimate" — Stripe weight-300 display

### 9. Service Area Ticker
- Dark strip (`#111111`)
- `service_area` array items scrolling left continuously via CSS animation
- Separator: `·` in `var(--brand-accent)` between city names
- If only 1 city, duplicate array to fill the ticker

### 10. FAQ Accordion
- White background, Stripe-style
- 6 hardcoded questions (universal for all roofers):
  1. "How long does a typical roof replacement take?"
  2. "Do you work with insurance companies?"
  3. "What roofing materials do you recommend?"
  4. "Do you offer financing?"
  5. "What warranty do you provide?"
  6. "How do I know if I need a full replacement or just a repair?"
- Clean expand/collapse with Framer Motion height animation
- Border: `1px solid #CACACB`

### 11. Emergency CTA Banner
- Full-width, `#111111` background
- "STORM DAMAGE? WE RESPOND 24/7." in Nike display type
- Phone number large and prominent, click-to-call
- Pill button: "Call Now" in `var(--brand-accent)`

### 12. Preview Banner (bottom, fixed)
- Appears after 3s, slides up from bottom
- Only on `/roofing/:slug` routes (this is always true here)
- Dark glass: `background: rgba(10,10,10,0.92)`, `backdrop-filter: blur(12px)`
- Top border in `var(--brand-accent)` at 30% opacity
- Left text: "This site was built for you — free" in `var(--brand-accent)` + subline
- Right CTAs: "Let's Talk" button (mailto:michael@woodfireddesigns.com) + "Dismiss"
- Dismiss hides it; clicking "Let's Talk" opens email

### 13. Footer
- Dark (`#111111`), Nike-style
- Company name in display font, city/state, phone
- Navigation links
- License number placeholder
- Copyright

---

## PHASE ORDER

Execute one phase at a time. Summarize before starting. Confirm after completing. Wait for "next" before proceeding.

**Phase 0** — Environment check (see original master prompt)
**Phase 1** — Supabase schema (run SQL, confirm columns exist)
**Phase 2** — CSS variable system + `index.css` setup
**Phase 3** — TypeScript interface + Supabase query + mock data
**Phase 4** — Dynamic font loading from Google Fonts
**Phase 5** — Build all 13 sections above in `RoofingPage.tsx`
**Phase 6** — Preview Banner component
**Phase 7** — Vercel deployment + `vercel.json` rewrite rules
**Phase 8** — End-to-end checklist

---

## COMPONENT RULES

1. Every section falls back gracefully — null data never breaks layout
2. `logo_url` empty string → show `company_name` text, never a broken `<img>`
3. `review_snippets` shorter than 3 items → pad silently with mock reviews
4. `services` null → use `DEFAULT_SERVICES` (10 universal roofing services)
5. `certifications` null → use `DEFAULT_CERTIFICATIONS` (4 standard certs)
6. All brand colors via CSS vars — never hardcoded hex for brand-specific values
7. Tailwind for layout/spacing/typography — inline styles only for CSS var values
8. Framer Motion for entrances — stagger children, `ease: [0.19, 1, 0.22, 1]`
9. Every section has `py-24` or `py-32` minimum vertical padding
10. TypeScript strict — no `any`, no suppressed errors

---

## DESIGN RULES — DO NOT VIOLATE

1. **Nike sections**: full-bleed images, zero border radius on photos, pill buttons, `#111111` dark sections, NO shadows
2. **Stripe sections**: `#061b31` headings (not black), multi-layer blue-tinted shadows, 6px card radius, weight-300 display
3. **Brand accent** (`var(--brand-accent)`): used for CTAs, star ratings, step numbers, active states, ticker separators — this is the only personalized color
4. **Typography**: Display type is always uppercase + condensed + tight line-height for Nike sections; weight 300 + negative letter-spacing for Stripe section titles
5. **No white backgrounds on Nike sections** — they are either `#111111` or full-bleed photography
6. **No card shadows on Nike sections** — flat only
7. The preview site IS the product — it must look like a $15,000 custom website

---

## SUPABASE SQL TO RUN BEFORE PHASE 5

```sql
-- Phase 1 columns (if not already added)
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_color_accent text;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_color_dark text DEFAULT '#0a0a0a';
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_color_light text DEFAULT '#f5f5f4';
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS brand_font text;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS review_snippets text[];
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS review_authors text[];
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS services text[];
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS certifications text[];
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS google_review_count integer;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS google_star_rating numeric(3,1);
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS preview_views integer DEFAULT 0;
ALTER TABLE lead_queue ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz;

-- Page view tracker function
CREATE OR REPLACE FUNCTION increment_preview_views(lead_slug text)
RETURNS void AS $$
  UPDATE lead_queue
  SET preview_views = COALESCE(preview_views, 0) + 1,
      last_viewed_at = now()
  WHERE slug = lead_slug;
$$ LANGUAGE sql;

-- Estimate requests table
CREATE TABLE IF NOT EXISTS estimate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  lead_slug text,
  name text,
  phone text,
  email text,
  address text,
  service text,
  message text
);
```

---

## TEST LEAD (insert to confirm live data works)

```sql
INSERT INTO lead_queue (
  slug, company_name, hero_copy,
  brand_color_accent, brand_color_dark, brand_color_light,
  service_area, city, state,
  google_review_count, google_star_rating,
  services, certifications,
  review_snippets, review_authors
) VALUES (
  'g-fedale-roofing-and-siding',
  'G. Fedale Roofing and Siding',
  'BERLIN''S #1 EXTERIOR REMODELER SERVING SOUTHERN MARYLAND',
  '#0188ce', '#0a0a0a', '#f5f5f4',
  ARRAY['Berlin', 'Ocean City', 'Salisbury', 'Bethesda', 'Annapolis'],
  'Berlin', 'MD',
  16, 5.0,
  ARRAY['Asphalt Shingles','Metal Roofing','Flat & Low-Slope Roofing','Roof Repair','Emergency Roof Repair','Gutter Installation & Repair','Roof Inspection','Storm Damage Restoration','Insurance Claims Assistance','Ventilation & Skylights'],
  ARRAY['Licensed & Insured','GAF Certified Contractor','Owens Corning Preferred Contractor','BBB Accredited Business'],
  ARRAY['Professional, fast, and incredibly clean job site. Couldn''t be happier with the result.','Called them after storm damage and they were on-site same day. Absolute lifesavers.','Best roofing experience I''ve had in 20 years of homeownership.'],
  ARRAY['David M.', 'Karen S.', 'Tom R.']
) ON CONFLICT (slug) DO NOTHING;
```

Preview URL to test: `/roofing/g-fedale-roofing-and-siding`

---

## END-TO-END CHECKLIST (Phase 8)

- [ ] Mock preview loads at `/roofing/apex-heritage` with gold accent
- [ ] G. Fedale preview loads at `/roofing/g-fedale-roofing-and-siding` with blue accent
- [ ] Changing `brand_color_accent` in Supabase updates accent color on refresh
- [ ] All 13 sections render without layout breaks
- [ ] `logo_url` empty → company name text shows, no broken image
- [ ] Null `review_snippets` → mock reviews show, no empty carousel
- [ ] Null `services` → default 10 services show, no empty grid
- [ ] Service area ticker scrolls correctly with 1 or many cities
- [ ] Preview banner slides up after 3s and dismisses
- [ ] Estimate form submits to Supabase `estimate_requests`
- [ ] Page view counter increments on visit
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] Deployed to Vercel, live URL confirmed
