import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, CheckCircle, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type LeadQueueData, MOCK_DATA } from '../types/lead';
import PreviewBanner from '../components/PreviewBanner';
import { Hero } from "@/components/ui/animated-hero";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { ServiceAreaCards } from "../components/ServiceAreaCards";
import { TrustBadges } from "../components/TrustBadges";
import { pickAccentColor } from "../lib/utils";

const DEFAULT_SERVICES = [
  "Asphalt Shingles", "Metal Roofing", "Flat & Low-Slope Roofing",
  "Roof Repair", "Emergency Roof Repair", "Gutter Installation & Repair",
  "Roof Inspection", "Storm Damage Restoration",
  "Insurance Claims Assistance", "Ventilation & Skylights"
];

const DEFAULT_CERTIFICATIONS = [
  "Licensed & Insured",
  "GAF Certified Contractor",
  "Owens Corning Preferred Contractor",
  "BBB Accredited Business"
];

const serviceImages: Record<string, string> = {
  "asphalt":    "/asphalt-services-1.png",
  "metal":      "/metal-services-2.png",
  "flat":       "/flat-low-slope-services-3.png",
  "emergency":  "/emergency-roof-repair-services-5.png",
  "gutter":     "/gutters-services-6.png",
  "inspection": "/inspection-services-7.png",
  "storm":      "/storm-damage-restoration.png",
  "insurance":  "/insurance-services-9.png",
  "repair":     "/roof-repair-services-4.png",
  "ventilation":"https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
  "default":    "/asphalt-services-1.png",
};

export default function RoofingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<LeadQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      if (!slug) return;
      
      // 1. Try lead_queue (the curated preview table)
      let { data: lead, error } = await supabase
        .from('lead_queue')
        .select('*')
        .eq('slug', slug)
        .single();

      // 2. Fallback to roofing_leads if not in queue
      if (error || !lead) {
        const { data: leadRecord, error: leadError } = await supabase
          .from('roofing_leads')
          .select('*, brand_ux_kit')
          .eq('slug', slug)
          .single();
        
        if (!leadError && leadRecord) {
          // Map roofing_leads to LeadQueueData
          const kit = leadRecord.brand_ux_kit;
          lead = {
            slug: leadRecord.slug,
            company_name: leadRecord.business_name,
            hero_copy: leadRecord.tagline || "",
            brand_color_accent: kit?.accent || pickAccentColor(leadRecord.brand_primary_color, leadRecord.brand_secondary_color),
            brand_color_dark: kit?.background || '#0a0a0a',
            brand_color_light: '#f5f5f4',
            brand_color_surface: kit?.surface || '#141414',
            brand_font: kit?.font_display || leadRecord.brand_font,
            service_area: leadRecord.service_areas || (leadRecord.city ? [leadRecord.city] : []),
            services: leadRecord.services || DEFAULT_SERVICES,
            logo_url: leadRecord.logo_url || "",
            review_snippets: leadRecord.review_snippets,
            review_authors: null,
            certifications: leadRecord.certifications || DEFAULT_CERTIFICATIONS,
            owner_name: leadRecord.owner_name,
            phone: leadRecord.phone,
            city: leadRecord.city,
            state: leadRecord.state,
            google_review_count: leadRecord.google_review_count,
            google_star_rating: leadRecord.google_star_rating,
            brand_primary_raw: leadRecord.brand_primary_color,
          };
        }
      }

      if (lead) {
        setData(lead as LeadQueueData);
        await supabase.rpc('increment_preview_views', { lead_slug: slug });
      } else {
        if (slug === 'apex-heritage') {
          setData(MOCK_DATA);
        } else {
          console.error('Lead not found for slug:', slug);
        }
      }
      setLoading(false);
    }

    fetchLead();
  }, [slug]);

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-accent', data.brand_color_accent || '#c5a059');
    root.style.setProperty('--brand-dark', data.brand_color_dark || '#0a0a0a');
    root.style.setProperty('--brand-light', data.brand_color_light || '#f5f5f4');
    root.style.setProperty('--brand-surface', data.brand_color_surface || '#141414');
    root.style.setProperty('--brand-primary', (data as any).brand_primary_raw || '#061b31');
    
    if (data.brand_font) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${data.brand_font.replace(/ /g, '+')}:wght@300;400;500;700;900&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      root.style.setProperty('--font-display', `"${data.brand_font}", sans-serif`);
    } else {
      root.style.setProperty('--font-display', '"Inter", sans-serif');
    }

    return () => {
      root.style.removeProperty('--brand-accent');
      root.style.removeProperty('--brand-dark');
      root.style.removeProperty('--brand-light');
      root.style.removeProperty('--font-display');
    };
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    const formData = new FormData(e.currentTarget);
    const payload = {
      lead_slug: slug,
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      service: formData.get('service'),
      message: formData.get('message'),
    };

    const { error } = await supabase.from('estimate_requests').insert([payload]);

    if (error) {
      console.error('Error submitting form:', error);
      setFormStatus('error');
    } else {
      setFormStatus('success');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-accent)]"></div>
      </div>
    );
  }

  if (!data) return <div>Lead not found</div>;

  const services = data.services || DEFAULT_SERVICES;
  const certifications = data.certifications || DEFAULT_CERTIFICATIONS;
  const reviews = (data.review_snippets || MOCK_DATA.review_snippets || []).map((text, i) => ({
    text,
    author: (data.review_authors || MOCK_DATA.review_authors || [])[i] || 'Anonymous'
  }));

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* 1. Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#CACACB] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {(data.logo_url && !logoError) ? (
            <img 
              src={data.logo_url} 
              alt={data.company_name} 
              className="h-10 md:h-12 w-auto" 
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-2xl nike-display text-[var(--brand-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
              {data.company_name}
            </span>
          )}
        </div>
        <div className="hidden lg:flex items-center space-x-8">
          <a href="#services" className="text-xs font-black text-[var(--brand-primary)] uppercase hover:text-[var(--brand-accent)] transition-colors">Services</a>
          <a href="#process" className="text-xs font-black text-[var(--brand-primary)] uppercase hover:text-[var(--brand-accent)] transition-colors">Our Process</a>
          <a href="#reviews" className="text-xs font-black text-[var(--brand-primary)] uppercase hover:text-[var(--brand-accent)] transition-colors">Testimonials</a>
          <a href={`tel:${data.phone || '410-555-0123'}`} className="flex items-center text-sm font-black text-[var(--brand-primary)] hover:text-[var(--brand-accent)] transition-colors">
            <Phone size={16} className="mr-2 text-[var(--brand-accent)]" />
            CLICK TO CALL
          </a>
          <a href="#estimate">
            <ButtonColorful label="Get Free Estimate" />
          </a>
        </div>
        <div className="lg:hidden">
            <Menu size={24} />
        </div>
      </nav>

      {/* 2. Hero */}
      <section className="relative w-full bg-[var(--brand-dark)] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/hero.png" 
            alt="Roofing Hero" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-dark)] via-transparent to-[var(--brand-dark)]"></div>
        </div>
        <div className="relative z-10">
          <Hero 
            companyName={data.company_name} 
            heroCopy={data.hero_copy || ""} 
            phone={data.phone || "410-555-0123"}
          />
        </div>
      </section>

      {/* 3. Trust Bar (Stripe Style) */}
      <section className="bg-[var(--brand-light)] py-12 border-b border-[#CACACB]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 items-center">
          <div className="flex justify-center grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/google-reviews-badge.png" alt="Google Reviews" className="h-12 md:h-16 w-auto object-contain" />
          </div>
          <div className="flex justify-center grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/bbb-badge.webp" alt="BBB Accredited" className="h-12 md:h-16 w-auto object-contain" />
          </div>
          <div className="flex justify-center grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/trustpilot-badge.png" alt="Trustpilot" className="h-12 md:h-16 w-auto object-contain" />
          </div>
          <div className="flex justify-center grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/yelp-badge.png" alt="Yelp" className="h-12 md:h-16 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* 4. Services Grid (Nike Style) */}
      <section id="services" className="py-24">
        <div className="px-6 mb-16">
          <h2 className="text-6xl md:text-8xl nike-display text-[#111111] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            WHAT WE DO
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
          {services.slice(0, 9).map((service, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group relative aspect-[4/3] overflow-hidden bg-black"
            >
              <img 
                src={Object.keys(serviceImages).find(k => service.toLowerCase().includes(k)) ? serviceImages[Object.keys(serviceImages).find(k => service.toLowerCase().includes(k))!] : serviceImages.default} 
                alt={service}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                <h3 className="text-3xl nike-display text-white tracking-tight transform group-hover:-translate-y-2 transition-transform duration-500">{service}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Testimonials (Animated 21st.dev Style) */}
      <AnimatedTestimonials 
        title="HEAR FROM THE COMMUNITY"
        subtitle={`See what your neighbors in ${data.city} and throughout ${data.state} have to say about ${data.company_name}.`}
        badgeText={`${data.google_review_count}+ Happy Homeowners`}
        testimonials={reviews.map((r, i) => ({
          id: i,
          name: r.author,
          role: "Homeowner",
          company: `${data.city}, ${data.state}`,
          content: r.text,
          rating: 5,
          avatar: `https://i.pravatar.cc/150?u=${r.author}`
        }))}
        trustedCompanies={data.certifications?.slice(0, 5) || []}
      />

      {/* 6. The Process (Nike Style) */}
      <section id="process" className="py-32 bg-[var(--brand-surface)] text-white">
        <div className="px-6 max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-8xl nike-display mb-20 leading-none" style={{ fontFamily: 'var(--font-display)' }}>THE PROCESS</h2>
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { title: "Free Inspection", desc: "Detailed assessment of your roof's current health." },
              { title: "Custom Quote", desc: "A transparent, comprehensive solution for your home." },
              { title: "Expert Build", desc: "Factory-certified crews using premium materials." },
              { title: "Final Walkthrough", desc: "We don't leave until you are 100% satisfied." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-5xl nike-display text-[var(--brand-accent)] mb-4">{i + 1}</span>
                <h3 className="text-2xl nike-display mb-4">{step.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Certifications & Trust (Interactive Badges) */}
      <TrustBadges certifications={certifications} />

      {/* 8. Free Estimate Form (Stripe Style) */}
      <section id="estimate" className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-stripe p-10 md:p-16 border border-gray-100">
            <h2 className="text-4xl stripe-display text-[var(--brand-primary)] mb-4 text-center">Get Your Free Estimate</h2>
            <p className="text-[#425466] text-center mb-12">Professional assessment and transparent pricing. No obligation.</p>
            
            {formStatus === 'success' ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--brand-primary)] mb-2">Thank you!</h3>
                <p className="text-[#425466]">We've received your request and will contact you shortly.</p>
                <button 
                  onClick={() => setFormStatus('idle')}
                  className="mt-8 text-[var(--brand-accent)] font-bold uppercase text-sm"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--brand-primary)] uppercase">Full Name</label>
                    <input name="name" required type="text" className="w-full px-4 py-3 rounded-[4px] border border-gray-200 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--brand-primary)] uppercase">Phone Number</label>
                    <input name="phone" required type="tel" className="w-full px-4 py-3 rounded-[4px] border border-gray-200 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--brand-primary)] uppercase">Email Address</label>
                    <input name="email" required type="email" className="w-full px-4 py-3 rounded-[4px] border border-gray-200 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--brand-primary)] uppercase">Service Needed</label>
                    <select name="service" required className="w-full px-4 py-3 rounded-[4px] border border-gray-200 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none bg-white">
                      {services.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--brand-primary)] uppercase">Property Address</label>
                  <input name="address" required type="text" className="w-full px-4 py-3 rounded-[4px] border border-gray-200 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--brand-primary)] uppercase">Message / Details</label>
                  <textarea name="message" rows={4} className="w-full px-4 py-3 rounded-[4px] border border-gray-200 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] outline-none"></textarea>
                </div>
                <div className="pt-4 text-center">
                  <ButtonColorful 
                    label={formStatus === 'submitting' ? 'Submitting...' : 'Send Request'} 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full h-16 text-sm"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. Interactive Service Area Section */}
      <ServiceAreaCards cities={data.service_area} />

      {/* 10. FAQ Accordion (Stripe Style) */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl stripe-display text-[var(--brand-primary)] mb-16 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How long does a typical roof replacement take?", a: "Most residential roof replacements are completed in just 1-2 days, depending on the size of the home and weather conditions." },
              { q: "Do you work with insurance companies?", a: "Yes, we specialize in insurance claim assistance. We can meet with your adjuster on-site and ensure you get full coverage for storm damage." },
              { q: "What roofing materials do you recommend?", a: "We primarily recommend GAF or Owens Corning architectural shingles for their durability and lifetime warranties, but we offer a full range of metal and flat roofing options." },
              { q: "Do you offer financing?", a: "Yes! We have several flexible financing options available, including 0% interest and low monthly payment plans to fit any budget." },
              { q: "What warranty do you provide?", a: "We provide a double-layered warranty: a lifetime manufacturer's warranty on materials and our own 10-year workmanship guarantee." },
              { q: "How do I know if I need a full replacement or just a repair?", a: "Our free inspection includes a multi-point assessment. If your roof has widespread leaking, many missing shingles, or is over 20 years old, a replacement is usually more cost-effective." }
            ].map((faq, i) => (
              <div key={i} className="border border-[var(--brand-primary)]/20 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-[var(--brand-primary)]">{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-[#425466] leading-relaxed border-t border-gray-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Emergency CTA Banner (Nike Style) */}
      <section className="relative py-32 overflow-hidden bg-[var(--brand-dark)]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/storm-section-background.png"
            alt="Storm Background"
            className="h-full w-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-dark)] via-[var(--brand-dark)]/80 to-[var(--brand-dark)]"></div>
        </div>
        
        <div className="relative z-10 px-6 text-center max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-8xl lg:text-9xl nike-display text-white mb-8 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            STORM <span className="text-[var(--brand-accent)]">DAMAGE?</span>
          </h2>
          <p className="text-2xl md:text-3xl font-black mb-12 text-white uppercase tracking-tighter">
            WE RESPOND 24/7. CALL THE EXPERTS NOW.
          </p>
          <div className="mb-12">
            <a href={`tel:${data.phone || '410-555-0123'}`} className="text-4xl md:text-7xl font-black text-white hover:text-[var(--brand-accent)] transition-colors duration-500">
              {data.phone || '410-555-0123'}
            </a>
          </div>
          <a 
            href={`tel:${data.phone || '410-555-0123'}`}
            className="inline-block"
          >
            <ButtonColorful label="Emergency Response" className="h-20 px-16 text-base" />
          </a>
        </div>
      </section>

      {/* 13. Footer (Nike Style) */}
      <footer className="py-24 bg-[var(--brand-dark)] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
             <span className="text-3xl nike-display block mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              {data.company_name}
            </span>
            <div className="flex items-center text-gray-400 mb-2">
              <MapPin size={18} className="mr-2" />
              <span>{data.city}, {data.state}</span>
            </div>
            <div className="flex items-center text-gray-400 mb-2">
              <Phone size={18} className="mr-2" />
              <span>{data.phone || '410-555-0123'}</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest text-[var(--brand-accent)] mb-6">Service Areas</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              {data.service_area.map((city, i) => <li key={i}>{city}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest text-[var(--brand-accent)] mb-6">Our Services</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              {services.slice(0, 5).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-600 text-[10px] uppercase font-bold tracking-widest">
          <p>© {new Date().getFullYear()} {data.company_name}. ALL RIGHTS RESERVED.</p>
          <p>BUILT BY WOOD FIRED DESIGNS</p>
        </div>
      </footer>

      <PreviewBanner />
      
      {/* Marquee Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
