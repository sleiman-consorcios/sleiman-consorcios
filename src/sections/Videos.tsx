import { AnimatedSection } from "@/components/AnimatedSection";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { VideosContent } from "@/types";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getThumbnail(item: { thumbnail?: string; url: string }): string | null {
  if (item.thumbnail && item.thumbnail.trim() !== "") return item.thumbnail;
  const id = getYouTubeId(item.url);
  // Use maxresdefault for better quality if available, falling back to hqdefault
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function Videos({ content }: { content: VideosContent }) {
  const title = content.title || "O especialista por trás da Sleiman";
  const tag = content.tag || "Aprenda com quem sabe";
  const subtitle = content.subtitle || "Assista antes de decidir.";
  const [loadedThumbnails, setLoadedThumbnails] = useState<Record<number, boolean>>({});
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const clickAction = content.clickAction || "youtube";

  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedVideo]);

  const validItems = (content.items || []).filter(v => v.url && v.url.trim() !== "");
  if (!validItems.length) return null;

  return (
    <section id="videos" className="py-20 md:py-28 px-4 sm:px-8 bg-white">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {tag}</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-midnight leading-[1.1]">
            {title.includes("—") ? (
              <>{title.split("—")[0]}<br /><em className="italic text-gold">{title.split("—")[1]}</em></>
            ) : (
              title
            )}
          </h2>
          <p className="text-[17px] text-muted-foreground font-light mt-4 max-w-[560px]">{subtitle}</p>
        </AnimatedSection>
        <div className="mt-14 relative px-4 sm:px-0">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {validItems.map((v, i) => {
                const thumb = getThumbnail(v);
                
                return (
                  <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <AnimatedSection delay={i * 0.1} className="h-full">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          if (clickAction === "modal") {
                            setSelectedVideo(v.url);
                          } else {
                            window.open(v.url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="group flex flex-col h-full rounded-2xl overflow-hidden border border-[#EDE8DC] transition-all duration-300 hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer bg-white"
                      >
                        <div className="relative bg-muted overflow-hidden shrink-0 aspect-video">
                          <span className="absolute top-3 left-3 font-heading text-5xl font-bold text-gold/15 z-10">{String(i + 1).padStart(2, "0")}</span>
                          
                          {!loadedThumbnails[i] && (
                            <Skeleton className="absolute inset-0 w-full h-full" />
                          )}

                          {thumb && (
                            <img 
                              src={thumb} 
                              alt={v.title} 
                              onLoad={() => setLoadedThumbnails(prev => ({ ...prev, [i]: true }))}
                              className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${!loadedThumbnails[i] ? 'invisible' : 'visible'}`} 
                              loading="lazy" 
                            />
                          )}

                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-12 h-12 rounded-full bg-gold/90 group-hover:bg-gold group-hover:scale-110 flex items-center justify-center transition-all duration-200">
                              <Play className="w-[18px] h-[18px] text-midnight ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 flex-grow">
                          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gold mb-1.5">{v.tag}</p>
                          <h3 className="font-heading text-[17px] font-semibold text-midnight leading-snug">{v.title}</h3>
                        </div>
                      </div>
                    </AnimatedSection>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 border-[#EDE8DC] text-midnight hover:bg-gold hover:text-white transition-colors" />
              <CarouselNext className="-right-12 border-[#EDE8DC] text-midnight hover:bg-gold hover:text-white transition-colors" />
            </div>
          </Carousel>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[70vw] p-0 bg-black/90 border-none shadow-2xl overflow-hidden aspect-video">
          <VisuallyHidden>
            <DialogTitle>Vídeo</DialogTitle>
            <DialogDescription>Visualização de vídeo expandida</DialogDescription>
          </VisuallyHidden>
          
          <DialogClose className="absolute right-4 top-4 z-50 rounded-full p-2 bg-black/40 text-white hover:bg-black/60 transition-colors">
            <X className="w-6 h-6" />
          </DialogClose>
          
          {selectedVideo && (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo)}?autoplay=1`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}