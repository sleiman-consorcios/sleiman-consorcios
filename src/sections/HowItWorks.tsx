import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import type { HowItWorksContent } from "@/types";

export function HowItWorks({ content }: { content: HowItWorksContent }) {
  return (
    <section id="como-funciona" className="py-20 md:py-28 px-4 sm:px-8 bg-warm-white">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— Simples assim</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1]">
            Como funciona<br /><em className="italic text-gold">em 3 passos</em>
          </h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8 mt-14 items-stretch">
          {content.steps.map((step, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="flex">
              <div className="group relative p-10 pt-12 bg-white rounded-[20px] border border-[#EDE8DC] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 flex flex-col flex-1">
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold to-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <p className="font-heading text-[80px] font-bold text-gold-pale leading-none mb-5">{step.number}</p>
                <h3 className="font-heading text-2xl font-semibold text-midnight mb-3">{step.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.7] font-light flex-1">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
