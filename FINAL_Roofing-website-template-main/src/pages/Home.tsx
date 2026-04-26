import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Construction,
  PencilRuler as ArchitectureIcon,
  Hammer as HandymanIcon,
  CheckCircle2 as VerifiedIcon,
  Droplets as WaterLuxIcon,
  Headphones as SupportAgentIcon,
  ArrowUpRight as ArrowIcon,
  X,
  Crosshair
} from 'lucide-react';
import { IMAGES } from '../constants';
import { Link } from 'react-router-dom';
import { GlowCard } from '../components/ui/spotlight-card';
import { brandConfig } from '../brandConfig';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const yearsInBusiness = new Date().getFullYear() - brandConfig.yearEstablished;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 overflow-hidden px-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/95 z-10" />
          <img
            className="w-full h-full object-cover"
            src={IMAGES.hero}
            alt="Heritage roofing background"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="micro-label">{brandConfig.certification} — Est. {brandConfig.yearEstablished}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="vanguard-heading text-[15vw] md:text-[10vw] text-white mb-10"
          >
            <span className="block">Honors Work.</span>
            <span className="block text-stroke-white">Built to Last.</span>
          </motion.h1>

          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-12 items-start md:items-center"
          >
            <div className="flex flex-col gap-2">
              <Link to="/contact" className="vanguard-btn">
                  Get a Free Estimate
              </Link>
              <Link to="/portfolio" className="vanguard-btn-outline">
                  See Our Work
              </Link>
            </div>
            <div className="max-w-sm text-base leading-relaxed text-white/80 font-normal">
              {brandConfig.city}'s trusted roofing contractor — protecting homes and families across the {brandConfig.region} since {brandConfig.yearEstablished}.
            </div>
          </motion.div>

          <div className="mt-24 flex items-center gap-7">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-300 uppercase font-medium">Rated 5 Stars by {brandConfig.stats[2].label} Local Homeowners</span>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="bg-primary py-6 overflow-hidden select-none">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 px-8">
              <span className="vanguard-heading text-xl md:text-2xl text-white">RESIDENTIAL HERITAGE</span>
              <div className="w-1 h-3 bg-black"></div>
              <span className="vanguard-heading text-xl md:text-2xl text-white">EXPERT INSTALLATION</span>
              <div className="w-1 h-3 bg-black"></div>
              <span className="vanguard-heading text-xl md:text-2xl text-white">LIFETIME GUARANTEE</span>
              <div className="w-1 h-3 bg-black"></div>
              <span className="vanguard-heading text-xl md:text-2xl text-white">VANGUARD MATERIALS</span>
              <div className="w-1 h-3 bg-black"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-8 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12 items-end">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-primary"></div>
              <span className="micro-label">By The Numbers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {brandConfig.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="text-[52px] font-black leading-none text-primary">{stat.label}</div>
                  <span className="block vanguard-heading text-xl text-white tracking-widest">{stat.sub}</span>
                  <p className="text-sm text-white/80 font-normal leading-relaxed">{stat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3 lg:col-start-10">
            <div className="border-l border-white/10 pl-8 space-y-8">
               <div className="space-y-2">
                  <span className="meta-info">NETWORK STATUS</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                    <span className="text-xs font-mono uppercase tracking-tighter">Now Scheduling — Limited Q4 Openings</span>
                  </div>
               </div>
               <GlowCard
                 glowColor="orange"
                 customSize={true}
                 className="pt-6 mt-6 border-t border-white/5 bg-black backdrop-blur-sm rounded-xl"
               >
                  <div className="text-[10px] uppercase tracking-widest font-bold text-primary">{brandConfig.certification}.</div>
                  <p className="text-sm text-white/80 mt-2 font-normal">Only 3% of Contractors Qualify. We hold the highest roofing contractor certification available — meaning you get better warranties, better materials, and a crew that's held to a higher standard on every job.</p>
               </GlowCard>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-surface">
        <div className="px-8 py-24 max-w-7xl mx-auto">
          <span className="font-mono text-primary text-xs tracking-[0.4em] uppercase mb-4 block">What We Do</span>
          <h2 className="vanguard-heading text-[5rem] md:text-[8rem] text-white">EXPERT CARE.<br/>HONEST SOLUTIONS.</h2>
        </div>

        {(() => {
          const services = [
            { id: '01', title: 'FULL ROOF REPLACEMENT', sub: 'ROOF REPLACEMENT', icon: ArchitectureIcon, image: IMAGES.serviceReplacement, desc: `Premium architectural shingles and metal roofing systems installed by certified craftsmen. Built for the ${brandConfig.region} climate and designed to protect your home for decades.` },
            { id: '02', title: 'ROOF REPAIR', sub: 'EXPERT REPAIR', icon: HandymanIcon, image: IMAGES.serviceRepair, desc: 'We find the actual source of the problem — not just the symptom. Targeted repairs that protect your investment and extend the life of your roof without unnecessary costs.' },
            { id: '03', title: 'STORM DAMAGE RESTORATION', sub: 'STORM RECOVERY', icon: VerifiedIcon, image: IMAGES.serviceStorm, desc: 'Hail, wind, and water damage assessed honestly and repaired thoroughly. We guide you through the insurance process and get your home protected fast.' },
            { id: '04', title: 'CUSTOM GUTTER SYSTEMS', sub: 'CUSTOM GUTTERS', icon: WaterLuxIcon, image: IMAGES.serviceGutters, desc: "Seamlessly fitted gutters that protect your foundation, prevent water damage, and complement your home's exterior — fabricated and installed by our own crew." },
          ];
          return (
            <div className="flex flex-col md:flex-row border-t border-surface-bright">
              <div className="w-full md:w-1/2 sticky top-0 h-[512px] md:h-screen overflow-hidden relative">
                {services.map((service, i) => (
                  <img
                    key={i}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${activeService === i ? 'opacity-100' : 'opacity-0'}`}
                    src={service.image}
                    alt={service.title}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div className="w-full md:w-1/2 flex flex-col divide-y divide-white/5">
                {services.map((service, i) => (
                  <Link
                    to="/services"
                    key={i}
                    onMouseEnter={() => setActiveService(i)}
                    className={`group p-12 transition-all cursor-pointer block border border-transparent relative overflow-hidden ${activeService === i ? 'bg-white/5 shadow-[inset_0_0_40px_rgba(255,95,0,0.2)] border-primary/30' : 'hover:bg-white/5'}`}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <span className="font-mono text-primary text-[10px] font-bold tracking-[0.3em] uppercase">{service.id} // {service.sub}</span>
                        <service.icon className={`w-6 h-6 text-white transition-all ${activeService === i ? 'opacity-100 text-primary rotate-45' : 'opacity-20'}`} />
                      </div>
                      <h3 className={`vanguard-heading text-6xl mb-6 transition-colors ${activeService === i ? 'text-primary' : 'text-white'}`}>{service.title}</h3>
                      <p className="text-white/80 max-w-md text-base leading-relaxed font-normal">{service.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Process Section */}
      <section id="our-process" className="py-32 px-8 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-20">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="micro-label">Our Process</span>
          </div>
          <h2 className="vanguard-heading text-[10vw] text-white mb-20">Simple. Transparent. Done Right.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-x divide-white/5 border border-white/5">
            {[
              { id: '01', title: 'ASSESS', desc: 'Free Roof Evaluation: We walk your property top to bottom, identify every issue, and give you a straight assessment.' },
              { id: '02', title: 'QUOTE', desc: 'Clear, Itemized Pricing: No surprises. You get a detailed, line-by-line estimate before any work begins.' },
              { id: '03', title: 'BUILD', desc: `Expert Installation: Our ${brandConfig.certification}-certified crews handle every job with the care and precision your home deserves.` },
              { id: '04', title: 'CLEAN UP', desc: 'We Leave It Better Than We Found It: Full debris removal, site cleanup, and a final walkthrough.' },
            ].map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-surface/30 flex flex-col justify-between min-h-[350px] group hover:bg-white/5 transition-all hover:shadow-[inset_0_0_40px_rgba(255,95,0,0.2)] hover:border-primary/30 border border-transparent"
              >
                <span className="text-[52px] font-black leading-none opacity-10 group-hover:opacity-100 group-hover:text-primary transition-all">{phase.id}</span>
                <div>
                  <h4 className="vanguard-heading text-4xl text-white mb-4">{phase.title}</h4>
                  <p className="text-white/80 text-sm leading-relaxed font-normal">{phase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-primary"></div>
              <p className="text-white/60 text-sm italic">Questions at any hour? We pick up the phone.</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="vanguard-heading text-3xl text-white">{brandConfig.phone}</span>
              <span className="meta-info !text-primary">Call or Text Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="bg-gradient-to-br from-primary via-orange-600 to-orange-700 py-32 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <span className="micro-label !text-white/90">LIVE STATUS // 24/7 SUPPORT ACTIVE</span>
            </div>
            <h2 className="vanguard-heading text-[6vw] text-white mb-8 drop-shadow-lg">
               <span className="block">ROOF DAMAGE CAN'T WAIT.</span>
               <span className="block text-stroke-white italic brightness-200">STORM DAMAGE OR ACTIVE LEAKS?</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <span className="vanguard-heading text-[5vw] text-black border-b-4 border-black pb-2">{brandConfig.phone}</span>
              <span className="meta-info !text-white/80">Call or Text Anytime</span>
            </div>
          </div>
          <Link to="/contact" className="bg-black text-white hover:bg-white hover:text-black transition-all px-20 py-12 flex flex-col items-center gap-4 group shadow-2xl">
            <SupportAgentIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />
            <span className="tracking-widest font-black text-sm uppercase">Schedule Emergency Inspection</span>
          </Link>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-32 px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <h2 className="vanguard-heading text-[5vw] text-white">What Homeowners<br/>Are Saying.</h2>
            <div className="text-right">
              <div className="text-primary vanguard-heading text-xl mb-2">Real Reviews. Real Results.</div>
              <Link to="/portfolio" className="vanguard-btn-outline inline-block">View All Testimonials</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/5 divide-x divide-white/5">
            {[
              { name: 'Mark Wallace', role: 'Local Homeowner', text: '"They didn\'t just replace our roof — they took the time to understand our 1920s home and matched everything perfectly. Truly a cut above."' },
              { name: 'Sarah Klein', role: 'Homeowner', text: '"After the hail storm I was dreading the whole process. Their team was honest about what actually needed work and what didn\'t. Saved me money and stress."' },
              { name: 'James Hudson', role: 'Property Manager', text: '"I\'ve hired a lot of contractors over the years. These guys recommended a repair over a full replacement and saved me thousands. That kind of integrity is rare."' },
            ].map((review, i) => (
              <div key={i} className="p-12 hover:bg-white/5 transition-all hover:shadow-[inset_0_0_40px_rgba(255,95,0,0.2)] hover:border-primary/30 border border-transparent">
                <div className="flex gap-0.5 mb-10">
                  {[...Array(5)].map((_, j) => <div key={j} className="w-1.5 h-3 bg-primary" />)}
                </div>
                <p className="text-white font-normal italic mb-12 leading-relaxed text-base">{review.text}</p>
                <div className="pt-8 border-t border-white/10">
                  <span className="block vanguard-heading text-xl text-white">{review.name}</span>
                  <span className="meta-info">{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-40 px-8 bg-surface relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="relative shrink-0 w-[240px] h-[240px]">
            <div className="w-full h-full border border-primary/20 rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite]">
              <svg className="w-full h-full p-4" viewBox="0 0 200 200">
                <path d="M 100, 100 m -85, 0 a 85,85 0 1,0 170,0 a 85,85 0 1,0 -170,0" fill="transparent" id="circlePath" />
                <text className="font-mono text-[9px] fill-primary uppercase tracking-[0.4em] font-bold">
                  <textPath xlinkHref="#circlePath">SYSTEM INTEGRITY • VANGUARD QUALITY • MASTER ELITE STATUS •</textPath>
                </text>
              </svg>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="vanguard-heading text-8xl text-white">{yearsInBusiness}</span>
              <span className="micro-label">YEARS</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="micro-label mb-4 block">Our Guarantee</span>
            <h2 className="vanguard-heading text-[6vw] text-white mb-8 leading-tight">We Stand Behind Every Roof We Build.</h2>
            <p className="text-white text-xl max-w-2xl leading-relaxed font-normal italic mb-10">Every project comes with our fully transferable {yearsInBusiness}-year labor and materials warranty. If anything goes wrong — we come back and make it right. No runaround. No fine print.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
               {[`${yearsInBusiness}-Year Transferable Warranty`, `${brandConfig.certification}`, `Licensed & Insured — ${brandConfig.state}`, `${brandConfig.stats[2].label} 5-Star Reviews`].map(signal => (
                 <div key={signal} className="flex items-center gap-3">
                   <VerifiedIcon className="w-4 h-4 text-primary shrink-0" />
                   <span className="text-[10px] uppercase tracking-wider font-bold text-white/60">{signal}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Zones / Areas Served */}
      <section className="py-40 px-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-12 gap-12 mb-20 items-end">
            <div className="col-span-12 lg:col-span-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="micro-label">Deployment Zones</span>
              </div>
              <h2 className="vanguard-heading text-[8vw] md:text-[6vw] text-white leading-[0.9]">{brandConfig.region.toUpperCase()}<br/>COVERAGE.</h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:text-right">
              <p className="text-white/60 text-sm max-w-sm ml-auto font-normal leading-relaxed mb-6">
                Operational across the Eastern Shore and Delaware. We provide rapid response and master-grade installation within a 50-mile radius of our {brandConfig.city} HQ.
              </p>
              <div className="flex items-center gap-3 lg:justify-end">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-bold">{brandConfig.serviceAreas.length} Priority Zones Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/5 bg-white/5 divide-x divide-y md:divide-y-0 divide-white/5">
            {brandConfig.serviceAreas.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden"
              >
                <Link to="/contact" className="block p-12 hover:bg-black/40 transition-all hover:shadow-[inset_0_0_40px_rgba(255,95,0,0.15)] h-full">
                  <div className="flex justify-between items-start mb-16">
                    <span className="font-mono text-[10px] text-white/30 group-hover:text-primary transition-colors">{area.code}</span>
                    <Crosshair className="w-4 h-4 text-white/10 group-hover:text-primary group-hover:rotate-90 transition-all" />
                  </div>
                  <div>
                    <h5 className="vanguard-heading text-4xl text-white mb-2">{area.city}</h5>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/40">{area.state}</span>
                      <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                      <span className="text-[10px] font-mono text-white/40">{area.zip}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/0 group-hover:bg-primary transition-all duration-700"></div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-widest mb-2">Latitude</span>
                <span className="text-white text-xs font-mono">38.3607° N</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-widest mb-2">Longitude</span>
                <span className="text-white text-xs font-mono">75.5994° W</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-white tracking-[0.4em] uppercase">Deployment Readiness: 100%</div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Message */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-40 flex justify-center md:justify-end p-6 pointer-events-none"
          >
            <GlowCard
              glowColor="orange"
              customSize={true}
              bgSpotOpacity={0}
              className="pointer-events-auto border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-12 !p-8 overflow-hidden rounded-xl relative"
            >
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 group/close"
                aria-label="Close message"
              >
                <X className="w-4 h-4 group-hover/close:rotate-90 transition-transform" />
              </button>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="orb-glow animate-orb" />
              </div>

              {brandConfig.isPreview ? (
                // Step 5 — Contractor conversion copy
                <>
                  <div className="flex items-center gap-6 relative z-10 font-sans">
                    <div className="w-12 h-1 bg-primary" />
                    <div>
                      <span className="micro-label block mb-1">Built for {brandConfig.companyNameFull}</span>
                      <h6 className="vanguard-heading text-2xl text-white uppercase">Like what you see?</h6>
                      <p className="text-white/80 text-xs mt-1 max-w-sm">
                        This is a free personalized preview — fully customized and live within 48 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <a
                      href="https://woodfireddesigns.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vanguard-btn"
                    >
                      See How It Works →
                    </a>
                  </div>
                </>
              ) : (
                // Default homeowner CTA
                <>
                  <div className="flex items-center gap-6 relative z-10 font-sans">
                    <div className="w-12 h-1 bg-primary" />
                    <div>
                      <h6 className="vanguard-heading text-2xl text-white uppercase">Ready to Protect Your Home?</h6>
                      <p className="text-white/80 text-xs mt-1 max-w-md">Free estimates. No pressure. Just honest advice from a contractor you can actually trust. Most estimates completed within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <Link to="/contact" className="vanguard-btn">Get Your Free Estimate</Link>
                  </div>
                </>
              )}
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
