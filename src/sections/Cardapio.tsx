import { useRef, useState, useEffect } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CardapioContent } from "@/types";

interface Props {
  content: CardapioContent;
}

export function Cardapio({ content }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [content.items]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }

  function goToSimulator() {
    document.querySelector("#simulacao")?.scrollIntoView({ behavior: "smooth" });
  }

  if (!content.items || content.items.length === 0) return null;

  return (
    <section id="cardapio" className="py-16 md:py-24 bg-warm-white">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>
        </AnimatedSection>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 shadow-lg border border-border flex items-center justify-center hover:bg-background transition-colors -ml-2 md:-ml-5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {content.items.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="snap-center shrink-0 w-[260px] md:w-[280px] rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 text-center">
                    <h3 className="font-heading font-semibold text-foreground text-lg">
                      {item.title}
                    </h3>
                  </div>
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-sm">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground text-sm mb-1">Parcela a partir de:</p>
                    <p className="text-primary font-bold text-xl">
                      {item.installmentText}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 shadow-lg border border-border flex items-center justify-center hover:bg-background transition-colors -mr-2 md:-mr-5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatedSection delay={0.3}>
          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={goToSimulator}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl text-lg shadow-lg"
            >
              {content.ctaText || "Realize seu sonho"}
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
