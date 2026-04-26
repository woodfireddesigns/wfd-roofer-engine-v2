import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import { brandConfig } from './brandConfig';

function PreviewBadge() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible || scrolled) return null;

  return (
    <div className="fixed bottom-6 left-6 z-30 flex items-center gap-3 bg-black/80 border border-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full text-[11px] font-mono text-white/60 uppercase tracking-widest shadow-lg">
      <span className="text-primary">⚡</span>
      <span>Personalized Preview · Full customization available</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-1 text-white/30 hover:text-white transition-colors leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-background selection:bg-primary selection:text-white">
        <div className="grain" />
        <ScrollToTop />
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer />

        {/* Step 6 — Preview badge (only on lead preview deployments) */}
        {brandConfig.isPreview && <PreviewBadge />}
      </div>
    </Router>
  );
}

export default App;
