#!/usr/bin/env tsx
/**
 * runPipeline.ts  —  Full lead generation + deployment pipeline
 *
 * Chains:
 *   Step 2: generateLeadSite  — scrape, AI copy, resolve colors, write Supabase
 *   Step 3: deployLeadSite   — build, Vercel deploy, alias
 *   Step 4: Notion CRM entry  — (included in deployLeadSite)
 *
 * Usage:
 *   npx tsx scripts/runPipeline.ts '<LeadInput JSON>'
 *
 * Example:
 *   npx tsx scripts/runPipeline.ts '{
 *     "company": "Peak Roofing",
 *     "slug": "peak-roofing",
 *     "city": "Atlanta",
 *     "state": "GA",
 *     "phone": "404-555-1234",
 *     "since": "2012",
 *     "website": "https://peakroofing.com",
 *     "email": "owner@peakroofing.com",
 *     "colorPrimary": "#1a3a6b"
 *   }'
 */

import { generateLeadSite, type LeadInput } from './generateLeadSite.ts';
import { deployLeadSite } from './deployLeadSite.ts';

const [, , rawInput] = process.argv;

if (!rawInput) {
  console.error('Usage: npx tsx scripts/runPipeline.ts \'{"company":"...","slug":"...","city":"...","state":"...","phone":"..."}\'');
  process.exit(1);
}

let lead: LeadInput;
try {
  lead = JSON.parse(rawInput) as LeadInput;
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

console.log(`\n⚡ Pipeline starting: ${lead.company} — ${lead.city}, ${lead.state}`);
console.log('─────────────────────────────────');

async function run() {
  // Step 2 — Generate
  console.log('\n[Step 2] Generating lead config...');
  await generateLeadSite(lead);

  // Step 3 + 4 — Deploy + Notion
  console.log('\n[Step 3 + 4] Deploying + creating CRM entry...');
  const previewUrl = await deployLeadSite(lead.slug);

  console.log('\n─────────────────────────────────');
  console.log('✓ Pipeline complete');
  console.log(`  Company:     ${lead.company}`);
  console.log(`  Preview URL: ${previewUrl}`);
  console.log(`  Notion:      Ready to Send`);
  console.log('─────────────────────────────────\n');
}

run().catch((err: Error) => {
  console.error(`\n✗ Pipeline failed: ${err.message}`);
  process.exit(1);
});
