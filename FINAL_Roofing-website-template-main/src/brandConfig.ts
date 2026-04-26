export type BrandConfig = {
  companyName: string;
  companyNameFull: string;
  city: string;
  state: string;
  region: string;
  phone: string;
  email: string;
  address: string;
  yearEstablished: number;
  tagline: string;
  certification: string;
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  isPreview: boolean;
  serviceAreas: Array<{ city: string; state: string; code: string; zip: string }>;
  stats: Array<{ label: string; sub: string; desc: string }>;
};

const defaults: BrandConfig = {
  companyName: 'IRONCLAD',
  companyNameFull: 'Ironclad Roofing',
  city: 'Salisbury',
  state: 'MD',
  region: 'Mid-Atlantic',
  phone: '1.800.IRONCLAD',
  email: 'CRAFT@IRONCLAD.CO',
  address: '1204 Heavy-Duty Drive\nSalisbury, MD 21801',
  yearEstablished: 2007,
  tagline: 'Honest Work. Built to Last.',
  certification: 'GAF Master Elite Certified',
  primaryColor: '#ff5f00',
  backgroundColor: '#050505',
  surfaceColor: '#0a0a0a',
  isPreview: false,
  serviceAreas: [
    { city: 'SALISBURY', state: 'MD', code: 'HQ-01', zip: '21801' },
    { city: 'OCEAN CITY', state: 'MD', code: 'OC-02', zip: '21842' },
    { city: 'BERLIN', state: 'MD', code: 'BE-03', zip: '21811' },
    { city: 'FRUITLAND', state: 'MD', code: 'FR-04', zip: '21826' },
    { city: 'LAUREL', state: 'DE', code: 'LA-05', zip: '19956' },
    { city: 'SEAFORD', state: 'DE', code: 'SE-06', zip: '19973' },
    { city: 'MILTON', state: 'DE', code: 'MI-07', zip: '19968' },
    { city: 'LEWES', state: 'DE', code: 'LE-08', zip: '19958' },
  ],
  stats: [
    { label: '17', sub: 'Years Serving the Region', desc: 'Trusted craftsmanship since 2007' },
    { label: '920+', sub: 'Roofs Completed', desc: 'Residential and commercial across the Mid-Atlantic' },
    { label: '400+', sub: '5-Star Reviews', desc: 'From verified local homeowners' },
  ],
};

// Per-lead overrides are baked in at Vite build time by deployLeadSite.ts
const envJson = import.meta.env.VITE_BRAND_CONFIG_JSON;

const envOverride: Partial<BrandConfig> = envJson ? (JSON.parse(envJson) as Partial<BrandConfig>) : {};

export const brandConfig: BrandConfig = { ...defaults, ...envOverride };
