import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

export default function PreviewBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[450px] z-[100]"
      >
        <div 
          className="relative overflow-hidden rounded-2xl border border-[var(--brand-accent)]/30 bg-[var(--brand-dark)]/92 backdrop-blur-xl p-6 shadow-2xl"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--brand-accent)] opacity-30"></div>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[var(--brand-accent)] font-bold text-lg leading-tight mb-1 uppercase tracking-wider">
                This site was built for you
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Imagine what we could create together. Let's talk about growing your roofing brand.
              </p>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center">
            <a 
              href="mailto:michael@woodfireddesigns.com"
              className="w-full flex items-center justify-center space-x-2 px-8 py-4 rounded-full font-black text-sm uppercase transition-all duration-300 hover:scale-[1.05] active:scale-95 text-[var(--brand-dark)] shadow-[0_10px_40px_color-mix(in srgb,var(--brand-dark),transparent_70%)] hover:shadow-[var(--brand-accent)]/30 border-2 border-transparent hover:border-[var(--brand-accent)]/50"
              style={{ backgroundColor: 'var(--brand-accent)' }}
            >
              <span className="tracking-[0.1em]">SEE PRICING</span>
              <Send size={18} />
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
