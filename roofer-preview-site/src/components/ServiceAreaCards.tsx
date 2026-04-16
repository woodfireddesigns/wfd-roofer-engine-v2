import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface ServiceAreaCardsProps {
    cities: string[];
}

export function ServiceAreaCards({ cities }: ServiceAreaCardsProps) {
    if (!cities || cities.length <= 1) return null;

    return (
        <section className="py-32 bg-[var(--brand-dark)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col items-center text-center justify-center mb-20 gap-8">
                    <div className="max-w-3xl">
                        <h2 className="text-6xl md:text-8xl lg:text-9xl nike-display text-white leading-none mb-6">
                            AREAS <span className="text-[var(--brand-accent)]">SERVED</span>
                        </h2>
                        <p className="text-[var(--brand-text-muted)] text-lg md:text-xl font-medium leading-relaxed">
                            We take pride in providing premium roofing solutions to these communities. 
                            Our local crews are ready to respond 24/7.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-8 w-full">
                    {cities.map((city, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="group relative bg-[var(--brand-surface)] border border-white/5 p-8 rounded-2xl transition-all hover:border-[var(--brand-accent)] hover:shadow-[0_20px_40px_color-mix(in_srgb,var(--brand-dark),transparent_50%)] cursor-pointer w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.35rem)]"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[var(--brand-accent)] group-hover:text-[var(--brand-dark)] transition-colors duration-500">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-black text-white group-hover:text-[var(--brand-accent)] transition-colors">
                                        {Math.floor(Math.random() * 50) + 120}+
                                    </span>
                                    <span className="text-[10px] text-[var(--brand-text-muted)] uppercase font-black tracking-widest">Projects</span>
                                </div>
                            </div>
                            
                            <h3 className="text-4xl md:text-5xl nike-display text-white leading-tight">{city}</h3>

                            {/* Decorative background pulse */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--brand-accent)] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
