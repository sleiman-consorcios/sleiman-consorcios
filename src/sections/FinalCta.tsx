import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import type { FinalCtaContent, SiteConfig } from "@/types";

interface Props { content: FinalCtaContent; config: SiteConfig }

export function FinalCta({ content, config }: Props) {
  return (
    <section id="contato" className="py-20 md:py-28 px-4 sm:px-8 bg-midnight relative overflow-hidden">
      <div className="arabesque" style={{ opacity: 0.03 }} />
      <div className="max-w-[720px] mx-auto relative z-[2] text-center">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4 block text-center">— {content.tag || "Comece agora"}</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] font-normal text-white leading-[1.1] mb-3">
            {content.title.includes("—") ? (
              <>{content.title.split("—")[0]}<br /><em className="italic text-gold">{content.title.split("—")[1]}</em></>
            ) : (
              <>{content.title.split(" ").slice(0, -1).join(" ")}<br /><em className="italic text-gold">{content.title.split(" ").slice(-1)}</em></>
            )}
          </h2>
          <p className="text-[17px] text-white/50 font-light mt-3">{content.subtitle}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="mt-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {(content.objectives || ["🏠 Comprar imóvel", "🔑 Sair do aluguel", "🚗 Trocar o carro", "📈 Investir"]).map((obj, i) => (
              <button key={i} className="py-3.5 px-2 bg-white/[0.06] border-[1.5px] border-white/[0.12] rounded-[10px] text-white/70 text-xs font-medium flex flex-col items-center gap-1.5 hover:bg-gold/15 hover:border-gold hover:text-gold transition-all duration-200">
                <span className="text-xl">{obj.split(" ")[0]}</span>
                <span>{obj.split(" ").slice(1).join(" ")}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Seu nome</label>
              <input className="px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white text-[15px] placeholder:text-white/25 focus:border-gold focus:bg-white/10 outline-none transition-colors" placeholder="João Silva" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">WhatsApp</label>
              <input className="px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white text-[15px] placeholder:text-white/25 focus:border-gold focus:bg-white/10 outline-none transition-colors" placeholder="(12) 99999-9999" />
            </div>
          </div>
          <select className="w-full px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white/80 text-[15px] outline-none cursor-pointer mb-4 appearance-none">
            {(content.creditOptions || ["Até R$ 100.000", "Entre R$ 100k e R$ 300k", "Entre R$ 300k e R$ 600k", "Entre R$ 600k e R$ 1M", "Acima de R$ 1M"]).map((opt, i) => (
              <option key={i} className="bg-midnight text-white">{opt}</option>
            ))}
          </select>

          <Button
            className="w-full max-w-[480px] mx-auto gap-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-[10px] py-4 h-auto text-[15px] font-semibold flex"
            onClick={() => window.open(buildWhatsAppUrl(config.contact.whatsapp, "Olá, gostaria de uma simulação gratuita."), "_blank")}
          >
            <MessageCircle className="w-5 h-5" />
            {content.ctaWhatsapp}
          </Button>
          <p className="text-xs text-white/30 mt-4">{content.privacyText || "🔒 Seus dados estão protegidos"}</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
