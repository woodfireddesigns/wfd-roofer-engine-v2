#!/usr/bin/env tsx
/**
 * generateLeadSite.ts
 *
 * Generates a personalized roofing site config for one lead:
 *   1. Scrapes their website with Firecrawl (optional — skipped if no API key or no URL)
 *   2. Uses Claude to generate city-specific hero copy
 *   3. Resolves brand colors with contrast enforcement
 *   4. Builds a complete brandConfig object
 *   5. Upserts to Supabase `leads` table with status "pending"
 *
 * Usage:
 *   npx tsx scripts/generateLeadSite.ts '<JSON>'
 *
 * Required env vars: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional env vars: FIRECRAWL_API_KEY
 *
 * Supabase `leads` table schema (create once):
 *   id                 uuid primary key default gen_random_uuid()
 *   slug               text unique not null
 *   company            text not null
 *   city               text not null
 *   state              text not null
 *   phone              text not null
 *   email              text
 *   website            text
 *   brand_config       jsonb not null
 *   status             text not null default 'pending'
 *   preview_url        text
 *   vercel_deploy_id   text
 *   notion_page_id     text
 *   created_at         timestamptz default now()
 *   updated_at         timestamptz default now()
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { resolveBrandColors } from '../src/utils/resolveBrandColors.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeadInput {
  company: string;
  slug: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  since?: string;
  website?: string;
  colorPrimary?: string;
  colorBackground?: string;
}

interface GeneratedContent {
  tagline: string;
  serviceAreas: string[];
  trustStatement: string;
}

// ---------------------------------------------------------------------------
// Step 1 — Firecrawl scrape (optional)
// ---------------------------------------------------------------------------

async function scrapeBio(url: string): Promise<string | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        // Focus on about/bio content
        actions: [{ type: 'wait', milliseconds: 500 }],
      }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      success: boolean;
      data?: { markdown?: string };
    };

    if (!json.success || !json.data?.markdown) return null;

    // Return first paragraph over 100 chars (skip headings and short lines)
    const paragraph = json.data.markdown
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 100 && !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('['));

    return paragraph ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Step 2 — Claude copy generation
// ---------------------------------------------------------------------------

async function generateContent(
  client: Anthropic,
  lead: LeadInput,
  bio: string | null,
): Promise<GeneratedContent> {
  const yearsInBusiness = lead.since
    ? new Date().getFullYear() - parseInt(lead.since, 10)
    : null;

  const context = [
    `Company: ${lead.company}`,
    `City: ${lead.city}, ${lead.state}`,
    yearsInBusiness != null ? `Years in business: ${yearsInBusiness}` : '',
    bio ? `About them: "${bio}"` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: [
      {
        type: 'text',
        text: 'You are a copywriter generating personalized website content for local roofing contractors. Be concise, hyper-local, and direct. Return only valid JSON with no markdown fences.',
        // Cache the system prompt — it is identical across all lead calls
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Generate website copy for this roofing contractor:

${context}

Return ONLY a JSON object with these exact keys:
{
  "tagline": "A punchy city-specific hero tagline, max 8 words, no quotes inside",
  "serviceAreas": ["Town 1", "Town 2", "Town 3"],
  "trustStatement": "One sentence trust statement max 15 words"
}

serviceAreas must be 3 real towns or cities within 30 miles of ${lead.city}, ${lead.state}.`,
      },
    ],
  });

  const raw =
    response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  return JSON.parse(cleaned) as GeneratedContent;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateLeadSite(
  lead: LeadInput,
): Promise<{ id: string; brandConfig: object }> {
  // Validate required env vars upfront
  const required = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Scrape website bio
  console.log('  → Scraping website...');
  const bio = lead.website ? await scrapeBio(lead.website) : null;
  console.log(bio ? `  ✓ Bio scraped (${bio.length} chars)` : '  — No bio (skipped)');

  // 2. Generate copy with Claude
  console.log('  → Generating copy with Claude...');
  const { tagline, serviceAreas, trustStatement } = await generateContent(anthropic, lead, bio);
  console.log('  ✓ Copy generated');

  // 3. Resolve brand colors
  const colors = resolveBrandColors({
    primaryColor: lead.colorPrimary,
    backgroundColor: lead.colorBackground,
  });

  // 4. Build complete brandConfig
  const yearEstablished = lead.since
    ? parseInt(lead.since, 10)
    : new Date().getFullYear() - 10;
  const yearsInBusiness = new Date().getFullYear() - yearEstablished;

  const brandConfig = {
    companyName: lead.company.toUpperCase(),
    companyNameFull: lead.company,
    city: lead.city,
    state: lead.state,
    region: `${lead.city} Area`,
    phone: lead.phone,
    email: lead.email ?? '',
    address: `${lead.city}, ${lead.state}`,
    yearEstablished,
    tagline,
    certification: 'Licensed & Insured',
    primaryColor: colors.primaryColor,
    backgroundColor: colors.backgroundColor,
    surfaceColor: colors.surfaceColor,
    serviceAreas: serviceAreas.map((city, i) => ({
      city: city.toUpperCase(),
      state: lead.state,
      code: `SV-0${i + 1}`,
      zip: '',
    })),
    stats: [
      {
        label: `${yearsInBusiness}+`,
        sub: 'Years Serving the Region',
        desc: trustStatement,
      },
      {
        label: '500+',
        sub: 'Roofs Completed',
        desc: `Residential and commercial across the ${lead.city} area`,
      },
      {
        label: '200+',
        sub: '5-Star Reviews',
        desc: 'From verified local homeowners',
      },
    ],
  };

  // 5. Upsert to Supabase — slug is the idempotency key
  console.log('  → Writing to Supabase...');
  const { data, error } = await supabase
    .from('leads')
    .upsert(
      {
        slug: lead.slug,
        company: lead.company,
        city: lead.city,
        state: lead.state,
        phone: lead.phone,
        email: lead.email ?? null,
        website: lead.website ?? null,
        brand_config: brandConfig,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single();

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

  console.log(`  ✓ Supabase record saved (id: ${data.id})`);

  return { id: data.id, brandConfig };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

const [, , rawInput] = process.argv;

if (!rawInput) {
  console.error(
    'Usage: npx tsx scripts/generateLeadSite.ts \'{"company":"Peak Roofing","slug":"peak-roofing","city":"Atlanta","state":"GA","phone":"404-555-1234"}\'',
  );
  process.exit(1);
}

let lead: LeadInput;
try {
  lead = JSON.parse(rawInput);
} catch {
  console.error('Error: invalid JSON input');
  process.exit(1);
}

const requiredFields: (keyof LeadInput)[] = ['company', 'slug', 'city', 'state', 'phone'];
const missingFields = requiredFields.filter((f) => !lead[f]);
if (missingFields.length) {
  console.error(`Error: missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

console.log(`\n⚡ Generating lead site: ${lead.company} — ${lead.city}, ${lead.state}`);

generateLeadSite(lead)
  .then(({ id, brandConfig }) => {
    const cfg = brandConfig as Record<string, unknown>;
    console.log('\n─────────────────────────────────');
    console.log(`✓ Done`);
    console.log(`  Lead ID:       ${id}`);
    console.log(`  Tagline:       "${cfg.tagline}"`);
    console.log(`  Service areas: ${(cfg.serviceAreas as Array<{ city: string }>).map((a) => a.city).join(', ')}`);
    console.log(`  Primary color: ${cfg.primaryColor}`);
    console.log(`  Background:    ${cfg.backgroundColor}`);
    console.log(`  Status:        pending`);
    console.log('─────────────────────────────────\n');
  })
  .catch((err: Error) => {
    console.error(`\n✗ Failed: ${err.message}`);
    process.exit(1);
  });
