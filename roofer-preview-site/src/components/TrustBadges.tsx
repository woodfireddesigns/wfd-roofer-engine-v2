import { motion } from "framer-motion";
import { Award, Shield, CheckCircle, Star } from "lucide-react";

interface TrustBadgesProps {
    certifications: string[];
}

export function TrustBadges({ certifications }: TrustBadgesProps) {
    const icons = [Award, Shield, Star, CheckCircle];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[var(--brand-accent)] text-xs font-black uppercase tracking-[0.3em] mb-4 block">Unmatched Credibility</span>
                    <h2 className="text-4xl stripe-display text-[var(--brand-primary)]">Certified Quality and Guaranteed Workmanship</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {certifications.map((cert, i) => {
                        const Icon = icons[i % icons.length];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                whileHover={{ 
                                    scale: 1.05,
                                    rotateY: 10,
                                    rotateX: 10,
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative group bg-[#F5F5F5] p-10 rounded-2xl text-center flex flex-col items-center justify-center border border-transparent hover:border-[var(--brand-accent)]/20 hover:bg-white transition-all shadow-sm hover:shadow-xl"
                            >
                                <div className="mb-6 relative">
                                    <div className="absolute inset-0 bg-[var(--brand-accent)] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                    <div className="relative p-6 bg-white rounded-full shadow-inner text-gray-300 group-hover:text-[var(--brand-accent)] transition-colors duration-500">
                                        <Icon className="w-10 h-10" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-black text-[var(--brand-primary)] uppercase tracking-widest leading-tight">
                                    {cert}
                                </h3>
                                <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                    Verified & Active Certification
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="mt-20 pt-8 border-t border-gray-100 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 font-bold text-[var(--brand-primary)]">
                    <img src="/ga-certified-badge.png" onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/e/e8/GAF_Materials_Corporation_logo.svg"}} alt="GAF" className="h-8 md:h-12 w-auto" />
                    <img src="/bbb-badge.webp" onError={(e) => { e.currentTarget.src = "https://www.owenscorning.com/en-us/roofing/site-assets/logo-owens-corning-color.svg"}} alt="OC" className="h-8 md:h-12 w-auto" />
                    <img src="/trustpilot-badge.png" onError={(e) => { e.currentTarget.src = "https://www.certainteed.com/sites/default/files/logo.svg"}} alt="CertainTeed" className="h-8 md:h-10 w-auto" />
                </div>

            </div>
        </section>
    );
}
