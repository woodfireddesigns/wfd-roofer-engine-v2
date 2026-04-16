import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ButtonColorful } from "@/components/ui/button-colorful";

interface HeroProps {
  companyName: string;
  heroCopy: string;
  phone: string;
}

function Hero({ companyName, heroCopy, phone }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Reliable", "Premium", "Durable", "Expert", "Trusted"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          <div className="flex gap-4 flex-col text-center">
            <h1 className="text-6xl md:text-8xl text-center nike-display uppercase">
              <span className="text-white block mb-2">{companyName}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.2em] text-[var(--brand-accent)]">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-black"
                    initial={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? "-100%" : "100%",
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-2xl leading-relaxed text-[var(--brand-text-muted)] max-w-2xl text-center mx-auto mt-6 font-medium">
              {heroCopy}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a href={`tel:${phone}`} className="block">
              <ButtonColorful label="Call Now" className="h-16 px-12 text-sm" />
            </a>
            <a href="#estimate" className="block">
              <ButtonColorful label="Free Estimate" variant="outline" className="h-16 px-12 text-sm" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
