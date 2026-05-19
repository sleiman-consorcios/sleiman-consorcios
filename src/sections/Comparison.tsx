import { AnimatedSection } from "@/components/AnimatedSection";
import type { ComparisonContent } from "@/types";

export function Comparison({ content }: { content: ComparisonContent }) {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-8 bg-midnight relative overflow-hidden">
      <div className="arabesque" style={{ opacity: 0.03 }} />
      <div className="max-w-[1100px] mx-auto relative z-[2]">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4">— {content.tag || "Compare"}</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-white leading-[1.1]">
            {content.title}
          </h2>
          <p className="text-[17px] text-white/50 leading-[1.7] font-light max-w-[560px] mt-4">{content.subtitle}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="mt-14">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] rounded-2xl overflow-hidden">
              <thead>
                <tr>
                  <th className="py-5 px-7 text-left bg-navy-light text-white/60 text-[14px] font-medium uppercase tracking-[1px] font-body">{content.headers[0]}</th>
                  <th className="py-5 px-7 text-center bg-white/5 text-white/70 font-heading text-xl font-semibold">{content.headers[2]}</th>
                  <th className="py-5 px-7 text-center bg-gold text-midnight font-heading text-xl font-semibold">✓ {content.headers[1]}</th>
                </tr>
              </thead>
              <tbody>
                {content.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-4 px-7 bg-navy-light text-white/70 text-[14px] font-medium border-b border-white/5">{row.feature}</td>
                    <td className="py-4 px-7 text-center bg-white/[0.03] text-white/60 border-b border-white/5">{row.financing}</td>
                    <td className="py-4 px-7 text-center bg-gold/10 text-gold-light font-semibold border-b border-white/5">{row.consortium}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-4 px-7 bg-navy-light border-b border-white/5" />
                  <td className="py-4 px-7 bg-white/[0.03] border-b border-white/5" />
                  <td className="py-5 px-7 bg-gold text-midnight font-heading text-2xl font-bold text-center">
                    {content.savingsText || "Você economiza 💰"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-12">
            <button
              onClick={() => document.querySelector("#contato")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2.5 px-9 py-[18px] bg-gold hover:bg-gold-light text-midnight rounded-[10px] font-bold text-[15px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(200,168,75,0.3)]"
            >
              {content.ctaText || "Quero economizar assim →"}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-6 text-center">{content.disclaimer}</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
