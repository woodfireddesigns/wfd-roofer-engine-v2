#!/usr/bin/env tsx
/**
 * deployLeadSite.ts  —  Steps 3 + 4 of the lead pipeline
 *
 * 1. Fetches brandConfig from Supabase for the given slug
 * 2. Builds the Vite app with VITE_BRAND_CONFIG_JSON injected
 * 3. Uploads dist/ to Vercel Files API (SHA1-addressed)
 * 4. Creates a Vercel deployment and waits for READY
 * 5. Sets alias: {slug}.wood-fired-designs.vercel.app
 * 6. Updates Supabase lead status → "deployed" + stores preview URL
 * 7. Creates Notion CRM entry with pre-filled mailto outreach link
 *
 * Usage:   npx tsx scripts/deployLeadSite.ts <slug>
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   VERCEL_TOKEN
 *   NOTION_API_KEY, NOTION_LEADS_DB_ID
 *
 * Optional:
 *   VERCEL_TEAM_ID   — set if deploying under a Vercel team account
 *
 * One-time Vercel setup:
 *   - Configure *.wood-fired-designs.vercel.app wildcard on your project
 *     (requires Vercel Pro or Team plan)
 *   - Or use the returned vercel.app URL directly for preview links
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Lead {
  id: string;
  slug: string;
  company: string;
  city: string;
  state: string;
  phone: string;
  email: string | null;
  brand_config: Record<string, unknown>;
}

interface VercelFile {
  file: string;
  sha: string;
  size: number;
}

// ---------------------------------------------------------------------------
// Vercel helpers
// ---------------------------------------------------------------------------

function sha1(buf: Buffer): string {
  return createHash('sha1').update(buf).digest('hex');
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walkDir(full));
    else results.push(full);
  }
  return results;
}

function vercelUrl(path: string, teamId?: string): string {
  const base = `https://api.vercel.com${path}`;
  return teamId ? `${base}?teamId=${teamId}` : base;
}

async function vercelFetch(
  token: string,
  teamId: string | undefined,
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(vercelUrl(path, teamId), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

async function uploadFile(
  token: string,
  teamId: string | undefined,
  content: Buffer,
): Promise<void> {
  const res = await vercelFetch(token, teamId, '/v2/now/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'x-now-digest': sha1(content),
      'x-now-size': String(content.length),
    },
    body: content,
  });
  // 200 = newly uploaded, 409 = already on Vercel's CDN — both are success
  if (!res.ok && res.status !== 409) {
    throw new Error(`File upload failed ${res.status}: ${await res.text()}`);
  }
}

async function createDeployment(
  token: string,
  teamId: string | undefined,
  name: string,
  files: VercelFile[],
): Promise<{ id: string; url: string }> {
  const res = await vercelFetch(token, teamId, '/v13/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      files,
      projectSettings: { framework: null },
      target: 'preview',
    }),
  });
  if (!res.ok) throw new Error(`Create deployment failed ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ id: string; url: string }>;
}

async function waitForReady(
  token: string,
  teamId: string | undefined,
  deploymentId: string,
): Promise<string> {
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await vercelFetch(token, teamId, `/v13/deployments/${deploymentId}`);
    const data = (await res.json()) as { readyState: string; url: string };
    if (data.readyState === 'READY') return `https://${data.url}`;
    if (data.readyState === 'ERROR') throw new Error('Vercel deployment entered ERROR state');
  }
  throw new Error('Deployment timed out (120s)');
}

async function setAlias(
  token: string,
  teamId: string | undefined,
  deploymentId: string,
  alias: string,
): Promise<void> {
  const res = await vercelFetch(token, teamId, `/v2/deployments/${deploymentId}/aliases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias }),
  });
  if (!res.ok) {
    // Non-fatal — alias requires wildcard domain setup; log and continue
    console.warn(`  ⚠ Alias skipped (${res.status}) — configure *.wood-fired-designs.vercel.app in Vercel dashboard`);
  }
}

// ---------------------------------------------------------------------------
// Build + deploy
// ---------------------------------------------------------------------------

async function buildAndDeploy(
  slug: string,
  brandConfig: Record<string, unknown>,
  token: string,
  teamId: string | undefined,
): Promise<string> {
  const configJson = JSON.stringify({ ...brandConfig, isPreview: true });

  // Build Vite app with brand config baked in
  console.log('  → Building Vite app...');
  execSync('npm run build', {
    cwd: PROJECT_ROOT,
    env: { ...process.env, VITE_BRAND_CONFIG_JSON: configJson },
    stdio: 'inherit',
  });
  console.log('  ✓ Build complete');

  // Collect dist/ files
  const distDir = join(PROJECT_ROOT, 'dist');
  const filePaths = walkDir(distDir);
  const fileEntries: Array<{ content: Buffer; vercelFile: VercelFile }> = filePaths.map((fp) => {
    const content = readFileSync(fp);
    return {
      content,
      vercelFile: {
        file: relative(distDir, fp),
        sha: sha1(content),
        size: content.length,
      },
    };
  });

  // Upload all files (parallel, Vercel deduplicates by SHA)
  console.log(`  → Uploading ${fileEntries.length} files to Vercel...`);
  await Promise.all(fileEntries.map(({ content }) => uploadFile(token, teamId, content)));
  console.log('  ✓ Files uploaded');

  // Create deployment
  const deploymentName = `wfd-${slug}`;
  console.log(`  → Creating deployment "${deploymentName}"...`);
  const { id: deploymentId } = await createDeployment(
    token,
    teamId,
    deploymentName,
    fileEntries.map((e) => e.vercelFile),
  );

  // Wait for READY
  console.log('  → Waiting for deployment to be READY...');
  const previewUrl = await waitForReady(token, teamId, deploymentId);
  console.log(`  ✓ Live at: ${previewUrl}`);

  // Set vanity alias
  const alias = `${slug}.wood-fired-designs.vercel.app`;
  await setAlias(token, teamId, deploymentId, alias);

  return previewUrl;
}

// ---------------------------------------------------------------------------
// Notion CRM entry  —  Step 4
// ---------------------------------------------------------------------------

async function createNotionEntry(
  lead: Lead,
  previewUrl: string,
  apiKey: string,
  dbId: string,
): Promise<string> {
  const subject = encodeURIComponent(`I built this for ${lead.company}`);
  const bodyText = [
    `Hi — I put together a free personalized website preview for ${lead.company}.`,
    `Take a look: ${previewUrl}`,
    `Happy to customize it fully and have it live within 48 hours.`,
    `— Michael, Wood Fired Designs`,
  ].join(' ');
  const mailto = `mailto:${lead.email ?? ''}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: lead.company } }] },
        'Preview URL': { url: previewUrl },
        Location: { rich_text: [{ text: { content: `${lead.city}, ${lead.state}` } }] },
        Phone: { phone_number: lead.phone },
        Status: { select: { name: 'Ready to Send' } },
        Outreach: { url: mailto },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API failed ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function deployLeadSite(slug: string): Promise<string> {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VERCEL_TOKEN',
    'NOTION_API_KEY',
    'NOTION_LEADS_DB_ID',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const token = process.env.VERCEL_TOKEN!;
  const teamId = process.env.VERCEL_TEAM_ID;

  // Fetch lead from Supabase
  console.log(`  → Fetching lead "${slug}" from Supabase...`);
  const { data: lead, error } = await supabase
    .from('leads')
    .select('id, slug, company, city, state, phone, email, brand_config')
    .eq('slug', slug)
    .single<Lead>();

  if (error || !lead) throw new Error(`Lead "${slug}" not found: ${error?.message ?? 'no data'}`);
  console.log(`  ✓ Lead: ${lead.company} (${lead.city}, ${lead.state})`);

  // Build + deploy to Vercel
  const previewUrl = await buildAndDeploy(slug, lead.brand_config, token, teamId);

  // Update Supabase
  await supabase
    .from('leads')
    .update({ status: 'deployed', preview_url: previewUrl, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  // Create Notion entry
  console.log('  → Creating Notion CRM entry...');
  const notionPageId = await createNotionEntry(
    lead,
    previewUrl,
    process.env.NOTION_API_KEY!,
    process.env.NOTION_LEADS_DB_ID!,
  );
  console.log(`  ✓ Notion entry created (${notionPageId})`);

  // Store Notion page ID on lead record
  await supabase.from('leads').update({ notion_page_id: notionPageId }).eq('slug', slug);

  return previewUrl;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const [, , slug] = process.argv;

if (!slug) {
  console.error('Usage: npx tsx scripts/deployLeadSite.ts <slug>');
  process.exit(1);
}

console.log(`\n🚀 Deploying lead site: ${slug}`);
deployLeadSite(slug)
  .then((url) => {
    console.log('\n─────────────────────────────────');
    console.log(`✓ Deployed`);
    console.log(`  Preview URL: ${url}`);
    console.log(`  Notion CRM:  updated`);
    console.log(`  Supabase:    status = deployed`);
    console.log('─────────────────────────────────\n');
  })
  .catch((err: Error) => {
    console.error(`\n✗ Deploy failed: ${err.message}`);
    process.exit(1);
  });
