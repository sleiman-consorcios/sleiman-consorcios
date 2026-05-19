import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import type { HowItWorksContent } from "@/types";

export function HowItWorks({ content }: { content: HowItWorksContent }) {
  return (
    <section id="como-funciona" className="py-20 md:py-28 px-4 sm:px-8 bg-warm-white">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {content.subtitle || "Simples assim"}</p>
          <h2 className="font-heading text-[clamp(2.25rem,4.5vw,3.5rem)] font-light text-midnight leading-[1.05] tracking-[-0.02em]">
            {content.title}
          </h2>
        </AnimatedSection>
        <div className={`grid gap-8 mt-14 items-stretch ${content.steps.length === 3 ? "md:grid-cols-3" : content.steps.length === 2 ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
          {content.steps.map((step, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="flex">
              <div className="group relative p-10 pt-12 bg-white rounded-[28px] border border-[#EDE8DC] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_56px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col flex-1">
                <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold to-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <p className="font-heading text-[80px] font-bold text-gold/20 leading-none mb-6 group-hover:text-gold/30 transition-colors duration-500">{step.number}</p>
                <h3 className="font-heading text-[26px] font-medium text-midnight mb-4 tracking-tight">{step.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.7] font-light flex-1">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
