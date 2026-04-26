'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, PencilRuler, Hammer, CheckCircle2, Droplets, Headphones,
  ArrowUpRight, X, Crosshair, ShieldCheck, Timer, Calendar
} from 'lucide-react'

// Swap this one URL when the WFD landing page is ready
const WFD_URL = 'https://woodfireddesigns.com'

const SETUP_PRICE = '$297'
const MONTHLY_PRICE = '$49/mo'

const IMAGES = {
  hero:        '/hero.png',
  worker:      '/workers-in-action.png',
  site:        '/work-in-progress.png',
  cinematic:   '/cinematic-cool-shot.jpeg',
  detail:      '/detail-shot.jpeg',
  caseStudy1:  '/luxury-home-roof.jpeg',
  caseStudy2:  '/commercial-roofing.jpeg',
  caseStudy3:  '/emergency-roof.jpeg',
  asphalt:     '/asphalt.png',
  inspection:  '/roof-inspection.png',
  replacement: '/roof-replacement.png',
  estimate:    '/schedule-an-estimate.png',
  greatRoof:   '/great-looking-roof.png',
  // Service hover images — What We Do section
  svcReplacement: '/roof-replacement.png',
  svcRepair:      '/roof-inspection.png',
  svcStorm:       '/emergency-roof.jpeg',
  svcGutters:     '/gutters.jpeg',
  // Functional Capacity Systems section
  sysHeritage:    '/luxury-home-roof.jpeg',
  sysIndustrial:  '/commercial-roofing.jpeg',
  sysStorm:       '/emergency-roof.jpeg',
}

export interface LeadData {
  business_name: string
  city: string
  state: string
  phone: string
  tagline: string
  brand_primary_color: string
  google_star_rating: number
  google_review_count: number
  score: number
  slug: string
}

function getLuminance(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 0
  const [r, g, b] = [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function trackClick(slug: string, section: string) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ slug, section }),
  }).catch(() => {}) // fire-and-forget, never block the click
}

export default function PreviewClient({ lead }: { lead: LeadData }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeService, setActiveService] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [badgeVisible, setBadgeVisible] = useState(true)
  const [badgeScrolled, setBadgeScrolled] = useState(false)

  const primary = lead.brand_primary_color || '#ff5f00'
  const lum = getLuminance(primary)
  const onPrimary = lum > 0.35 ? '#0a0a0a' : '#ffffff'

  const companyName = lead.business_name.split(' ').slice(0, 2).join(' ').toUpperCase()
  const companyNameFull = lead.business_name
  const city = lead.city || 'Your City'
  const state = lead.state || ''
  const phone = lead.phone || '1-800-ROOFING'
  const rawTagline = (lead.tagline || '').split('\n')[0].trim()
  const tagline = /^\d{3}|forbidden|not found|unauthorized|error/i.test(rawTagline)
    ? 'Honest Work. Built to Last.'
    : rawTagline || 'Honest Work. Built to Last.'
  const stars = lead.google_star_rating || 5
  const reviewCount = lead.google_review_count || 0
  const yearEst = Math.max(2010, 2026 - Math.max(5, Math.floor((lead.score || 6) * 1.2)))
  const yearsInBusiness = 2026 - yearEst
  const region = ['MD', 'DE', 'VA', 'PA', 'NJ'].includes(state) ? 'Mid-Atlantic' : state || 'Mid-Atlantic'
  const certification = 'GAF Master Elite Certified'

  const serviceAreas = [
    { city: city.toUpperCase(), state, code: 'HQ-01', zip: '21801' },
    { city: 'SURROUNDING AREAS', state, code: 'SR-02', zip: '' },
    { city: 'METRO REGION', state, code: 'MR-03', zip: '' },
    { city: 'RURAL ROUTES', state, code: 'RR-04', zip: '' },
  ]

  const stats = [
    { label: `${yearsInBusiness}+`, sub: 'Years Serving the Region', desc: `Trusted craftsmanship since ${yearEst}` },
    { label: '500+', sub: 'Roofs Completed', desc: 'Residential and commercial across the ' + region },
    { label: reviewCount > 0 ? `${reviewCount}+` : '400+', sub: '5-Star Reviews', desc: 'From verified local homeowners' },
  ]

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setBadgeScrolled(window.scrollY > 80)
      // Show sticky CTA after 40% scroll depth
      const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrollPct >= 0.4) setStickyVisible(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { name: 'Services',    action: () => scrollTo('services') },
    { name: 'Portfolio',   action: () => scrollTo('portfolio') },
    { name: 'Our Process', action: () => scrollTo('our-process') },
    { name: 'Contact',     action: () => scrollTo('contact') },
  ]

  /* ── shared inline style helpers ── */
  const P = primary
  const h = (size: number | string, extra?: React.CSSProperties): React.CSSProperties => ({
    fontFamily: 'var(--font-anton), Anton, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '-0.025em',
    lineHeight: 1,
    fontSize: size,
    ...extra,
  })
  const micro: React.CSSProperties = { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4em', color: P }
  const meta: React.CSSProperties  = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 400, color: 'rgba(255,255,255,0.8)' }
  const mono: React.CSSProperties  = { fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace' }
  const dividerLine = (h: 1) => ({ height: 1, width: 48, background: P } as React.CSSProperties)

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        :root { --color-primary: ${P}; }
        .wfd-btn { background:white;color:black;padding:20px 40px;font-family:var(--font-anton),Anton,sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:.15em;border:1px solid white;transition:all .2s;cursor:pointer;display:inline-block;text-decoration:none; }
        .wfd-btn:hover { background:${P};color:${onPrimary};border-color:${P}; }
        .wfd-btn:focus-visible,.wfd-btn-outline:focus-visible,.wfd-nav-link:focus-visible { outline:2px solid ${P};outline-offset:3px; }
        .wfd-btn-outline { border:1px solid rgba(255,255,255,.2);color:white;padding:20px 40px;font-family:var(--font-anton),Anton,sans-serif;font-size:13px;text-transform:uppercase;letter-spacing:.15em;transition:all .2s;cursor:pointer;display:inline-block;text-decoration:none; }
        .wfd-btn-outline:hover { background:white;color:black; }
        .wfd-svc { transition:all .3s; }
        .wfd-svc:hover,.wfd-svc-active { background:rgba(255,255,255,.03);box-shadow:inset 0 0 40px ${P}33; }
        .wfd-svc-active h3 { color:${P}!important; }
        .wfd-svc-active .wfd-svc-icon { opacity:1!important;color:${P}!important; }
        .wfd-process:hover .wfd-process-num { opacity:1!important;color:${P}!important; }
        .wfd-process:hover { background:rgba(255,255,255,.05);box-shadow:inset 0 0 40px ${P}33; }
        .wfd-area:hover { background:rgba(0,0,0,.4);box-shadow:inset 0 0 40px ${P}26; }
        .wfd-review:hover { background:rgba(255,255,255,.03);box-shadow:inset 0 0 40px ${P}33; }
        .wfd-proj:hover img { filter:grayscale(0);transform:scale(1.08); }
        .wfd-proj:hover h3 { color:${P}!important; }
        .wfd-svc-img:hover { opacity:1!important; }
        .marquee-track { display:flex;width:max-content;animation:wfd-scroll 60s linear infinite; }
        @keyframes wfd-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes wfd-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .wfd-spin { animation:wfd-spin 30s linear infinite; }
        @keyframes wfd-pulse-line {
          0%,100%{box-shadow:0 0 8px 2px ${P}66;opacity:.8}
          50%{box-shadow:0 0 14px 4px ${P}aa;opacity:1}
        }
        .wfd-line-pulse { animation:wfd-pulse-line 3s ease-in-out infinite; }
        .wfd-grain { position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:.02;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .wfd-nav-link { font-size:11px;text-transform:uppercase;letter-spacing:.1em;font-weight:900;color:rgba(255,255,255,.7);cursor:pointer;transition:color .2s;background:none;border:none;min-height:44px;padding:0 8px; }
        .wfd-nav-link:hover { color:${P}; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation:none; }
          .wfd-spin { animation:none; }
          .wfd-line-pulse { animation:none; }
        }
        .wfd-skip { position:fixed;top:-100px;left:24px;z-index:200;background:${P};color:${onPrimary};padding:12px 24px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-decoration:none;border-radius:4px;transition:top .2s; }
        .wfd-skip:focus { top:24px; }
        .wfd-preview-bar { position:fixed;top:0;left:0;width:100%;z-index:60;background:${P};color:${onPrimary};display:flex;align-items:center;justify-content:center;gap:16px;padding:10px 24px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em; }
        .wfd-preview-bar a { color:${onPrimary};text-decoration:underline;text-underline-offset:3px;white-space:nowrap; }
        .wfd-preview-bar a:hover { opacity:.8; }
        @media (max-width:480px) { .wfd-preview-bar span.wfd-bar-sub { display:none; } }

        /* ── RESPONSIVE LAYOUT SYSTEM ── */
        .wfd-nav-desktop { display:flex;align-items:center;gap:48px;padding-top:4px; }
        .wfd-hamburger { display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;min-width:44px;min-height:44px;align-items:center;justify-content:center; }
        .wfd-hamburger span { display:block;width:22px;height:2px;background:white;transition:all .3s; }
        .wfd-mobile-menu { display:none; }

        .wfd-section-pad { padding:128px 48px; }
        .wfd-inner { max-width:1280px;margin:0 auto; }

        .wfd-grid-3 { display:grid;grid-template-columns:repeat(3,1fr); }
        .wfd-grid-4 { display:grid;grid-template-columns:repeat(4,1fr); }
        .wfd-grid-2 { display:grid;grid-template-columns:1fr 1fr; }
        .wfd-grid-2-1 { display:grid;grid-template-columns:2fr 1fr;gap:48px;align-items:end; }
        .wfd-grid-footer { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px; }
        .wfd-grid-contact { display:grid;grid-template-columns:1fr 1fr;gap:96px;align-items:start; }
        .wfd-grid-form-row { display:grid;grid-template-columns:1fr 1fr;gap:48px; }
        .wfd-grid-stats-inner { display:grid;grid-template-columns:repeat(3,1fr);gap:48px; }

        .wfd-split { display:flex;border-top:1px solid rgba(255,255,255,.08); }
        .wfd-split-left { width:50%;position:sticky;top:0;height:512px;flex-shrink:0; }
        .wfd-split-right { width:50%;display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.05); }

        .wfd-process-grid { display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(255,255,255,.05); }

        .wfd-sticky-card { display:flex;border-radius:12px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.9);border:1px solid rgba(255,255,255,.08);max-width:700px;width:100%;position:relative; }
        .wfd-sticky-left { background:#111;padding:28px 32px;flex:1;overflow:hidden; }
        .wfd-sticky-right { background:${P};color:${onPrimary};display:flex;align-items:center;justify-content:center;padding:28px 40px;text-decoration:none;flex-shrink:0;position:relative;min-width:220px; }
        .wfd-hide-desktop { display:none; }

        @media (max-width:768px) {
          .wfd-nav-desktop { display:none; }
          .wfd-hamburger { display:flex; }
          .wfd-mobile-menu { display:flex;flex-direction:column;gap:0;width:100%;border-top:1px solid rgba(255,255,255,.08);margin-top:16px; }
          .wfd-mobile-menu button { width:100%;text-align:left;padding:16px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,.05);min-height:48px; }

          .wfd-section-pad { padding:72px 20px; }

          .wfd-grid-3 { grid-template-columns:1fr; }
          .wfd-grid-4 { grid-template-columns:1fr 1fr; }
          .wfd-grid-2 { grid-template-columns:1fr; }
          .wfd-grid-2-1 { grid-template-columns:1fr; }
          .wfd-grid-footer { grid-template-columns:1fr 1fr; }
          .wfd-grid-contact { grid-template-columns:1fr;gap:48px; }
          .wfd-grid-form-row { grid-template-columns:1fr;gap:32px; }
          .wfd-grid-stats-inner { grid-template-columns:1fr;gap:32px; }

          .wfd-split { flex-direction:column; }
          .wfd-split-left { width:100%;height:260px;position:relative;top:auto; }
          .wfd-split-right { width:100%;border-left:none;border-top:1px solid rgba(255,255,255,.05); }

          .wfd-process-grid { grid-template-columns:1fr 1fr; }

          .wfd-sticky-card { max-height:15vh;overflow:hidden; }
          .wfd-sticky-left { padding:10px 14px; }
          .wfd-sticky-right { display:none; }
          .wfd-hide-desktop { display:flex!important; }

          .wfd-hide-mobile { display:none!important; }
          .wfd-border-r-none { border-right:none!important; }
        }

        @media (max-width:480px) {
          .wfd-grid-4 { grid-template-columns:1fr; }
          .wfd-grid-footer { grid-template-columns:1fr; }
          .wfd-process-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <a href="#hero" className="wfd-skip">Skip to content</a>

      {/* ── PERSISTENT PREVIEW BANNER ── */}
      <div className="wfd-preview-bar" role="banner" aria-label="Preview site notice">
        <span>⚡</span>
        <span>This is <strong>{companyNameFull}</strong>'s personalized preview site.</span>
        <span className="wfd-bar-sub" style={{ opacity: 0.7 }}>·</span>
        <a href={WFD_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(lead.slug, 'banner')}>Want it live for your business? →</a>
      </div>

      <div style={{ background: '#050505', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', overflowX: 'hidden', paddingTop: 40 }}>
        <div className="wfd-grain" aria-hidden="true" />

        {/* ── NAV ── */}
        <nav aria-label="Primary navigation" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, transition: 'all .3s', background: isScrolled || isMobileMenuOpen ? 'rgba(5,5,5,.95)' : 'transparent', backdropFilter: isScrolled ? 'blur(12px)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 24px 24px' }}>
            <button onClick={() => { scrollTo('hero'); setIsMobileMenuOpen(false) }} style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={micro}>{certification} — Est. {yearEst}</span>
              <span style={h('clamp(22px,5vw,36px)', { color: 'white', marginTop: 4 })}>{companyName}.</span>
            </button>

            {/* Desktop nav */}
            <div className="wfd-nav-desktop">
              <div style={{ display: 'flex', gap: 40 }}>
                {navLinks.map(link => (
                  <button key={link.name} onClick={link.action} className="wfd-nav-link">{link.name}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderLeft: '1px solid rgba(255,255,255,.1)', paddingLeft: 24 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={meta}>LOCATION</div>
                  <div style={{ ...mono, fontSize: 13, color: 'white' }}>{city}, {state}</div>
                </div>
                <button onClick={() => setIsModalOpen(true)} aria-label="Get a free estimate" style={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white', background: 'transparent', cursor: 'pointer', transition: 'all .2s' }}>+</button>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="wfd-hamburger"
              onClick={() => setIsMobileMenuOpen(v => !v)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }} />
              <span style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
          </div>

          {/* Mobile dropdown */}
          {isMobileMenuOpen && (
            <div className="wfd-mobile-menu" style={{ padding: '0 24px 24px' }}>
              {navLinks.map(link => (
                <button key={link.name} onClick={() => { link.action(); setIsMobileMenuOpen(false) }} className="wfd-nav-link">{link.name}</button>
              ))}
              <button onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false) }} className="wfd-btn" style={{ marginTop: 16 }}>Get a Free Estimate</button>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', padding: 'clamp(80px,12vw,96px) clamp(20px,5vw,48px) 48px' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(5,5,5,.8),rgba(5,5,5,.4),rgba(5,5,5,.95))', zIndex: 1 }} />
            <img src={IMAGES.hero} alt={`${companyNameFull} roofing`} fetchPriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ height: 1, width: 48, background: P }} />
              <span style={micro}>{certification} — Est. {yearEst}</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} style={h('clamp(60px,10vw,140px)', { color: 'white', marginBottom: 40 })}>
              <span style={{ display: 'block' }}>{tagline.includes('.') ? tagline.split('.')[0] + '.' : tagline}</span>
              <span style={{ display: 'block', WebkitTextStroke: '1.5px white', color: 'transparent' }}>{tagline.includes('.') ? (tagline.split('.').slice(1).join('.').trim() || 'Built to Last.') : 'Built to Last.'}</span>
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => setIsModalOpen(true)} className="wfd-btn">Get a Free Estimate</button>
                <button onClick={() => scrollTo('portfolio')} className="wfd-btn-outline">See Our Work</button>
              </div>
              <p style={{ maxWidth: 340, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,.8)', fontWeight: 400 }}>
                {city}'s trusted roofing contractor — protecting homes and families across the {region} since {yearEst}.
              </p>
            </motion.div>
            <div style={{ marginTop: 96, display: 'flex', alignItems: 'center', gap: 28 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} style={{ fill: P, color: P }} />)}
              </div>
              <span style={{ ...mono, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', fontWeight: 500 }}>
                Rated 5 Stars by {stats[2].label} Local Homeowners
              </span>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <section style={{ background: P, padding: '24px 0', overflow: 'hidden', userSelect: 'none' }}>
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 64, padding: '0 32px' }}>
                {['RESIDENTIAL HERITAGE', 'EXPERT INSTALLATION', 'LIFETIME GUARANTEE', 'VANGUARD MATERIALS'].map((label, j) => (
                  <span key={`${i}-${j}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 64 }}>
                    <span style={h(22, { color: onPrimary })}>{label}</span>
                    {j < 3 && <span style={{ width: 4, height: 12, background: onPrimary === '#ffffff' ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.4)', display: 'inline-block' }} />}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="wfd-section-pad" style={{ background: '#050505' }}>
          <div className="wfd-inner wfd-grid-2-1">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ height: 1, width: 48, background: P }} />
                <span style={micro}>By The Numbers</span>
              </div>
              <div className="wfd-grid-stats-inner">
                {stats.map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={h(52, { color: P })}>{stat.label}</div>
                    <span style={h(18, { color: 'white', letterSpacing: '0.1em' })}>{stat.sub}</span>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, fontWeight: 400 }}>{stat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,.1)', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <div style={meta}>NETWORK STATUS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                  <span style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Now Scheduling — Limited Openings</span>
                </div>
              </div>
              <div style={{ padding: 24, background: '#0a0a0a', borderRadius: 12, border: '1px solid rgba(255,255,255,.05)' }}>
                <div style={micro}>{certification}.</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 400, lineHeight: 1.7, marginTop: 8 }}>Only 3% of Contractors Qualify. We hold the highest roofing contractor certification available — meaning you get better warranties, better materials, and a crew that's held to a higher standard on every job.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES (Home overview) ── */}
        <section id="services" style={{ background: '#0a0a0a' }}>
          <div style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,48px) 24px', maxWidth: 1280, margin: '0 auto' }}>
            <span style={{ ...mono, color: P, fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 16, display: 'block' }}>What We Do</span>
            <h2 style={h('clamp(40px,8vw,120px)', { color: 'white' })}>EXPERT CARE.<br />HONEST SOLUTIONS.</h2>
          </div>
          {(() => {
            const svcs = [
              { id: '01', title: 'FULL ROOF REPLACEMENT', sub: 'ROOF REPLACEMENT', Icon: PencilRuler, img: IMAGES.svcReplacement, desc: `Premium architectural shingles and metal roofing systems installed by certified craftsmen. Built for the ${region} climate and designed to protect your home for decades.` },
              { id: '02', title: 'ROOF REPAIR',           sub: 'EXPERT REPAIR',    Icon: Hammer,      img: IMAGES.svcRepair,      desc: 'We find the actual source of the problem — not just the symptom. Targeted repairs that protect your investment and extend the life of your roof without unnecessary costs.' },
              { id: '03', title: 'STORM DAMAGE RESTORATION', sub: 'STORM RECOVERY', Icon: CheckCircle2, img: IMAGES.svcStorm,    desc: 'Hail, wind, and water damage assessed honestly and repaired thoroughly. We guide you through the insurance process and get your home protected fast.' },
              { id: '04', title: 'CUSTOM GUTTER SYSTEMS', sub: 'CUSTOM GUTTERS',   Icon: Droplets,    img: IMAGES.svcGutters,     desc: "Seamlessly fitted gutters that protect your foundation, prevent water damage, and complement your home's exterior — fabricated and installed by our own crew." },
            ]
            return (
              <div className="wfd-split">
                <div className="wfd-split-left" style={{ position: 'relative' }}>
                  {svcs.map((s, i) => (
                    <img key={i} src={s.img} alt={s.title} loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .6s', opacity: activeService === i ? 1 : 0 }} />
                  ))}
                </div>
                <div className="wfd-split-right">
                  {svcs.map((s, i) => (
                    <div key={i} onMouseEnter={() => setActiveService(i)}
                      className={`wfd-svc${activeService === i ? ' wfd-svc-active' : ''}`}
                      style={{ padding: 'clamp(24px,5vw,48px)', borderBottom: '1px solid rgba(255,255,255,.05)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <span style={{ ...mono, color: P, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>{s.id} // {s.sub}</span>
                        <s.Icon size={24} className="wfd-svc-icon" style={{ color: activeService === i ? P : 'rgba(255,255,255,.2)', transition: 'color .3s' }} />
                      </div>
                      <h3 style={h('clamp(32px,5vw,56px)', { color: activeService === i ? P : 'white', marginBottom: 16, transition: 'color .3s' })}>{s.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 400, fontSize: 15, lineHeight: 1.7, fontWeight: 400 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </section>

        {/* ── SERVICES PAGE CONTENT (SYSTEMS.) ── */}
        <section className="wfd-section-pad" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="wfd-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 128 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ height: 1, width: 48, background: P }} />
                <span style={micro}>Functional Capacity</span>
              </div>
              <h1 style={h('clamp(60px,10vw,140px)', { color: 'white' })}>SYSTEMS.</h1>
              <p style={{ color: 'rgba(255,255,255,.9)', fontSize: 28, maxWidth: 640, lineHeight: 1.7, marginTop: 48, fontWeight: 400, fontStyle: 'italic' }}>
                The {region} climate demands more than standard solutions. We build for the humidity, high-winds, and heavy rains that define our home.
              </p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 128 }}>
              {[
                { title: 'HERITAGE ROOFING',   Icon: PencilRuler, img: IMAGES.sysHeritage,   desc: 'Bespoke replacement for historic and high-value residential properties. We source regional materials that respect the original architecture while providing modern protection.', features: ['Historical Accuracy', 'Copper Detailing', 'Slate Restoration', 'Premium Synthetics'] },
                { title: 'INDUSTRIAL STRENGTH', Icon: ShieldCheck, img: IMAGES.sysIndustrial, desc: 'Heavy-duty roofing solutions for factories, warehouses, and storage facilities. Focused on lifecycle value and minimal operational disruption.',                            features: ['Standing Seam Metal', 'TPO/PVC Systems', 'Flat Roof Restoration', 'Energy Efficiency'] },
                { title: 'STORM RESPONSE',      Icon: Timer,       img: IMAGES.sysStorm,      desc: 'Rapid expert assessment after severe weather events. We focus on immediate stabilization followed by honest restoration plans.',                                            features: ['Emergent Tarping', 'Damage Documentation', 'Insurance Liaison', 'Structure Checks'] },
              ].map((service, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  style={{ display: 'flex', flexDirection: 'row', gap: 'clamp(32px,5vw,80px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 40%', aspectRatio: '3/4', border: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden', minHeight: 300 }}>
                    <img src={service.img} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.2, transition: 'all 1s' }}
                      onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.2' }}
                      alt={service.title} />
                    <div style={{ position: 'absolute', inset: '0 0 auto auto', padding: 32 }}>
                      <service.Icon size={96} style={{ color: 'white', opacity: 0.1 }} />
                    </div>
                  </div>
                  <div style={{ flex: '1 1 40%' }}>
                    <span style={{ ...micro, display: 'block', marginBottom: 24 }}>PROTOCOL // 0{i + 1}</span>
                    <h2 style={h('clamp(48px,6vw,96px)', { color: 'white', marginBottom: 32 })}>{service.title}</h2>
                    <p style={{ color: 'rgba(255,255,255,.9)', fontSize: 20, lineHeight: 1.7, marginBottom: 48, fontWeight: 400, fontStyle: 'italic' }}>{service.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {service.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.05)' }}>
                          <div style={{ width: 4, height: 4, background: P }} />
                          <span style={meta}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CALIBRATIONS */}
            <div style={{ marginTop: 128, paddingTop: 128, borderTop: '1px solid rgba(255,255,255,.05)' }}>
              <h2 style={h('clamp(48px,8vw,110px)', { color: 'white', marginBottom: 64 })}>CALIBRATIONS.</h2>
              <div className="wfd-grid-3" style={{ gap: 32 }}>
                {[
                  { name: 'SYNTHETIC SLATE', weight: 'LIGHTWEIGHT', endurance: '50+ YEARS', desc: 'The look of natural stone without the structural reinforcement traditionally required.' },
                  { name: 'STANDING SEAM', weight: '24 GAUGE STEEL', endurance: 'LIFETIME', desc: 'Precision engineered metallic protection with concealed fasteners for a leak-proof finish.' },
                  { name: 'ARCHITECTURAL', weight: 'TRIPLE LAYER', endurance: '35 YEARS', desc: 'Deep-dimension shingles that mimic the grain of wood shakes with superior fire and wind ratings.' }
                ].map(mat => (
                  <div key={mat.name} style={{ padding: 32, background: '#0a0a0a', border: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ ...meta, display: 'block', marginBottom: 16 }}>SPECIFICATION / {mat.weight}</span>
                    <h3 style={h(22, { color: 'white', marginBottom: 16 })}>{mat.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginBottom: 32, lineHeight: 1.7, fontWeight: 400 }}>{mat.desc}</p>
                    <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                      <span style={{ ...mono, fontSize: 11, color: P, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em' }}>RATING // {mat.endurance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="our-process" className="wfd-section-pad" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="wfd-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 64 }}>
              <div style={{ height: 1, width: 48, background: P }} />
              <span style={micro}>Our Process</span>
            </div>
            <h2 style={h('clamp(36px,8vw,120px)', { color: 'white', marginBottom: 64 })}>Simple. Transparent. Done Right.</h2>
            <div className="wfd-process-grid">
              {[
                { id: '01', title: 'ASSESS',   desc: 'Free Roof Evaluation: We walk your property top to bottom, identify every issue, and give you a straight assessment.' },
                { id: '02', title: 'QUOTE',    desc: 'Clear, Itemized Pricing: No surprises. You get a detailed, line-by-line estimate before any work begins.' },
                { id: '03', title: 'BUILD',    desc: `Expert Installation: Our ${certification}-certified crews handle every job with the care and precision your home deserves.` },
                { id: '04', title: 'CLEAN UP', desc: 'We Leave It Better Than We Found It: Full debris removal, site cleanup, and a final walkthrough.' },
              ].map((phase, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
                  className="wfd-process" style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 350, borderRight: i < 3 ? '1px solid rgba(255,255,255,.05)' : 'none', cursor: 'pointer', transition: 'all .3s', background: 'rgba(10,10,10,.3)' }}>
                  <span className="wfd-process-num" style={{ ...h(52, {}), opacity: 0.1, transition: 'all .3s', color: 'white' }}>{phase.id}</span>
                  <div>
                    <h4 style={h(36, { color: 'white', marginBottom: 16 })}>{phase.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.7, fontWeight: 400 }}>{phase.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, borderTop: '1px solid rgba(255,255,255,.05)', flexWrap: 'wrap', gap: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 1, background: P }} />
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, fontStyle: 'italic' }}>Questions at any hour? We pick up the phone.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <span style={h(28, { color: 'white' })}>{phone}</span>
                <span style={{ ...meta, color: P }}>Call or Text Anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── EMERGENCY ── */}
        <section style={{ background: `linear-gradient(135deg, ${P} 0%, color-mix(in srgb, ${P} 80%, #c2410c) 50%, color-mix(in srgb, ${P} 65%, #9a3412) 100%)`, padding: 'clamp(64px,10vw,128px) clamp(20px,5vw,32px)', position: 'relative', overflow: 'hidden' }}>
          {/* dot grid — right half only, matching template */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', opacity: 0.1, backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, position: 'relative', zIndex: 1 }}>
            {/* text — center on mobile, left on desktop */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', boxShadow: '0 0 8px rgba(255,255,255,0.5)', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                <span style={{ ...meta, color: 'rgba(255,255,255,0.9)' }}>LIVE STATUS // 24/7 SUPPORT ACTIVE</span>
              </div>
              <h2 style={{ ...h('clamp(36px,6vw,80px)', { color: 'white', marginBottom: 32 }), filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                <span style={{ display: 'block' }}>ROOF DAMAGE CAN'T WAIT.</span>
                <span style={{ display: 'block', WebkitTextStroke: '1.5px white', color: 'transparent', fontStyle: 'italic' }}>STORM DAMAGE OR ACTIVE LEAKS?</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={h('clamp(28px,5vw,56px)', { color: '#000', borderBottom: '4px solid black', paddingBottom: 8 })}>{phone}</span>
                <span style={{ ...meta, color: 'rgba(255,255,255,0.8)' }}>Call or Text Anytime</span>
              </div>
            </div>

            {/* CTA button — exact template style: bg-black text-white hover:bg-white hover:text-black */}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ background: 'black', color: 'white', padding: '48px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, cursor: 'pointer', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', flexShrink: 0, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'black' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white' }}
            >
              <Headphones size={48} style={{ transition: 'transform 0.3s' }} />
              <span style={{ letterSpacing: '0.15em', fontWeight: 900, fontSize: 13, textTransform: 'uppercase', fontFamily: 'var(--font-anton), Anton, sans-serif' }}>Schedule Emergency Inspection</span>
            </button>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section className="wfd-section-pad" style={{ background: '#050505' }}>
          <div className="wfd-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 32 }}>
              <h2 style={h('clamp(28px,5vw,72px)', { color: 'white' })}>What Homeowners<br />Are Saying.</h2>
              <div style={{ textAlign: 'right' }}>
                <div style={h(18, { color: P, marginBottom: 8 })}>Real Reviews. Real Results.</div>
                <button onClick={() => scrollTo('portfolio')} className="wfd-btn-outline" style={{ display: 'inline-block' }}>View All Testimonials</button>
              </div>
            </div>
            <div className="wfd-grid-3" style={{ border: '1px solid rgba(255,255,255,.05)' }}>
              {[
                { name: 'Mark Wallace',  role: `${city} Homeowner`, text: `"They didn't just replace our roof — they took the time to understand our home and matched everything perfectly. Truly a cut above."` },
                { name: 'Sarah Klein',   role: 'Homeowner',         text: '"After the storm I was dreading the whole process. Their team was honest about what actually needed work and what didn\'t. Saved me money and stress."' },
                { name: 'James Hudson',  role: 'Property Manager',  text: '"I\'ve hired a lot of contractors over the years. These guys recommended a repair over a full replacement and saved me thousands. That kind of integrity is rare."' },
              ].map((review, i) => (
                <div key={i} className="wfd-review" style={{ padding: 48, borderRight: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none', transition: 'all .3s' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
                    {[...Array(5)].map((_, j) => <div key={j} style={{ width: 6, height: 12, background: P }} />)}
                  </div>
                  <p style={{ color: 'white', fontWeight: 400, fontStyle: 'italic', marginBottom: 48, lineHeight: 1.7, fontSize: 15 }}>{review.text}</p>
                  <div style={{ paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.1)' }}>
                    <span style={{ fontFamily: 'var(--font-anton),Anton,sans-serif', textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1, fontSize: 20, color: 'white', display: 'block' }}>{review.name}</span>
                    <span style={meta}>{review.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GUARANTEE ── */}
        <section className="wfd-section-pad" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="wfd-inner" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(32px,5vw,64px)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240, height: 240, flexShrink: 0 }}>
              <div className="wfd-spin" style={{ width: '100%', height: '100%', border: `1px solid ${P}33`, borderRadius: '50%' }}>
                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', padding: 16 }}>
                  <path d="M 100,100 m -85,0 a 85,85 0 1,0 170,0 a 85,85 0 1,0 -170,0" fill="transparent" id="circPath" />
                  <text style={{ ...mono, fontSize: 9, fill: P, textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 700 } as React.CSSProperties}>
                    <textPath href="#circPath">SYSTEM INTEGRITY • VANGUARD QUALITY • MASTER ELITE STATUS •</textPath>
                  </text>
                </svg>
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={h(80, { color: 'white' })}>{yearsInBusiness}</span>
                <span style={micro}>YEARS</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ ...micro, display: 'block', marginBottom: 16 }}>Our Guarantee</span>
              <h2 style={h('clamp(40px,6vw,80px)', { color: 'white', marginBottom: 32, lineHeight: '0.95' })}>We Stand Behind Every Roof We Build.</h2>
              <p style={{ color: 'white', fontSize: 20, maxWidth: 640, lineHeight: 1.7, fontWeight: 400, fontStyle: 'italic', marginBottom: 40 }}>
                Every project comes with our fully transferable {yearsInBusiness}-year labor and materials warranty. If anything goes wrong — we come back and make it right. No runaround. No fine print.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                {[`${yearsInBusiness}-Year Transferable Warranty`, certification, `Licensed & Insured — ${state}`, `${stats[2].label} 5-Star Reviews`].map(signal => (
                  <div key={signal} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle2 size={16} style={{ color: P, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PORTFOLIO (ARCHIVE.) ── */}
        <section id="portfolio" className="wfd-section-pad" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="wfd-inner">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ height: 1, width: 48, background: P }} />
                <span style={micro}>The Craft in Action</span>
              </div>
              <h1 style={h('clamp(48px,10vw,140px)', { color: 'white', lineHeight: '0.95' })}>ARCHIVE.</h1>
            </motion.div>
            <div className="wfd-grid-3" style={{ border: '1px solid rgba(255,255,255,.05)' }}>
              {[
                { title: 'HERITAGE RESTORATION',        category: 'FULL ROOF REPLACEMENT',     year: '2023', img: IMAGES.caseStudy1, desc: 'Full restoration of a century-old slate system using modern synthetic alternatives that preserve the historic silhouette while meeting today\'s performance standards.' },
                { title: 'COMMERCIAL STANDING SEAM',   category: 'COMMERCIAL METAL',          year: '2024', img: IMAGES.caseStudy2, desc: 'High-performance standing seam metal installation for a large commercial facility, engineered for 50+ years of durability and low maintenance.' },
                { title: 'ARCHITECTURAL SHINGLE SYSTEM', category: 'RESIDENTIAL ROOFING',     year: '2022', img: IMAGES.caseStudy3, desc: 'Multi-pitched shingle system designed for high-wind resistance and architectural depth, protecting a residential home for the long term.' },
              ].map((project, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: .95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
                  className="wfd-proj" style={{ cursor: 'pointer', padding: 32, borderRight: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none', transition: 'background .3s' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5', marginBottom: 32 }}>
                    <img src={project.img} alt={project.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', transition: 'all 1s', transform: 'scale(1)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #050505 0%, transparent 50%)', opacity: 0.6 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span style={micro}>{project.category}</span>
                    <span style={{ ...mono, fontSize: 11, fontWeight: 500, borderBottom: `1px solid ${P}66`, paddingBottom: 4 }}>{project.year}</span>
                  </div>
                  <h3 style={h(36, { color: 'white', marginBottom: 24, transition: 'color .3s' })}>{project.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, lineHeight: 1.7, fontWeight: 400 }}>{project.desc}</p>
                  <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'flex-end' }}>
                    <ArrowUpRight size={20} style={{ color: 'rgba(255,255,255,.2)', transition: 'all .3s' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AREAS SERVED ── */}
        <section className="wfd-section-pad" style={{ background: '#050505', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(to right,#888 1px,transparent 1px),linear-gradient(to bottom,#888 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div className="wfd-inner" style={{ position: 'relative', zIndex: 1 }}>
            <div className="wfd-grid-2-1" style={{ marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ height: 1, width: 48, background: P }} />
                  <span style={micro}>Deployment Zones</span>
                </div>
                <h2 style={h('clamp(36px,8vw,100px)', { color: 'white', lineHeight: '0.9' })}>{region.toUpperCase()}<br />COVERAGE.</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, maxWidth: 300, marginLeft: 'auto', fontWeight: 400, lineHeight: 1.7, marginBottom: 24 }}>
                  Operational across the region. We provide rapid response and master-grade installation within a 50-mile radius of our {city} HQ.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                  <div style={{ width: 8, height: 8, background: P, borderRadius: '50%' }} />
                  <span style={{ ...mono, fontSize: 10, color: P, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>{serviceAreas.length} Priority Zones Active</span>
                </div>
              </div>
            </div>
            <div className="wfd-grid-4" style={{ border: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.03)' }}>
              {serviceAreas.map((area, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * .05 }}
                  className="wfd-area" style={{ padding: 'clamp(24px,4vw,48px)', borderRight: i < 3 ? '1px solid rgba(255,255,255,.05)' : 'none', cursor: 'pointer', transition: 'all .3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 64 }}>
                    <span style={{ ...mono, fontSize: 10, color: 'rgba(255,255,255,.2)' }}>{area.code}</span>
                    <Crosshair size={16} style={{ color: 'rgba(255,255,255,.1)', transition: 'all .3s' }} />
                  </div>
                  <h5 style={h(36, { color: 'white', marginBottom: 8 })}>{area.city}</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ ...mono, fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{area.state}</span>
                    {area.zip && <><div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: '50%' }} /><span style={{ ...mono, fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{area.zip}</span></>}
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, borderTop: '1px solid rgba(255,255,255,.05)', opacity: 0.4, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 48 }}>
                {[['Latitude', '38.3607° N'], ['Longitude', '75.5994° W']].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ ...mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{label}</span>
                    <span style={{ ...mono, fontSize: 12, color: 'white' }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...mono, fontSize: 10, color: 'white', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Deployment Readiness: 100%</div>
            </div>
          </div>
        </section>

        {/* ── READY TO INITIATE CTA ── */}
        <section style={{ position: 'relative', padding: 'clamp(64px,12vw,160px) clamp(20px,5vw,48px)', background: '#080808', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
          {/* Radial orange glow from bottom center — matches screenshot exactly */}
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '70%', background: `radial-gradient(ellipse at bottom, ${P}55 0%, ${P}22 35%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
            {/* Micro label with lines on both sides */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 48 }}>
              <div style={{ height: 1, width: 48, background: P }} />
              <span style={micro}>SECURE YOUR PERIMETER</span>
              <div style={{ height: 1, width: 48, background: P }} />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={h('clamp(72px, 12vw, 160px)', { color: 'white', marginBottom: 40, lineHeight: '0.9' })}
            >
              READY TO<br />INITIATE?
            </motion.h2>

            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 56px', fontWeight: 400 }}>
              This site was built for <strong style={{ color: 'white' }}>{companyNameFull}</strong>. If you want it live — with your logo, your real reviews, and your domain — we can have it running within 48 hours.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={WFD_URL} target="_blank" rel="noopener noreferrer" className="wfd-btn" style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => trackClick(lead.slug, 'initiate-primary')}>
                GET THIS SITE BUILT <ArrowUpRight size={16} />
              </a>
              <a href={`mailto:hello@woodfireddesigns.com?subject=Interested in my preview site – ${companyNameFull}&body=Hi, I just saw my personalized preview site and I'm interested in getting it live.`} className="wfd-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => trackClick(lead.slug, 'initiate-email')}>
                <Calendar size={14} /> REACH OUT DIRECTLY
              </a>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="wfd-section-pad" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,.05)', paddingBottom: 96 }}>
          <div className="wfd-inner wfd-grid-contact">

            {/* Left — identity info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ height: 1, width: 48, background: P }} />
                <span style={micro}>Initialize Correspondence</span>
              </div>

              <h1 style={h('clamp(48px,10vw,140px)', { color: 'white', marginBottom: 48, lineHeight: '0.9' })}>IDENTITY.</h1>

              <p style={{ color: 'white', fontSize: 'clamp(16px,2.5vw,24px)', maxWidth: 480, lineHeight: 1.7, fontWeight: 400, fontStyle: 'italic', marginBottom: 48 }}>
                We sync directly with visual thinkers and property owners. No intermediaries. Just clinical execution.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                {/* Phone + Address row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '48px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <div>
                    <span style={{ ...meta, display: 'block', marginBottom: 16 }}>REGIONAL HQ</span>
                    <span style={h(28, { color: 'white' })}>{phone}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...meta, display: 'block', marginBottom: 16 }}>OFFICE</span>
                    <p style={{ ...mono, fontSize: 13, opacity: 1, fontWeight: 500, textTransform: 'uppercase', lineHeight: 1.6, color: 'white' }}>
                      1204 Heavy-Duty Drive<br />{city}, {state} 21801
                    </p>
                  </div>
                </div>

                {/* Email + Encrypted line row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '32px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <div>
                    <span style={{ ...meta, display: 'block', marginBottom: 16 }}>EMAIL ACCESS</span>
                    <span style={h(18, { color: 'white' })}>CONTACT@{companyName.replace(/\s/g, '')}.CO</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <span style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textDecoration: 'underline', textDecorationColor: P, textUnderlineOffset: 4 }}>ENCRYPTED LINE</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — form card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 48, position: 'relative', overflow: 'hidden' }}>
                {/* Subtle glow behind the card */}
                <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, background: `${P}15`, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <form
                  style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 48 }}
                  onSubmit={e => { e.preventDefault(); alert('Packet transmitted.') }}
                >
                  {/* Name + Phone */}
                  <div className="wfd-grid-form-row">
                    {[
                      { id: 'cf-name',  label: 'Full Identification', placeholder: 'NAME',  type: 'text' },
                      { id: 'cf-phone', label: 'Access Line',          placeholder: 'PHONE', type: 'tel' },
                    ].map(field => (
                      <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label htmlFor={field.id} style={meta}>{field.label}</label>
                        <input
                          id={field.id}
                          required
                          type={field.type}
                          placeholder={field.placeholder}
                          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)', paddingBottom: 16, outline: 'none', fontFamily: 'var(--font-anton), Anton, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1 }}
                          onFocus={e => { e.currentTarget.style.borderBottomColor = P; e.currentTarget.style.color = 'white' }}
                          onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,.1)'; if (!e.currentTarget.value) e.currentTarget.style.color = 'rgba(255,255,255,.3)' }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label htmlFor="cf-email" style={meta}>Network Email</label>
                    <input
                      id="cf-email"
                      required type="email" placeholder="ADDRESS@MAIL.COM"
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)', paddingBottom: 16, outline: 'none', fontFamily: 'var(--font-anton), Anton, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1 }}
                      onFocus={e => { e.currentTarget.style.borderBottomColor = P; e.currentTarget.style.color = 'white' }}
                      onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,.1)'; if (!e.currentTarget.value) e.currentTarget.style.color = 'rgba(255,255,255,.3)' }}
                    />
                  </div>

                  {/* Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label htmlFor="cf-address" style={meta}>Project Coordinates</label>
                    <input
                      id="cf-address"
                      required type="text" placeholder="STREET, CITY, ZIP"
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)', paddingBottom: 16, outline: 'none', fontFamily: 'var(--font-anton), Anton, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1 }}
                      onFocus={e => { e.currentTarget.style.borderBottomColor = P; e.currentTarget.style.color = 'white' }}
                      onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,.1)'; if (!e.currentTarget.value) e.currentTarget.style.color = 'rgba(255,255,255,.3)' }}
                    />
                  </div>

                  {/* Brief */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label htmlFor="cf-brief" style={meta}>Operational Brief</label>
                    <textarea
                      id="cf-brief"
                      rows={2}
                      placeholder="DESCRIBE THE SCOPE"
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)', paddingBottom: 16, outline: 'none', resize: 'none', fontFamily: 'var(--font-anton), Anton, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1 }}
                      onFocus={e => { e.currentTarget.style.borderBottomColor = P; e.currentTarget.style.color = 'white' }}
                      onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,.1)'; if (!e.currentTarget.value) e.currentTarget.style.color = 'rgba(255,255,255,.3)' }}
                    />
                  </div>

                  <button type="submit" className="wfd-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    TRANSMIT REQUEST
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ position: 'relative', background: '#080808', padding: 'clamp(64px,10vw,128px) clamp(20px,5vw,48px) 64px', borderTop: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(255,255,255,.03) 0%,transparent 40%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: `radial-gradient(ellipse 80% 50% at 50% 100%,${P}88 0%,${P}33 50%,transparent 100%)`, pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
            <div className="wfd-grid-footer" style={{ marginBottom: 64 }}>
              <div>
                <div style={{ marginBottom: 40 }}>
                  <span style={{ ...micro, display: 'block', marginBottom: 4 }}>{certification} — Est. {yearEst}</span>
                  <span style={h(36, { color: 'white' })}>{companyName}.</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.7, maxWidth: 280, fontWeight: 400 }}>Quality roofing for the homes that matter most. Serving {city} and the {region} since {yearEst}.</p>
              </div>
              {[['Services', ['Roof Replacement', 'Roof Repair', 'Storm Recovery', 'Custom Gutters']], ['Company', ['Portfolio', 'Our Process', 'Contact Us']], ['Legal', ['Terms of Service', 'Privacy Policy']]].map(([title, links]) => (
                <div key={title as string}>
                  <span style={{ ...meta, display: 'block', marginBottom: 32, fontWeight: 700 }}>{title as string}</span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(links as string[]).map(link => (
                      <li key={link}><a href="#" style={{ ...meta, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>{link}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 40, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 48px' }}>
                {[`© 2026 ${companyNameFull}®`, certification, `Licensed & Insured — ${state}`, `${city}, ${state}`].map(item => (
                  <span key={item} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, opacity: 0.5, color: 'white' }}>{item}</span>
                ))}
              </div>
              <div style={{ ...mono, fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.15em', color: P, fontStyle: 'italic', fontWeight: 700, textDecoration: 'underline', textDecorationColor: `${P}44`, textUnderlineOffset: 8 }}>{tagline}</div>
            </div>
          </div>
          <div className="wfd-line-pulse" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 1, background: `linear-gradient(90deg,transparent 0%,${P}88 25%,${P}ee 50%,${P}88 75%,transparent 100%)`, zIndex: 20 }} />
        </footer>

        {/* ── PREVIEW BADGE ── */}
        {badgeVisible && !badgeScrolled && (
          <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 30, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,.8)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: 999, ...mono, fontSize: 11, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
            <span style={{ color: P }}>⚡</span>
            <span>Personalized Preview · Full customization available</span>
            <button onClick={() => setBadgeVisible(false)} style={{ marginLeft: 4, background: 'transparent', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        )}

        {/* ── STICKY CTA ── */}
        <AnimatePresence>
          {stickyVisible && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 40, display: 'flex', justifyContent: 'center', padding: '0 16px 16px', pointerEvents: 'none' }}
            >
              <div className="wfd-sticky-card" style={{ pointerEvents: 'auto' }}>
                {/* Left — dark panel */}
                <div className="wfd-sticky-left">
                  <span style={{ ...micro, display: 'block', marginBottom: 4 }}>Built for {companyNameFull}</span>
                  <h6 style={h(20, { color: 'white', marginBottom: 6 })}>Want this site for your business?</h6>
                  <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, lineHeight: 1.5 }}>
                    Live within 48 hours — your branding, your domain.
                  </p>
                </div>

                {/* Right — primary-colored panel, hidden on mobile */}
                <a
                  href={WFD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wfd-sticky-right"
                  onClick={() => trackClick(lead.slug, 'sticky-cta')}
                >
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setStickyVisible(false) }}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: onPrimary, opacity: 0.7, lineHeight: 1, fontSize: 18, padding: 4, width: 32, height: 32 }}
                    aria-label="Dismiss"
                  >×</button>
                  <span style={h(14, { color: onPrimary, letterSpacing: '0.08em' })}>GET IT BUILT →</span>
                </a>

                {/* Mobile dismiss — only shown when right panel is hidden */}
                <button
                  className="wfd-hide-desktop"
                  onClick={() => setStickyVisible(false)}
                  aria-label="Dismiss"
                  style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 18, width: 32, height: 32, display: 'none' }}
                >×</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MODAL ── */}
        {isModalOpen && (
          <div role="dialog" aria-modal="true" aria-label="Get a free estimate" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }} />
            <div style={{ position: 'relative', background: '#0a0a0a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 48, maxWidth: 480, width: '100%', boxShadow: '0 50px 100px rgba(0,0,0,.9)' }}>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
              <h5 style={h(28, { color: 'white', marginBottom: 32 })}>LIKE WHAT YOU SEE?</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ height: 1, width: 32, background: P }} />
                <span style={micro}>Built for {companyNameFull}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                This is a free personalized preview — fully customized with your branding, service areas, and copy. Ready to go live within 48 hours.
              </p>

              {/* Pricing */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <div style={{ flex: 1, padding: '16px 20px', background: `${P}18`, border: `1px solid ${P}44`, borderRadius: 8 }}>
                  <div style={{ ...micro, marginBottom: 4 }}>ONE-TIME SETUP</div>
                  <div style={{ fontFamily: 'var(--font-anton),Anton,sans-serif', fontSize: 28, color: 'white', lineHeight: 1 }}>{SETUP_PRICE}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>domain · launch · metadata</div>
                </div>
                <div style={{ flex: 1, padding: '16px 20px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8 }}>
                  <div style={{ ...micro, marginBottom: 4 }}>MONTHLY HOSTING</div>
                  <div style={{ fontFamily: 'var(--font-anton),Anton,sans-serif', fontSize: 28, color: 'white', lineHeight: 1 }}>{MONTHLY_PRICE}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>hosting · 1 update · uptime</div>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Your logo & brand colors', `Local SEO copy for ${city}`, 'Custom domain setup', 'Live within 48 hours'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                    <div style={{ width: 6, height: 6, background: P, borderRadius: '50%', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={WFD_URL} target="_blank" rel="noopener noreferrer" className="wfd-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%' }} onClick={() => trackClick(lead.slug, 'modal')}>
                Get This Site Built <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
