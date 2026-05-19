import { AnimatedSection } from "@/components/AnimatedSection";
import { Play } from "lucide-react";
import type { VideosContent } from "@/types";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getThumbnail(item: { thumbnail?: string; url: string }): string | null {
  if (item.thumbnail) return item.thumbnail;
  const id = getYouTubeId(item.url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function Videos({ content }: { content: VideosContent }) {
  if (!content.items.length) return null;
  return (
    <section className="py-20 md:py-28 px-4 sm:px-8 bg-white">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {content.tag || "Vídeos"}</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1]">
            {content.title}
          </h2>
          <p className="text-[17px] text-muted-foreground font-light mt-4 max-w-[560px]">{content.subtitle}</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {content.items.map((v, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(v.url, "_blank", "noopener,noreferrer");
                }}
                className="group block rounded-2xl overflow-hidden border border-[#EDE8DC] transition-all duration-300 hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative aspect-video bg-gradient-to-br from-navy to-midnight">
                  <span className="absolute top-3 left-3 font-heading text-5xl font-bold text-gold/15">{String(i + 1).padStart(2, "0")}</span>
                  {(() => { const thumb = getThumbnail(v); return thumb ? <img src={thumb} alt={v.title} className="w-full h-full object-cover opacity-60" loading="lazy" /> : null; })()}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gold/90 group-hover:bg-gold group-hover:scale-110 flex items-center justify-center transition-all duration-200">
                      <Play className="w-[18px] h-[18px] text-midnight ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gold mb-1.5">{v.tag || "Vídeo"}</p>
                  <h3 className="font-heading text-[17px] font-semibold text-midnight leading-snug">{v.title}</h3>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
