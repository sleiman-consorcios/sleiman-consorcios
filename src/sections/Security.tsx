import { AnimatedSection } from "@/components/AnimatedSection";
import { getIcon } from "@/utils/icons";
import type { SecurityContent } from "@/types";

const securityEmojis = ["🚫", "💳", "🔑", "🏛️", "⚡", "📊"];

export function Security({ content }: { content: SecurityContent }) {
  const title = content.title || "Vantagens do consórcio";
  const tag = content.tag || "Por que escolher";
  
  return (
    <section className="py-20 md:py-28 px-4 sm:px-8 bg-warm-white">
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
        <div className="grid sm:grid-cols-2 gap-5 mt-14">
          {content.points.map((p, i) => (
            <AnimatedSection key={i} delay={i * 0.08}>
              <div className="flex gap-5 p-7 bg-white rounded-2xl border border-[#EDE8DC] items-start transition-all duration-200 hover:border-gold hover:shadow-[0_8px_24px_rgba(200,168,75,0.1)]">
                <div className="w-[52px] h-[52px] bg-gold-pale rounded-xl flex items-center justify-center text-[22px] shrink-0">
                  {securityEmojis[i] || "🛡️"}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-midnight mb-1.5">{p.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-[1.6] font-light">{p.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
