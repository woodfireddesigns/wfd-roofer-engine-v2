import { motion } from 'motion/react';
import { IMAGES } from '../constants';
import { ArrowUpRight } from 'lucide-react';

const PROJECTS = [
  {
    title: 'HERITAGE RESTORATION',
    category: 'FULL ROOF REPLACEMENT',
    year: '2023',
    image: IMAGES.site,
    desc: 'Full restoration of a century-old slate system using modern synthetic alternatives that preserve the historic silhouette while meeting today\'s performance standards.'
  },
  {
    title: 'COMMERCIAL STANDING SEAM',
    category: 'COMMERCIAL METAL',
    year: '2024',
    image: IMAGES.sunset,
    desc: 'High-performance standing seam metal installation engineered for a large commercial facility, built for 50+ years of durability and low maintenance.'
  },
  {
    title: 'ARCHITECTURAL SHINGLE SYSTEM',
    category: 'RESIDENTIAL ROOFING',
    year: '2022',
    image: IMAGES.shingles,
    desc: 'Multi-pitched shingle system designed for high-wind resistance and architectural depth, protecting a residential home for the long term.'
  }
];

export default function Portfolio() {
  return (
    <div className="pt-32 pb-24 px-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-32"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="micro-label">The Craft in Action</span>
          </div>
          <h1 className="vanguard-heading text-[10vw] text-white leading-none">ARCHIVE.</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/5 divide-x divide-white/5">
          {PROJECTS.map((project, i) => (
            <motion.div 
              key={project.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer p-8 hover:bg-white/5 transition-all"
            >
              <div className="relative overflow-hidden aspect-[4/5] mb-8">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <span className="micro-label">{project.category}</span>
                <span className="text-[11px] font-mono opacity-100 font-medium border-b border-primary/40 pb-1">{project.year}</span>
              </div>
              <h3 className="vanguard-heading text-4xl text-white mb-6 group-hover:text-primary transition-colors">{project.title}</h3>
              <p className="text-white opacity-100 text-sm leading-relaxed font-normal">{project.desc}</p>
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                <ArrowUpRight className="w-5 h-5 text-white opacity-20 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
