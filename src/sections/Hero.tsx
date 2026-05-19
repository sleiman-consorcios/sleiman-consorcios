import { useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import type { HeroContent, SiteConfig, SimulatorCalc } from "@/types";

interface Props { content: HeroContent; config: SiteConfig; simulatorCalc: SimulatorCalc }

function fmt(n: number) {
  return "R$ " + Math.round(n).toLocaleString("pt-BR");
}

export function Hero({ content, config, simulatorCalc }: Props) {
  const calc = simulatorCalc;
  const [type, setType] = useState<"imovel" | "veiculo">("imovel");
  const [credit, setCredit] = useState(calc.creditDefault);
  const [prazo, setPrazo] = useState(calc.prazoDefault);

  const maxCredit = type === "veiculo" ? calc.vehicleMaxCredit : calc.creditMax;
  const actualCredit = Math.min(credit, maxCredit);
  const parcela = (actualCredit / prazo + actualCredit * calc.adminRate) * calc.reductionFactor;
  const pct = ((actualCredit - calc.creditMin) / (maxCredit - calc.creditMin)) * 100;

  function handleCta(href: string) {
    if (href === "whatsapp") {
      const msg = `Olá! Simulei um consórcio de ${type === "imovel" ? "imóvel" : "veículo"} de ${fmt(actualCredit)}, ${prazo} meses, parcela ${fmt(parcela)}. Gostaria de mais informações.`;
      window.open(buildWhatsAppUrl(config.contact.whatsapp, msg), "_blank");
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const handleTypeChange = useCallback((t: "imovel" | "veiculo") => {
    setType(t);
    if (t === "veiculo" && credit > calc.vehicleMaxCredit) {
      setCredit(calc.vehicleMaxCredit);
    }
  }, [credit, calc.vehicleMaxCredit]);

  return (
    <section id="inicio" className="relative pt-16 min-h-[88vh] flex items-center bg-midnight overflow-hidden">
      <div className="arabesque" />
      <div className="absolute w-[600px] h-[600px] -top-[200px] -right-[150px] rounded-full border border-gold/15 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bottom-[100px] -left-[100px] rounded-full border border-gold/15 pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-8 py-20 md:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-7">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 text-gold text-xs font-semibold tracking-[2px] uppercase">
                <span className="w-8 h-px bg-gold" />
                {content.eyebrow || "Consórcio com quem entende"}
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.05}>
              <h1 className="font-heading text-[clamp(2.75rem,5.5vw,4.5rem)] font-light leading-[1.05] tracking-tight text-white">
                {content.headline.split("—")[0]}
                {content.headline.includes("—") && (
                  <><br /><em className="italic text-gold">{content.headline.split("—")[1]}</em></>
                )}
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-[17px] text-white/60 leading-[1.7] max-w-[480px] font-light">
                {content.subheadline}
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {["JL", "MA", "RS", "+"].map((initials, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-midnight bg-gradient-to-br from-navy-light to-gold-pale flex items-center justify-center text-xs font-bold text-midnight">
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-white/55">
                  <strong className="text-white font-semibold">{(content.trustText || "Centenas de famílias já realizaram seus sonhos com a Sleiman").split(" ").slice(0, 3).join(" ")}</strong>{" "}
                  {(content.trustText || "Centenas de famílias já realizaram seus sonhos com a Sleiman").split(" ").slice(3).join(" ")}
                </p>
              </div>
            </AnimatedSection>
          </div>

          {/* Right - Simulator card */}
          <AnimatedSection delay={0.2}>
            <div className="bg-warm-white rounded-[20px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.4),0_0_0_1px_rgba(200,168,75,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-gold-light" />
              <h3 className="font-heading text-[22px] font-semibold text-midnight mb-6">{calc.ctaText ? "Simule seu consórcio" : "Simule seu consórcio"}</h3>

              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-2">Tipo de bem</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTypeChange("imovel")}
                      className={`py-2.5 px-3 border-[1.5px] rounded-lg text-center text-[13px] font-medium transition-colors ${type === "imovel" ? "border-gold bg-gold-pale font-semibold text-midnight" : "border-border text-muted-foreground cursor-pointer hover:border-gold/50"}`}
                    >🏠 Imóvel</button>
                    <button
                      onClick={() => handleTypeChange("veiculo")}
                      className={`py-2.5 px-3 border-[1.5px] rounded-lg text-center text-[13px] font-medium transition-colors ${type === "veiculo" ? "border-gold bg-gold-pale font-semibold text-midnight" : "border-border text-muted-foreground cursor-pointer hover:border-gold/50"}`}
                    >🚗 Veículo</button>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-2">Crédito desejado</p>
                  <p className="font-heading text-4xl font-semibold text-midnight tracking-tight mb-2">{fmt(actualCredit)}</p>
                  <input
                    type="range"
                    className="w-full accent-gold h-1.5 rounded-full cursor-pointer"
                    min={calc.creditMin}
                    max={maxCredit}
                    step={calc.creditStep}
                    value={actualCredit}
                    onChange={e => setCredit(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>{fmt(calc.creditMin)}</span>
                    <span>{fmt(maxCredit)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-2">Prazo</p>
                  <select
                    value={prazo}
                    onChange={e => setPrazo(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-[14px] text-foreground bg-white outline-none cursor-pointer appearance-none"
                  >
                    {calc.prazoOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-midnight rounded-xl p-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-white/50 font-medium uppercase tracking-[0.5px] mb-1">Parcela reduzida*</p>
                    <p className="font-heading text-[26px] font-semibold text-gold tracking-tight">{fmt(parcela)}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">*até a contemplação</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/50 font-medium uppercase tracking-[0.5px] mb-1">Taxa adm./mês</p>
                    <p className="font-heading text-[26px] font-semibold text-gold tracking-tight">{(calc.adminRate * 100).toFixed(2)}%</p>
                    <p className="text-[10px] text-white/35 mt-0.5">sem juros</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {calc.badges.map((badge, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gold-pale text-foreground border border-gold/30">{badge}</span>
                  ))}
                </div>

                <Button
                  onClick={() => handleCta("whatsapp")}
                  className="w-full gap-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-[10px] py-4 h-auto text-[15px] font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  {calc.ctaText}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">{calc.privacyText}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
