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
