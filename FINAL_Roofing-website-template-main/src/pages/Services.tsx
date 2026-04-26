import { motion } from 'motion/react';
import {
  PencilRuler as ArchitectureIcon,
  Hammer as HandymanIcon,
  CheckCircle2 as VerifiedIcon,
  Droplets as WaterLuxIcon,
  ShieldCheck as ShieldIcon,
  Timer as ClockIcon,
  HardHat as BriefcaseIcon,
  PencilRuler
} from 'lucide-react';
import { IMAGES } from '../constants';
import { brandConfig } from '../brandConfig';

const SERVICES_LIST = [
  {
    title: 'HERITAGE ROOFING',
    icon: PencilRuler,
    desc: 'Bespoke replacement for historic and high-value residential properties. We source regional materials that respect the original architecture while providing modern protection.',
    features: ['Historical Accuracy', 'Copper Detailing', 'Slate Restoration', 'Premium Synthetics']
  },
  {
    title: 'INDUSTRIAL STRENGTH',
    icon: ShieldIcon,
    desc: 'Heavy-duty roofing solutions for factories, warehouses, and storage facilities. Focused on lifecycle value and minimal operational disruption.',
    features: ['Standing Seam Metal', 'TPO/PVC Systems', 'Flat Roof Restoration', 'Energy Efficiency']
  },
  {
    title: 'STORM RESPONSE',
    icon: ClockIcon,
    desc: 'Rapid expert assessment after severe weather events. We focus on immediate stabilization followed by honest restoration plans.',
    features: ['Emergent Tarping', 'Damage Documentation', 'Insurance Liaison', 'Structure Checks']
  }
];

export default function Services() {
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
            <span className="micro-label">Functional Capacity</span>
          </div>
          <h1 className="vanguard-heading text-[10vw] text-white">SYSTEMS.</h1>
          <p className="text-white opacity-100 text-3xl max-w-2xl leading-relaxed mt-12 font-normal italic">
            The {brandConfig.region} climate demands more than standard solutions. We build for the humidity, high-winds, and heavy rains that define our home.
          </p>
        </motion.div>

        <div className="space-y-32">
          {SERVICES_LIST.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row gap-20 items-start ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="w-full md:w-1/2 aspect-[3/4] border border-white/5 relative overflow-hidden">
                <img
                  src={i === 0 ? IMAGES.hero : i === 1 ? IMAGES.worker : IMAGES.damaged}
                  className="w-full h-full object-cover grayscale opacity-20 hover:opacity-100 transition-all duration-1000"
                  alt={service.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <service.icon className="w-24 h-24 text-white opacity-10" />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <span className="micro-label mb-6 block">PROTOCOL // 0{i + 1}</span>
                <h2 className="vanguard-heading text-6xl md:text-8xl text-white mb-8">{service.title}</h2>
                <p className="text-white opacity-100 text-xl leading-relaxed mb-12 font-normal italic">{service.desc}</p>
                <div className="grid grid-cols-2 gap-4">
                  {service.features.map(f => (
                    <div key={f} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5">
                      <div className="w-1 h-1 bg-primary" />
                      <span className="meta-info opacity-80">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-32 pt-32 border-t border-white/5">
          <h2 className="vanguard-heading text-[8vw] text-white mb-16 uppercase">CALIBRATIONS.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'SYNTHETIC SLATE', weight: 'LIGHTWEIGHT', endurance: '50+ YEARS', desc: 'The look of natural stone without the structural reinforcement traditionally required.' },
              { name: 'STANDING SEAM', weight: '24 GAUGE STEEL', endurance: 'LIFETIME', desc: 'Precision engineered metallic protection with concealed fasteners for a leak-proof finish.' },
              { name: 'ARCHITECTURAL', weight: 'TRIPLE LAYER', endurance: '35 YEARS', desc: 'Deep-dimension shingles that mimic the grain of wood shakes with superior fire and wind ratings.' }
            ].map(mat => (
              <div key={mat.name} className="p-8 bg-surface border border-white/5">
                <span className="meta-info block mb-4">SPECIFICATION / {mat.weight}</span>
                <h3 className="vanguard-heading text-2xl text-white mb-4">{mat.name}</h3>
                <p className="text-white/90 text-sm mb-8 leading-relaxed font-normal">{mat.desc}</p>
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[11px] font-mono text-primary uppercase font-bold tracking-widest">RATING // {mat.endurance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
