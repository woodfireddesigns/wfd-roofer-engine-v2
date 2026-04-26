import { motion, AnimatePresence } from 'motion/react';
import { X as CloseIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { GlowCard } from './ui/spotlight-card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl z-10"
          >
            <GlowCard
              glowColor="orange"
              customSize={true}
              bgSpotOpacity={0}
              className="w-full bg-black border-white/10 !p-0 overflow-hidden rounded-xl"
            >
              {/* Orb Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="orb-glow animate-orb opacity-40" />
              </div>

              {/* Modal Content */}
              <div className="relative p-6 md:p-10 z-10 w-full h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="micro-label mb-1 block">SECURE TERMINAL</span>
                    {title && <h1 className="vanguard-heading text-3xl text-white">{title}</h1>}
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 transition-colors text-white"
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-white">
                  {children}
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
