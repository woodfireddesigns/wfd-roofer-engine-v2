import { motion } from 'motion/react';
import { GlowCard } from '../components/ui/spotlight-card';
import { brandConfig } from '../brandConfig';

export default function Contact() {
  return (
    <div className="pt-32 pb-24 px-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="micro-label">Initialize Correspondence</span>
            </div>
            <h1 className="vanguard-heading text-[10vw] text-white mb-12">IDENTITY.</h1>
            <p className="text-white opacity-100 mb-16 font-normal text-2xl leading-relaxed max-w-lg italic">
              We sync directly with visual thinkers and property owners. No intermediaries. Just clinical execution.
            </p>

            <div className="space-y-16 border-t border-white/5 pt-16">
              <div className="flex justify-between items-end">
                <div>
                  <span className="meta-info mb-4 block">REGIONAL HQ</span>
                  <span className="vanguard-heading text-3xl text-white">{brandConfig.phone}</span>
                </div>
                <div className="text-right">
                  <span className="meta-info mb-4 block">OFFICE</span>
                  <p className="font-mono text-sm opacity-100 font-medium uppercase" style={{ whiteSpace: 'pre-line' }}>
                    {brandConfig.address}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-white/5 pt-8">
                <div>
                  <span className="meta-info mb-4 block">EMAIL ACCESS</span>
                  <span className="vanguard-heading text-xl text-white">{brandConfig.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                    <span className="text-[11px] font-mono opacity-100 font-bold decoration-primary underline underline-offset-4 tracking-[0.2em]">ENCRYPTED LINE</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full"
          >
            <GlowCard
              glowColor="orange"
              customSize={true}
              bgSpotOpacity={0.1}
              className="bg-black border-white/10 p-0"
            >
              <div className="p-12 h-full relative z-10">
                <form className="space-y-12" onSubmit={(e) => { e.preventDefault(); alert("Packet transmitted."); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-4">
                      <label className="meta-info">Full Identification</label>
                      <input required className="bg-transparent border-0 border-b border-white/10 text-white pb-4 focus:border-primary focus:ring-0 rounded-none uppercase vanguard-heading text-2xl placeholder:opacity-30" placeholder="NAME" type="text" />
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="meta-info">Access Line</label>
                      <input required className="bg-transparent border-0 border-b border-white/10 text-white pb-4 focus:border-primary focus:ring-0 rounded-none uppercase vanguard-heading text-2xl placeholder:opacity-30" placeholder="PHONE" type="tel" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="meta-info">Network Email</label>
                    <input required className="bg-transparent border-0 border-b border-white/10 text-white pb-4 focus:border-primary focus:ring-0 rounded-none uppercase vanguard-heading text-2xl placeholder:opacity-30" placeholder="ADDRESS@MAIL.COM" type="email" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="meta-info">Project Coordinates</label>
                    <input required className="bg-transparent border-0 border-b border-white/10 text-white pb-4 focus:border-primary focus:ring-0 rounded-none uppercase vanguard-heading text-2xl placeholder:opacity-30" placeholder="STREET, CITY, ZIP" type="text" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="meta-info">Operational Brief</label>
                    <textarea rows={2} className="bg-transparent border-0 border-b border-white/10 text-white pb-4 focus:border-primary focus:ring-0 rounded-none uppercase vanguard-heading text-2xl placeholder:opacity-30 resize-none" placeholder="DESCRIBE THE SCOPE"></textarea>
                  </div>
                  <button className="vanguard-btn w-full">TRANSMIT REQUEST</button>
                </form>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
