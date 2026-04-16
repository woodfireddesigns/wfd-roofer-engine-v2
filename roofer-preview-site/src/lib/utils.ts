import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pickAccentColor(primary: string | null, secondary: string | null): string {
  const FALLBACK = "#c5a059";
  const MIN_LUMINANCE = 0.15; // original threshold

  const getLuminance = (hex: string): number => {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  if (primary && getLuminance(primary) >= MIN_LUMINANCE) return primary;
  if (secondary && getLuminance(secondary) >= MIN_LUMINANCE) return secondary;
  
  return FALLBACK;
}
export function shadeColor(hex: string, percent: number): string {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);

  r = Math.floor(r * (1 + percent));
  g = Math.floor(g * (1 + percent));
  b = Math.floor(b * (1 + percent));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  const rr = r.toString(16).padStart(2, '0');
  const gg = g.toString(16).padStart(2, '0');
  const bb = b.toString(16).padStart(2, '0');

  return `#${rr}${gg}${bb}`;
}
