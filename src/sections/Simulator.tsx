import { AnimatedSection } from "@/components/AnimatedSection";
import { SimulatorForm } from "@/components/SimulatorForm";
import type { SimulatorContent, SiteConfig } from "@/types";

interface Props { 
  content: SimulatorContent; 
  config: SiteConfig;
  webhookUrl?: string 
}

export function Simulator({ content, config, webhookUrl }: Props) {
  return (
    <section id="simulacao" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-warm-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute -top-24 -right-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* Coluna de Texto */}
          <div className="lg:col-span-5 space-y-8">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 text-gold text-xs font-bold tracking-[3px] uppercase mb-4">
                <span className="w-8 h-px bg-gold" />
                {content.tag || "Simulação Personalizada"}
              </div>
              <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-light text-midnight leading-[1.05] tracking-tight mb-6">
                {content.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="italic text-gold font-normal">{content.title.split(" ").slice(-1)}</span>
              </h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-md">
                {content.subtitle}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="grid grid-cols-1 gap-6 pt-8">
                {(content.features || [
                  { title: "Sem Juros", desc: "Economize até 10x mais que um financiamento comum." },
                  { title: "Flexibilidade", desc: "Prazos e parcelas que cabem no seu orçamento." },
                  { title: "Consultoria", desc: "Suporte especializado do início até a contemplação." }
                ]).map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center shrink-0 border border-gold/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-midnight text-sm uppercase tracking-wider">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Coluna do Formulário */}
          <div className="lg:col-span-7 relative w-full px-1.5 sm:px-0">
            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-[32px] sm:rounded-[40px] p-0.5 sm:p-1 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-[#EDE8DC] relative overflow-hidden group">
                {/* Efeito de brilho no card */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="bg-white rounded-[30px] sm:rounded-[32px] p-4 sm:p-10 md:p-12 border border-[#F5F1E8] relative z-10">
                  <SimulatorForm content={content} config={config} webhookUrl={webhookUrl} />
                </div>
              </div>

              {/* Badges de Confiança abaixo do card */}
              <div className="flex flex-wrap justify-center gap-6 mt-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <img src="/placeholder.svg" className="h-6 w-auto opacity-30" alt="Autorizado pelo Banco Central" />
                <img src="/placeholder.svg" className="h-6 w-auto opacity-30" alt="ABAC" />
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground my-auto">Empresa Certificada</span>
              </div>
            </AnimatedSection>
          </div>

        </div>
      </div>
    </section>
  );
}
