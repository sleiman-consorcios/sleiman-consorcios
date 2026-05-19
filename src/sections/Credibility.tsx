import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import type { CredibilityContent } from "@/types";

export function Credibility({ content }: { content: CredibilityContent }) {
  return (
    <section className="bg-navy py-9 px-4 sm:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
          {content.stats.map((stat, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="bg-navy text-center py-7 px-4">
              <p className="font-heading text-[40px] font-semibold text-gold leading-none tracking-tight">{stat.value}</p>
              <p className="text-[13px] text-white/55 mt-1.5 leading-snug">{stat.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {content.partners.logos.length > 0 && (
        <div className="max-w-[1100px] mx-auto mt-10 bg-white rounded-lg py-6 px-8">
          <p className="text-center text-xs font-semibold tracking-[2px] uppercase text-muted-foreground mb-6">{content.partners.title}</p>
          <div className={`grid gap-5 items-center justify-center ${
            content.partners.logos.length <= 2 ? "grid-cols-2 max-w-md mx-auto" :
            content.partners.logos.length === 3 ? "grid-cols-3 max-w-2xl mx-auto" :
            content.partners.logos.length === 4 ? "grid-cols-2 md:grid-cols-4" :
            "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          }`}>
            {content.partners.logos.map((logo, i) => (
              <div key={i} className="flex items-center justify-center gap-2 px-5 py-3 border border-border rounded-lg text-[13px] font-semibold text-muted-foreground">
                {logo.image ? <img src={logo.image} alt={logo.name} className="h-7 object-contain" /> : logo.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
