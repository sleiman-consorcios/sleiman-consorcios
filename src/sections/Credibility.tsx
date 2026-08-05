import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import type { CredibilityContent } from "@/types";
import { handleAssetError } from "@/lib/assetUrl";

export function Credibility({ content }: { content: CredibilityContent }) {
  return (
    <section className="bg-navy py-6 px-2 sm:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
          {content.stats.map((stat, i) => {
            const Icon = getIcon(stat.icon);
            return (
              <AnimatedSection key={i} delay={i * 0.1} className="bg-navy text-center py-7 px-4">
                <div className="flex justify-center mb-3">
                  <Icon className="w-8 h-8 text-gold/40" />
                </div>
                <p className="font-heading text-[40px] font-semibold text-gold leading-none tracking-tight">{stat.value}</p>
                <p className="text-[13px] text-white/55 mt-1.5 leading-snug">{stat.label}</p>
              </AnimatedSection>
            );
          })}
        </div>
      </div>

      {content.partners.logos.length > 0 && (
        <div className="max-w-[1100px] mx-auto mt-10 bg-white rounded-lg py-8 px-1 sm:px-12 shadow-sm border border-border/50">
          <p className="text-center text-[10px] font-bold tracking-[3px] uppercase text-muted-foreground/60 mb-8">{content.partners.title}</p>
          <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-6 md:gap-10 overflow-hidden px-1">
            {content.partners.logos.map((logo, i) => (
              <div 
                key={i} 
                className="flex-1 min-w-0 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95 px-0.5 sm:px-4"
              >
                {logo.image ? (
                  <img 
                    src={logo.image} 
                    alt={logo.name} 
                    className="h-20 sm:h-24 md:h-28 lg:h-32 w-full max-w-full object-contain mx-auto" 
                    onError={handleAssetError}
                  />
                ) : (
                  <span className="text-[16px] sm:text-[20px] font-semibold text-muted-foreground text-center line-clamp-1">{logo.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
