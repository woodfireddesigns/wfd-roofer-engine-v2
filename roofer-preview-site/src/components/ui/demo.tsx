import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ContainerTextFlip } from "./modern-animated-multi-words";

// Utility function to merge class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Demo() {
  const [currentVariant, setCurrentVariant] = useState(0);
  const variants = ["gradient", "primary", "neon", "glass"] as const;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVariant((prev) => (prev + 1) % variants.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-8 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-light text-white/80 mb-12"
        >
          Creating experiences that are
        </motion.h1>
        
        <ContainerTextFlip 
          words={["revolutionary", "extraordinary", "phenomenal", "incredible", "spectacular"]}
          interval={3000}
          animationDuration={700}
          variant={variants[currentVariant]}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center flex-wrap gap-4 mt-12"
        >
          {variants.map((variant, index) => (
            <button
              key={variant}
              onClick={() => setCurrentVariant(index)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 uppercase tracking-widest",
                "border border-white/20 backdrop-blur-sm",
                currentVariant === index
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              )}
            >
              {variant}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
