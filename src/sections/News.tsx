import { AnimatedSection } from "@/components/AnimatedSection";
import type { NewsContent } from "@/types";
import { ArrowRight } from "lucide-react";
import { handleAssetError } from "@/lib/assetUrl";

export function News({ content }: { content: NewsContent }) {
  if (!content?.items || content.items.length === 0) return null;

  return (
    <section id="materias" className="py-20 md:py-28 px-4 sm:px-8 bg-white">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection className="mb-14">
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">
            — {content.subtitle || "Fique por dentro"}
          </p>
          <h2 className="font-heading text-[clamp(2.25rem,4.5vw,3.5rem)] font-light text-midnight leading-[1.05] tracking-[-0.02em]">
            {content.title || "Matérias e Notícias"}
          </h2>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.items.map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-warm-white rounded-[24px] overflow-hidden border border-[#EDE8DC] transition-all duration-500 hover:shadow-[0_32px_80px_rgba(0,0,0,0.1)] hover:-translate-y-1.5"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={handleAssetError}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                      Sem imagem
                    </div>
                  )}
                  {item.tag && (
                    <div className="absolute top-4 left-4 bg-gold text-midnight px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {item.tag}
                    </div>
                  )}
                </div>
                <div className="p-7">
                  <h3 className="font-heading text-[20px] font-medium text-midnight leading-tight mb-4 group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-gold text-xs font-bold uppercase tracking-wider">
                    Ler matéria completa <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
