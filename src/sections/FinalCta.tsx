import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { buildWhatsAppUrl, buildContactMessage, handleWhatsAppRedirect } from "@/utils/whatsapp";
import { formatPhone, isValidPhone, isWhatsApp, formatCPF, isValidCPF, formatBirthDate, isValidBirthDate } from "@/utils/phone";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendLeadWebhook } from "@/utils/leadWebhook";
import { getTrafficSource } from "@/utils/tracking";
import type { FinalCtaContent, SiteConfig } from "@/types";

interface Props { content: FinalCtaContent; config: SiteConfig }

export function FinalCta({ content, config }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cpf: "",
    birthDate: "",
    credit: content.creditOptions[0] || "",
    objective: content.objectives[0] || "",
    income: "",
    urgency: "Quero comprar"
  });
  const [loading, setLoading] = useState(false);
  const [checkingWhatsApp, setCheckingWhatsApp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    
    if (!isValidPhone(formData.phone)) {
      toast.error("Por favor, informe um WhatsApp válido.");
      return;
    }
    const showCPF = config.formFields?.showCPF ?? true;
    const showBirthDate = config.formFields?.showBirthDate ?? true;

    if (showCPF && !isValidCPF(formData.cpf)) {
      toast.error("Por favor, informe um CPF válido.");
      return;
    }
    if (showBirthDate && !isValidBirthDate(formData.birthDate)) {
      toast.error("Por favor, informe uma data de nascimento válida.");
      return;
    }

    setCheckingWhatsApp(true);
    const validWA = await isWhatsApp(formData.phone);
    setCheckingWhatsApp(false);

    if (!validWA) {
      toast.error("WhatsApp não encontrado ou inválido.");
      return;
    }

    setIsVerified(true);
    setLoading(true);

    const payload = {
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      creditRange: formData.credit,
      objective: formData.objective || "Interesse Geral / Simulação Livre",
      income: formData.income,
      urgency: formData.urgency
    };

    // Salvar no banco de dados para auditoria
    try {
      const { data: lead, error } = await supabase.from("leads").insert([{
        name: formData.name,
        phone: formData.phone,
        cpf: formData.cpf,
        birth_date: formData.birthDate,
        objective: formData.objective || "Interesse Geral / Simulação Livre",
        credit: formData.credit,
        income: formData.income,
        urgency: formData.urgency,
        source: "final_cta_form",
        form_type: "footer_contact",
        traffic_source: getTrafficSource(),
        status: "sent"
      }]);

      if (error) {
        console.error("Erro ao salvar lead no banco:", error);
      } else {
        console.log("Lead registrado");
        // Trigger notification edge function manually
        try {
          await supabase.functions.invoke("send-lead-notification", {
            body: { record: payload }
          });
        } catch (fnError) {
          console.error("Erro ao chamar função de notificação:", fnError);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }

    sendLeadWebhook(config.webhookUrl, payload);

    const msg = buildContactMessage({
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      creditRange: formData.credit,
      objective: formData.objective || "Interesse Geral / Simulação Livre",
      income: formData.income,
      urgency: formData.urgency,
      baseMessage: config.contact.whatsappMessage
    });

    handleWhatsAppRedirect(config.contact.whatsapp, msg);
    setLoading(false);
  };

  return (
    <section 
      id="contato" 
      className={cn(
        "py-20 md:py-28 px-4 sm:px-8 bg-midnight relative overflow-hidden flex",
        content.verticalAlign === "top" ? "items-start" : content.verticalAlign === "bottom" ? "items-end" : "items-center"
      )}
      style={{ minHeight: "600px" }}
    >
      <div className="arabesque" style={{ opacity: 0.03 }} />
      <div className="max-w-[720px] mx-auto relative z-[2] text-center w-full">
        <AnimatedSection>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-gold mb-4 block text-center">— {content.tag}</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {content.objectives.map((obj, i) => {
                const isActive = formData.objective === obj;
                return (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, objective: obj }))}
                    className={`py-3.5 px-2 border-[1.5px] rounded-[10px] text-xs font-medium flex flex-col items-center gap-1.5 transition-all duration-200 ${
                      isActive 
                        ? "bg-gold/20 border-gold text-gold shadow-[0_0_15px_rgba(200,168,75,0.2)]" 
                        : "bg-white/[0.06] border-white/[0.12] text-white/70 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="text-xl">{obj.split(" ")[0]}</span>
                    <span>{obj.split(" ").slice(1).join(" ")}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Seu nome</label>
                <input 
                  className="px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white text-[15px] placeholder:text-white/25 focus:border-gold focus:bg-white/10 outline-none transition-colors" 
                  placeholder="João Silva" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">WhatsApp</label>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-3.5 pr-10 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white text-[15px] placeholder:text-white/25 focus:border-gold focus:bg-white/10 outline-none transition-colors" 
                    placeholder="(12) 99999-9999" 
                    value={formData.phone}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
                      setIsVerified(false);
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin text-white/40" /> : isVerified ? <CheckCircle2 className="w-4 h-4 text-whatsapp" /> : null}
                  </div>
                </div>
              </div>
            </div>
            {((config.formFields?.showCPF ?? true) || (config.formFields?.showBirthDate ?? true)) && (
              <div className={cn(
                "grid gap-3 mb-4 text-left",
                (config.formFields?.showCPF ?? true) && (config.formFields?.showBirthDate ?? true) ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
              )}>
                {(config.formFields?.showCPF ?? true) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Seu CPF</label>
                    <input 
                      className="px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white text-[15px] placeholder:text-white/25 focus:border-gold focus:bg-white/10 outline-none transition-colors" 
                      placeholder="000.000.000-00" 
                      value={formData.cpf}
                      onChange={e => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                    />
                  </div>
                )}
                {(config.formFields?.showBirthDate ?? true) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Nascimento</label>
                    <input 
                      className="px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white text-[15px] placeholder:text-white/25 focus:border-gold focus:bg-white/10 outline-none transition-colors" 
                      placeholder="DD/MM/AAAA" 
                      value={formData.birthDate}
                      onChange={e => setFormData(prev => ({ ...prev, birthDate: formatBirthDate(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
            )}

            <div className={cn(
              "grid gap-3 mb-4 text-left",
              (config.formFields?.showIncome ?? true) ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            )}>
              {(config.formFields?.showIncome ?? true) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Qual sua renda?</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white/80 text-[15px] outline-none cursor-pointer appearance-none"
                    value={formData.income}
                    onChange={e => setFormData(prev => ({ ...prev, income: e.target.value }))}
                  >
                    <option value="" className="bg-midnight text-white">Selecione...</option>
                    <option value="Até R$ 3.000" className="bg-midnight text-white">Até R$ 3.000</option>
                    <option value="R$ 3.000 a R$ 5.000" className="bg-midnight text-white">R$ 3.000 a R$ 5.000</option>
                    <option value="R$ 5.000 a R$ 10.000" className="bg-midnight text-white">R$ 5.000 a R$ 10.000</option>
                    <option value="Acima de R$ 10.000" className="bg-midnight text-white">Acima de R$ 10.000</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Valor da carta</label>
                <select 
                  className="w-full px-4 py-3.5 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white/80 text-[15px] outline-none cursor-pointer appearance-none"
                  value={formData.credit}
                  onChange={e => setFormData(prev => ({ ...prev, credit: e.target.value }))}
                >
                  {content.creditOptions.map((opt, i) => (
                    <option key={i} value={opt} className="bg-midnight text-white">{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-6 text-left">
              <label className="text-[11px] font-semibold uppercase tracking-[1px] text-white/40">Qual sua urgência?</label>
              <div className="grid grid-cols-2 gap-3">
                {["Quero comprar", "Sem prazo"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, urgency: option }))}
                    className={`py-3 px-4 border-[1.5px] rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.urgency === option
                        ? "bg-gold/20 border-gold text-gold"
                        : "bg-white/[0.07] border-white/[0.12] text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || checkingWhatsApp}
              className="w-full max-w-[480px] mx-auto gap-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-[10px] py-4 h-auto text-[15px] font-semibold flex border-0 shadow-lg"
            >
              {loading || checkingWhatsApp ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              {checkingWhatsApp ? "Verificando WhatsApp..." : content.ctaWhatsapp}
            </Button>
          </form>
          <p className="text-xs text-white/30 mt-4">{content.privacyText}</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

