import { AnimatedSection } from "@/components/AnimatedSection";
import { SimulatorForm } from "@/components/SimulatorForm";
import type { SimulatorContent } from "@/types";

interface Props { content: SimulatorContent; whatsapp: string }

export function Simulator({ content, whatsapp }: Props) {
  return (
    <section id="simulacao" className="py-20 md:py-28 px-4 sm:px-8 bg-warm-white">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— Simulação gratuita</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1] mb-3">{content.title}</h2>
          <p className="text-muted-foreground font-light">{content.subtitle}</p>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <div className="p-8 md:p-10 rounded-[20px] border border-[#EDE8DC] bg-white shadow-sm">
            <SimulatorForm content={content} whatsapp={whatsapp} />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
