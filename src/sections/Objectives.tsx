import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ObjectivesContent } from "@/types";

const cardEmojis = ["Home", "TrendingUp", "Lightbulb", "RefreshCw"];

export function Objectives({ content }: { content: ObjectivesContent }) {
  return (
    <section id="solucoes" className="py-20 md:py-28 px-4 sm:px-8 bg-cream">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection className="mb-14">
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {content.subtitle || "Encontre o seu"}</p>
          <h2 className="font-heading text-[clamp(2.25rem,4.5vw,3.5rem)] font-light text-midnight leading-[1.05] tracking-[-0.02em]">
            {content.title}
          </h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {content.cards.map((card, i) => (
            <AnimatedSection key={i} delay={i * 0.08} className="flex">
              <div className="group bg-white rounded-[28px] overflow-hidden border border-[#EDE8DC] transition-all duration-500 hover:shadow-[0_32px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2 cursor-pointer flex flex-col flex-1">
                <div className="bg-midnight p-8 relative overflow-hidden min-h-[140px] flex items-end">
                  <div className="arabesque" style={{ opacity: 0.08 }} />
                  <div className="relative z-[1] w-full">
                    <div className="mb-4 group-hover:scale-110 transition-transform duration-500">
                      {(() => {
                        const iconName = card.icon || cardEmojis[i] || "Pin";
                        const IconComponent = getIcon(iconName);
                        return <IconComponent className="w-10 h-10 text-gold" />;
                      })()}
                    </div>
                    <p className="font-heading text-[24px] font-medium text-white tracking-tight">{card.title}</p>
                  </div>
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-[14px] text-muted-foreground leading-[1.6] font-light mb-5 flex-1">{card.description}</p>
                  <button
                    onClick={() => document.querySelector("#simulacao")?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full py-4 border-2 border-midnight bg-transparent rounded-xl text-[14px] font-bold text-midnight hover:bg-midnight hover:text-white transition-all duration-300 text-center uppercase tracking-wider"
                  >
                    {card.cta} →
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
