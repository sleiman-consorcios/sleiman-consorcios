import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ObjectivesContent } from "@/types";

const cardEmojis = ["🏠", "📈", "💡", "🔄"];

export function Objectives({ content }: { content: ObjectivesContent }) {
  return (
    <section id="solucoes" className="py-20 md:py-28 px-4 sm:px-8 bg-cream">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection className="mb-14">
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— Encontre o seu</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1]">
            Escolha o consórcio<br /><em className="italic text-gold">certo para você</em>
          </h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {content.cards.map((card, i) => (
            <AnimatedSection key={i} delay={i * 0.08} className="flex">
              <div className="group bg-white rounded-[20px] overflow-hidden border border-[#EDE8DC] transition-all duration-300 hover:shadow-[0_24px_56px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 cursor-pointer flex flex-col flex-1">
                <div className="bg-midnight p-8 relative overflow-hidden">
                  <div className="arabesque" style={{ opacity: 0.06 }} />
                  <div className="relative z-[1]">
                    <p className="text-4xl mb-3">{cardEmojis[i] || "📌"}</p>
                    <p className="font-heading text-[22px] font-semibold text-white">{card.title}</p>
                  </div>
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-[14px] text-muted-foreground leading-[1.6] font-light mb-5 flex-1">{card.description}</p>
                  <button
                    onClick={() => document.querySelector("#simulacao")?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full py-3.5 border-2 border-midnight bg-transparent rounded-lg text-[14px] font-semibold text-midnight hover:bg-midnight hover:text-white transition-all duration-200 text-center"
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
