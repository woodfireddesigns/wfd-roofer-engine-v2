export interface LeadQueueData {
  slug: string;
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
  phone: string | null;
  city: string | null;
  state: string | null;
  google_review_count: number | null;
  google_star_rating: number | null;
  brand_color_surface?: string;
}

export const MOCK_DATA: LeadQueueData = {
  slug: "apex-heritage",
  company_name: "Apex Forge Roofing",
  hero_copy: "UNFAILING PROTECTION FOR GENERATIONS.",
  brand_color_accent: "#c5a059",
  brand_color_dark: "#061b31",
  brand_color_light: "#f5f5f4",
  brand_color_surface: "#0a1f35",
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
  phone: "410-555-0123",
  city: "Salisbury",
  state: "MD",
  google_review_count: 87,
  google_star_rating: 4.8,
};
