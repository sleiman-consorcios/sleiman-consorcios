import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import type { PromoBannerContent, PromoBannerSlide } from "@/types";
import { Timer } from "lucide-react";
import { handleAssetError, originalAssetUrl } from "@/lib/assetUrl";

interface Props {
  content: PromoBannerContent;
}

/** Fallback de vídeo: se o arquivo local falhar, volta para a URL do Supabase. */
function handleVideoSourceError(event: React.SyntheticEvent<HTMLSourceElement>) {
  const source = event.currentTarget;
  const video = source.parentElement as HTMLVideoElement | null;
  if (!video || video.dataset.assetFallback === "1") return;
  const original = originalAssetUrl(source.getAttribute("src") || "");
  if (!original || original === source.getAttribute("src")) return;
  video.dataset.assetFallback = "1";
  video.querySelectorAll("source").forEach(el => el.remove());
  video.setAttribute("src", original);
  video.load();
}

function getSlides(content: PromoBannerContent): PromoBannerSlide[] {
  if (content.slides?.length) return content.slides;
  if (content.image) return [{ src: content.image, image: content.image, type: 'image' as const, alt: content.alt || "Promoção" }];
  return [];
}

function getSlideSrc(slide: PromoBannerSlide) {
  return slide.src || slide.image || "";
}

function isVideoSlide(slide: PromoBannerSlide) {
  if (slide.type === 'video') return true;
  const src = getSlideSrc(slide).toLowerCase();
  return src.endsWith(".mp4") || src.endsWith(".webm") || src.startsWith("data:video");
}

const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export function PromoBanner({ content }: Props) {
  const slides = getSlides(content);
  const validSlides = slides.filter(s => getSlideSrc(s));
  const [current, setCurrent] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("1920/800");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const timeLeft = useCountdown(content.countdownDate || "");
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(true);

  const next = useCallback(() => {
    if (validSlides.length <= 1) return;
    setCurrent(prev => (prev + 1) % validSlides.length);
  }, [validSlides.length]);

  useEffect(() => {
    if (validSlides.length === 0) return;
    
    const currentSlide = validSlides[current];
    const src = getSlideSrc(currentSlide);
    const isMobile = window.innerWidth < 768;
    const mediaSrc = (isMobile && currentSlide.mobileSrc) ? currentSlide.mobileSrc : src;

    if (isVideoSlide(currentSlide)) {
      // For videos we can't easily get natural dimensions before load, 
      // but we can try to use standard ratios or metadata if needed.
      // Defaulting to 1920/800 if not specified.
      setAspectRatio("1920/800");
      return;
    }

    const img = new Image();
    img.src = mediaSrc;
    img.onload = () => {
      setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`);
    };
  }, [validSlides, current]);

  // Manage video play/pause based on active slide
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === current && inView) {
        video.currentTime = 0;
        video.play().catch(() => { /* autoplay pode ser bloqueado */ });
      } else {
        video.pause();
      }
    });
  }, [current, inView]);

  // Pausa todos os vídeos quando o banner sai da viewport (economiza banda/CPU)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => setInView(entry.isIntersecting)),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (validSlides.length <= 1) return;
    const timer = setInterval(next, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [validSlides.length, next]);

  const showCountdown = !!(content.countdownDate && timeLeft && content.showCountdown);

  return (
    <section ref={sectionRef} id="promo-banner" className="w-full bg-background overflow-hidden md:mt-0">
      {showCountdown && (
        <div className="bg-accent py-2 px-4 border-b border-white/10 shadow-inner">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-10">
            {content.countdownText && (
              <p className="text-[11px] font-black text-white/90 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Timer className="w-3.5 h-3.5 animate-pulse" /> {content.countdownText}
              </p>
            )}
            <div className="flex gap-6 items-center">
              {[
                { label: "Dias", value: timeLeft.days },
                { label: "Horas", value: timeLeft.hours },
                { label: "Min", value: timeLeft.minutes },
                { label: "Seg", value: timeLeft.seconds },
              ].map((unit, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <span className="text-white text-lg md:text-xl font-black tabular-nums tracking-tighter">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-white/60 tracking-widest">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(content.title || content.subtitle) && (
        <div className="bg-primary/5 py-8 px-4 border-b border-border/50">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            {content.title && (
              <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-muted-foreground text-lg">
                {content.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {validSlides.length > 0 && (
        <div className="w-full max-w-full mx-auto flex flex-col items-center">
          <div 
            className="relative w-full overflow-hidden transition-all duration-500 bg-black/5" 
            style={{ aspectRatio: isMobile ? "1080/1350" : aspectRatio }}
          >
            {validSlides.map((slide, i) => {
              const src = getSlideSrc(slide);
              const isVideo = isVideoSlide(slide);
              
              return (
                <div
                  key={i}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                    i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  {isVideo ? (
                    <video
                      ref={el => videoRefs.current[i] = el}
                      poster={slide.poster}
                      muted
                      loop
                      playsInline
                      preload={i === 0 ? "metadata" : "none"}
                      className="w-full h-full object-cover [image-rendering:auto] [transform:translateZ(0)]"
                      onError={handleAssetError}
                    >
                      {slide.webmSrc && <source src={slide.webmSrc} type="video/webm" onError={handleVideoSourceError} />}
                      <source src={src} type="video/mp4" onError={handleVideoSourceError} />
                      {slide.mobileSrc && <source src={slide.mobileSrc} media="(max-width: 768px)" onError={handleVideoSourceError} />}
                    </video>
                  ) : (
                    <div className="w-full h-full">
                      {isMobile && slide.mobileSrc ? (
                        <img
                          src={slide.mobileSrc}
                          alt={slide.alt || "Promoção Mobile"}
                          loading={i === 0 ? "eager" : "lazy"}
                          className="w-full h-full object-cover object-center"
                          onError={handleAssetError}
                        />
                      ) : (
                        <img
                          src={src}
                          alt={slide.alt || "Promoção Desktop"}
                          loading={i === 0 ? "eager" : "lazy"}
                          className="w-full h-full object-cover object-center"
                          onError={handleAssetError}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {validSlides.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {validSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === current ? "bg-white scale-110 shadow" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {(content.showCta !== false && (content.ctaText || "Ver promo")) && (
            <div className="flex justify-center py-6 px-4 w-full">
              <Button
                size="lg"
                asChild
                className="px-8 py-6 text-lg font-body font-bold rounded-xl shadow-lg w-full sm:w-auto transform hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href={content.ctaHref || "#simulacao"}>{content.ctaText || "Ver promo"}</a>
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}