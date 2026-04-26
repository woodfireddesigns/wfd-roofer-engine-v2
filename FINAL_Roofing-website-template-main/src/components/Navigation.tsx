import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu as MenuIcon, X as CloseIcon, ArrowUpRight } from 'lucide-react';
import Modal from './Modal';
import { brandConfig } from '../brandConfig';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Our Process', path: '/#our-process' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 flex justify-between items-start px-6 md:px-12 pt-8 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-background/90 backdrop-blur-md pb-4' : 'bg-transparent'}`}>
      <Link to="/" className="flex flex-col leading-none group">
        <span className="micro-label mb-1">{brandConfig.certification} — Est. {brandConfig.yearEstablished}</span>
        <span className="vanguard-heading text-4xl text-white">{brandConfig.companyName}.</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-12 pt-1">
        <div className="flex gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest font-black transition-all ${isActive ? 'text-primary opacity-100' : 'text-white opacity-70 hover:opacity-100'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-6 border-l border-white/10 pl-6">
          <div className="text-right">
            <div className="meta-info">LOCATION</div>
            <div className="text-sm font-mono text-white">{brandConfig.city}, {brandConfig.state}</div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-xs font-black hover:bg-white hover:text-black transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* Modal — homeowner form OR contractor preview CTA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={brandConfig.isPreview ? 'LIKE WHAT YOU SEE?' : 'GET A FREE ESTIMATE'}
      >
        {brandConfig.isPreview ? (
          // Step 5 — Contractor conversion copy
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-8 bg-primary shrink-0" />
              <span className="micro-label">Built for {brandConfig.companyNameFull}</span>
            </div>
            <p className="text-white/80 text-base leading-relaxed font-normal">
              This is a free personalized preview — fully customized with your branding, service areas,
              and copy. Ready to go live within 48 hours.
            </p>
            <ul className="space-y-3 pt-2">
              {['Your logo & brand colors', 'Local SEO copy for ' + brandConfig.city, 'Custom domain setup', 'Live within 48 hours'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://woodfireddesigns.com"
              target="_blank"
              rel="noopener noreferrer"
              className="vanguard-btn w-full flex items-center justify-center gap-3"
            >
              See How It Works
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          // Default homeowner quote form
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsModalOpen(false);
              alert('Request Sent.');
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="meta-info">Name</label>
                <input
                  required
                  className="bg-transparent border-b border-white/20 pb-2 focus:border-primary outline-none transition-colors text-white font-medium"
                  placeholder="Your Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="meta-info">Phone / Email</label>
                <input
                  required
                  className="bg-transparent border-b border-white/20 pb-2 focus:border-primary outline-none transition-colors text-white font-medium"
                  placeholder="How can we reach you?"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="meta-info">Your Project</label>
              <textarea
                rows={2}
                className="bg-transparent border-b border-white/20 pb-2 focus:border-primary outline-none transition-colors resize-none text-white font-medium"
                placeholder="Tell us about your roofing needs..."
              />
            </div>
            <button className="vanguard-btn w-full flex items-center justify-center gap-4">
              Send Request
            </button>
          </form>
        )}
      </Modal>

      {/* Mobile Toggle */}
      <button
        className="md:hidden text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-background z-40 md:hidden p-8 flex flex-col gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="vanguard-heading text-4xl text-white hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsModalOpen(true);
            }}
            className="vanguard-btn w-full py-8 text-xl"
          >
            {brandConfig.isPreview ? 'SEE HOW IT WORKS' : 'REQUEST QUOTE'}
          </button>
        </div>
      )}
    </nav>
  );
}
