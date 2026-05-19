import { AnimatedSection } from "@/components/AnimatedSection";
import type { AboutContent } from "@/types";

export function About({ content }: { content: AboutContent }) {
  return (
    <section id="sobre" className="py-20 md:py-28 px-4 sm:px-8 bg-cream">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-[380px_1fr] gap-12 md:gap-[72px] items-center">
          <AnimatedSection>
            <div className="relative">
              <div className="aspect-[3/4] rounded-[20px] overflow-hidden relative bg-gradient-to-br from-navy-light to-midnight">
                <div className="arabesque" style={{ opacity: 0.06 }} />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-[80px] font-light text-gold/30">{(content.founderName || "F")[0]}</span>
                </div>
                {content.image && (
                  <img src={content.image} alt={content.title} className="w-full h-full object-cover relative z-[1]" loading="lazy" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-[2]">
                  <p className="font-heading text-[26px] font-semibold text-white">{content.founderName || "Farid Sleiman"}</p>
                  <p className="text-[13px] text-gold font-medium">{content.founderRole || "Fundador & Especialista"}</p>
                </div>
              </div>
              {content.badge && (
                <div className="absolute top-6 -right-5 bg-gold text-midnight px-5 py-3 rounded-[10px] text-[13px] font-bold text-center shadow-lg z-[3] leading-snug whitespace-pre-line">
                  {content.badge}
                </div>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="flex flex-col gap-7">
              <div>
                <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {content.subtitle}</p>
                <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1]">
                  {content.title}
                </h2>
              </div>
              {content.quote && (
                <blockquote className="font-heading text-[26px] italic font-light text-midnight leading-[1.4] border-l-[3px] border-gold pl-6">
                  "{content.quote}"
                </blockquote>
              )}
              <div className="space-y-4">
                {content.text.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[16px] text-muted-foreground leading-[1.8] font-light">{p}</p>
                ))}
              </div>
              {content.metrics && content.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {content.metrics.map((m, i) => (
                    <div key={i} className="bg-white rounded-lg p-5 border border-gold/20">
                      <p className="font-heading text-[32px] font-semibold text-gold leading-none">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
