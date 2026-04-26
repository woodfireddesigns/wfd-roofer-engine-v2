import { Link } from 'react-router-dom';
import { brandConfig } from '../brandConfig';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#080808] pt-32 pb-16 px-8 border-t border-white/5 overflow-hidden">
      {/* Glass Reflection */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(160deg,rgba(255,255,255,0.03)_0%,transparent_40%)]" />

      {/* Noise Overlay */}
      <div className="absolute inset-0 pointer-events-none footer-noise z-0" />

      {/* Bottom Arch Glow */}
      <div
        className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255, 100, 20, 0.55) 0%, rgba(255, 60, 0, 0.2) 50%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-12 mb-32">
          <div className="col-span-12 lg:col-span-4">
            <Link to="/" className="flex flex-col leading-none mb-10">
              <span className="micro-label mb-1 uppercase">{brandConfig.certification} — Est. {brandConfig.yearEstablished}</span>
              <span className="vanguard-heading text-4xl text-white">{brandConfig.companyName}.</span>
            </Link>
            <p className="text-white opacity-80 text-sm leading-relaxed max-w-xs font-normal">
              Quality roofing for the homes that matter most. Serving {brandConfig.city} and the {brandConfig.region} since {brandConfig.yearEstablished}.
            </p>
          </div>

          <div className="col-span-6 lg:col-span-3">
            <span className="meta-info mb-8 block font-bold opacity-100 uppercase">Services</span>
            <ul className="space-y-4">
              <li><Link to="/services" className="meta-info hover:opacity-100 hover:text-primary transition-all">Roof Replacement</Link></li>
              <li><Link to="/services" className="meta-info hover:opacity-100 hover:text-primary transition-all">Roof Repair</Link></li>
              <li><Link to="/services" className="meta-info hover:opacity-100 hover:text-primary transition-all">Storm Recovery</Link></li>
              <li><Link to="/services" className="meta-info hover:opacity-100 hover:text-primary transition-all">Custom Gutters</Link></li>
            </ul>
          </div>

          <div className="col-span-6 lg:col-span-3">
            <span className="meta-info mb-8 block font-bold opacity-100 uppercase">Company</span>
            <ul className="space-y-4">
              <li><Link to="/portfolio" className="meta-info hover:opacity-100 hover:text-primary transition-all">Portfolio</Link></li>
              <li><Link to="/#our-process" className="meta-info hover:opacity-100 hover:text-primary transition-all">Our Process</Link></li>
              <li><Link to="/contact" className="meta-info hover:opacity-100 hover:text-primary transition-all">Contact Us</Link></li>
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-2 lg:text-right">
            <span className="meta-info mb-8 block font-bold opacity-100 uppercase">Legal</span>
            <ul className="space-y-4">
              <li><a href="#" className="meta-info hover:opacity-100 hover:text-primary transition-all">Terms of Service</a></li>
              <li><a href="#" className="meta-info hover:opacity-100 hover:text-primary transition-all">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-12 gap-y-4 text-[10px] uppercase tracking-[0.2em] font-bold opacity-70 text-white">
            <span>© {currentYear} {brandConfig.companyNameFull}®</span>
            <span>{brandConfig.certification}</span>
            <span>Licensed &amp; Insured — {brandConfig.state}</span>
            <span>{brandConfig.city}, {brandConfig.state}</span>
          </div>
          <div className="text-[11px] font-mono opacity-60 uppercase tracking-widest text-primary font-bold italic underline decoration-primary/30 underline-offset-8">{brandConfig.tagline}</div>
        </div>
      </div>

      {/* Bottom Pulsing Line */}
      <div
        className="absolute bottom-0 left-0 w-full h-[1px] animate-line-pulse z-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,120,30,0.5) 25%, rgba(255,180,60,0.9) 50%, rgba(255,120,30,0.5) 75%, transparent 100%)'
        }}
      />
    </footer>
  );
}
