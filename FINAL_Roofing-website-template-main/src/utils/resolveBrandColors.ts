export interface PartialBrandColors {
  primaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
}

export interface ResolvedBrandColors {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
}

const DEFAULTS: ResolvedBrandColors = {
  primaryColor: '#ff5f00',
  backgroundColor: '#050505',
  surfaceColor: '#0a0a0a',
};

// Minimum WCAG contrast ratio for brand UI elements (AA large text / components)
const MIN_CONTRAST_RATIO = 3.0;

// --- Color math (no external deps) ---

function normalizeHex(hex: string): string {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    return '#' + clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  if (clean.length === 6) return '#' + clean;
  throw new Error(`Invalid hex: "${hex}"`);
}

function hexToRgb(hex: string): [number, number, number] {
  const c = normalizeHex(hex).replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    Math.round(r).toString(16).padStart(2, '0') +
    Math.round(g).toString(16).padStart(2, '0') +
    Math.round(b).toString(16).padStart(2, '0')
  );
}

function linearizeChannel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(h + 1 / 3) * 255),
    Math.round(hue2rgb(h) * 255),
    Math.round(hue2rgb(h - 1 / 3) * 255),
  ];
}

/** Derive a surface color by nudging background lightness up ~2.5 HSL points. */
function deriveSurface(bgHex: string): string {
  try {
    const [r, g, b] = hexToRgb(bgHex);
    const [h, s, l] = rgbToHsl(r, g, b);
    return rgbToHex(...hslToRgb(h, s, Math.min(l + 2.5, 20)));
  } catch {
    return DEFAULTS.surfaceColor;
  }
}

/**
 * Incrementally lighten a color (5 HSL lightness points per step, up to 20 steps)
 * until it achieves MIN_CONTRAST_RATIO against the given background.
 */
function lightenUntilContrast(primaryHex: string, bgHex: string): string {
  const [r, g, b] = hexToRgb(primaryHex);
  let [h, s, l] = rgbToHsl(r, g, b);
  let candidate = primaryHex;

  for (let i = 0; i < 20; i++) {
    if (contrastRatio(candidate, bgHex) >= MIN_CONTRAST_RATIO) return candidate;
    l = Math.min(l + 5, 95);
    candidate = rgbToHex(...hslToRgb(h, s, l));
  }
  return candidate;
}

// --- Public API ---

/**
 * Priority chain:
 *   1. Full config provided          → use as-is (no modification)
 *   2. Only primaryColor             → place on default dark background
 *   3. Primary contrast < 3:1 on bg  → auto-lighten primary until it passes
 *   4. Nothing provided              → orange (#ff5f00) on black (#050505)
 */
export function resolveBrandColors(partial: PartialBrandColors): ResolvedBrandColors {
  const hasAny =
    partial.primaryColor !== undefined ||
    partial.backgroundColor !== undefined ||
    partial.surfaceColor !== undefined;

  // Case 4: nothing → full defaults
  if (!hasAny) return { ...DEFAULTS };

  const bg = partial.backgroundColor ?? DEFAULTS.backgroundColor;
  const surface = partial.surfaceColor ?? deriveSurface(bg);

  let primary = partial.primaryColor ?? DEFAULTS.primaryColor;

  // Case 3: contrast too low → auto-lighten
  try {
    if (contrastRatio(primary, bg) < MIN_CONTRAST_RATIO) {
      primary = lightenUntilContrast(primary, bg);
    }
  } catch {
    primary = DEFAULTS.primaryColor;
  }

  return { primaryColor: primary, backgroundColor: bg, surfaceColor: surface };
}

// Exported for testing
export { contrastRatio, lightenUntilContrast, deriveSurface };
