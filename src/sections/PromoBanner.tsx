import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { PromoBannerContent } from "@/types";

interface Props {
  content: PromoBannerContent;
}

function getSlides(content: PromoBannerContent) {
  // Support legacy single-image format
  if (content.slides?.length) return content.slides;
  if (content.image) return [{ image: content.image, alt: content.alt || "Promoção" }];
  return [];
}

export function PromoBanner({ content }: Props) {
  const slides = getSlides(content);
  const validSlides = slides.filter(s => s.image);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % validSlides.length);
  }, [validSlides.length]);

  useEffect(() => {
    if (validSlides.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [validSlides.length, next]);

  if (validSlides.length === 0) return null;

  return (
    <section className="w-full bg-background">
      <div className="w-full max-w-[1920px] mx-auto">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1920/800" }}>
          {validSlides.map((slide, i) => (
            <img
              key={i}
              src={slide.image}
              alt={slide.alt || "Promoção"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}
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
        {content.ctaText && (
          <div className="flex justify-center py-6 px-4">
            <Button
              size="lg"
              asChild
              className="px-8 py-4 text-base font-body font-semibold rounded-xl shadow-md w-full sm:w-auto"
            >
              <a href={content.ctaHref || "#simulacao"}>{content.ctaText}</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
