import { AnimatedSection } from "@/components/AnimatedSection";
import { Star } from "lucide-react";
import type { TestimonialsContent } from "@/types";

export function Testimonials({ content }: { content: TestimonialsContent }) {
  if (!content.items.length) return null;
  return (
    <section id="depoimentos" className="py-20 md:py-28 px-4 sm:px-8 bg-cream">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {content.tag || "Depoimentos"}</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1]">
            {content.title}
          </h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {content.items.map((t, i) => (
            <AnimatedSection key={i} delay={i * 0.08}>
              <div className="h-full bg-white rounded-[20px] p-8 border border-[#EDE8DC] flex flex-col gap-5 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
                <div className="flex gap-[3px]">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-heading text-lg italic font-normal text-midnight leading-[1.5] flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#EDE8DC]">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-light to-gold-pale flex items-center justify-center overflow-hidden shrink-0">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading text-[17px] font-bold text-gold">{t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-midnight">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city || t.role}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
