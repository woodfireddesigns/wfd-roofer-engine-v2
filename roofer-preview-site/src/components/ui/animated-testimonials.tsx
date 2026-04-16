"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Quote, Star } from "lucide-react"
import { motion, useAnimation, useInView, type Variants } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

export interface AnimatedTestimonialsProps {
  title?: string
  subtitle?: string
  badgeText?: string
  testimonials?: Testimonial[]
  autoRotateInterval?: number
  trustedCompanies?: string[]
  trustedCompaniesTitle?: string
  className?: string
}

export function AnimatedTestimonials({
  title = "Loved by the community",
  subtitle = "Don't just take our word for it. See what homeowners have to say about our roofing services.",
  badgeText = "Trusted by thousands",
  testimonials = [],
  autoRotateInterval = 6000,
  className,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Refs for scroll animations
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Auto rotate testimonials
  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [autoRotateInterval, testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} id="reviews" className={`py-24 overflow-hidden bg-[#0c0c0c] border-y border-white/5 ${className || ""}`}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid grid-cols-1 gap-16 w-full md:grid-cols-2 lg:gap-24"
        >
          {/* Left side: Heading and navigation */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <div className="space-y-6">
              {badgeText && (
                <div className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black bg-[var(--brand-accent)] text-[#0a0a0a] uppercase tracking-widest">
                  <Star className="mr-2 h-3.5 w-3.5 fill-[#0a0a0a]" />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2 className="text-5xl md:text-7xl nike-display text-white uppercase tracking-tighter">{title}</h2>

              <p className="max-w-[600px] text-gray-400 text-lg md:text-xl font-medium tracking-tight">{subtitle}</p>

              <div className="flex items-center gap-3 pt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === index ? "w-12 bg-[var(--brand-accent)]" : "w-2 bg-white/20"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side: Testimonial cards */}
          <motion.div variants={itemVariants} className="relative h-full min-h-[400px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 50,
                  scale: activeIndex === index ? 1 : 0.95,
                }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                style={{ zIndex: activeIndex === index ? 10 : 0 }}
              >
                <div className="bg-[#111111] border border-white/10 shadow-2xl rounded-3xl p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="mb-6 flex gap-1">
                      {Array(testimonial.rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />
                        ))}
                    </div>

                    <div className="relative mb-6">
                      <Quote className="absolute -top-4 -left-4 h-12 w-12 text-white/5 rotate-180" />
                      <p className="relative z-10 text-xl md:text-2xl font-black text-white leading-tight italic tracking-tight">
                        "{testimonial.content}"
                      </p>
                    </div>
                  </div>

                  <div>
                    <Separator className="my-6 bg-white/10" />

                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-white/10">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-white/5 text-white font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-black text-white text-lg uppercase tracking-tight">{testimonial.name}</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
