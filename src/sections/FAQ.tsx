import { AnimatedSection } from "@/components/AnimatedSection";
import { useState } from "react";
import type { FAQContent } from "@/types";

export function FAQ({ content }: { content: FAQContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const title = content.title || "Perguntas frequentes";
  const tag = content.tag || "Tire suas dúvidas";

  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-8 bg-cream">
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
        </AnimatedSection>
        <div className="flex flex-col gap-3 mt-14 max-w-[800px]">
          {content.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <AnimatedSection key={i} delay={i * 0.03}>
                <div className={`bg-white rounded-xl border transition-colors duration-200 overflow-hidden ${isOpen ? "border-gold" : "border-[#EDE8DC]"}`}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex justify-between items-center px-6 py-[22px] text-left gap-4 group"
                  >
                    <span className="font-heading text-lg font-semibold text-midnight group-hover:text-gold transition-colors">{item.question}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-lg text-gold transition-all duration-300 ${isOpen ? "bg-gold-pale rotate-45" : "bg-cream"}`}>
                      +
                    </div>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-350 ease-in-out"
                    style={{ maxHeight: isOpen ? "300px" : "0", padding: isOpen ? "0 24px 22px" : "0 24px" }}
                  >
                    <p className="text-[15px] text-muted-foreground leading-[1.8] font-light">{item.answer}</p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
