import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatPhone, isValidPhone, isWhatsApp, formatCPF, isValidCPF, formatBirthDate, isValidBirthDate } from "@/utils/phone";
import { buildWhatsAppUrl, buildContactMessage } from "@/utils/whatsapp";
import { sendLeadWebhook } from "@/utils/leadWebhook";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Loader2, Info, Check, CheckCircle2, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulatorContent, SiteConfig } from "@/types";

interface Props { content: SimulatorContent; config: SiteConfig; webhookUrl?: string }

export function SimulatorForm({ content, config, webhookUrl }: Props) {
  const calc = useMemo(() => {
    const base = content.calc || {
      creditMin: 50000,
      creditMax: 500000,
      creditStep: 5000,
      creditDefault: 100000,
      adminRate: 15,
      reductionFactor: 0,
      prazoOptions: [
        { value: 60, label: "60 meses" },
        { value: 120, label: "120 meses" },
        { value: 180, label: "180 meses" },
        { value: 240, label: "240 meses" }
      ],
      prazoDefault: 240,
      vehicleMaxCredit: 200000,
      vehicleMinCredit: 30000,
      vehicleCreditStep: 1000,
      vehicleAdminRate: 15,
      vehicleReductionFactor: 0,
      vehiclePrazoOptions: [
        { value: 36, label: "36 meses" },
        { value: 48, label: "48 meses" },
        { value: 60, label: "60 meses" },
        { value: 72, label: "72 meses" },
        { value: 84, label: "84 meses" }
      ]
    };
    return base as SimulatorContent["calc"];
  }, [content.calc]);

  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    cpf: "",
    birthDate: "",
    income: "",
    objective: content.objectives[0] || "Imóvel", 
    credit: 210000, 
    months: 240,
    hasLance: "" 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checkingWhatsApp, setCheckingWhatsApp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [sent, setSent] = useState(false);

  const estimatedInstallment = useMemo(() => {
    const objectiveLower = form.objective.toLowerCase();
    const isVehicle = objectiveLower.includes("veículo") || objectiveLower.includes("carro") || objectiveLower.includes("automóvel") || objectiveLower.includes("moto");
    
    const currentAdminRate = isVehicle && calc.vehicleAdminRate !== undefined ? calc.vehicleAdminRate : (calc.adminRate || 15);
    const currentReductionFactor = isVehicle && calc.vehicleReductionFactor !== undefined ? calc.vehicleReductionFactor : (calc.reductionFactor || 0);

    // Cálculo: (Crédito * (1 + taxa_adm/100)) / meses
    let total = form.credit * (1 + currentAdminRate / 100);
    let baseInstallment = total / form.months;
    
    if (currentReductionFactor > 0 && currentReductionFactor < 100) {
      // Se o fator de redução é 50, o cliente paga 50% da parcela
      return baseInstallment * (currentReductionFactor / 100);
    }
    
    return baseInstallment;
  }, [form.credit, form.months, form.objective, calc]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Informe seu nome";
    if (!isValidPhone(form.phone)) e.phone = "Informe um WhatsApp válido";
    
    const showCPF = config.formFields?.showCPF ?? true;
    const showBirthDate = config.formFields?.showBirthDate ?? true;
    
    if (showCPF && !isValidCPF(form.cpf)) e.cpf = "Informe um CPF válido";
    if (showBirthDate && !isValidBirthDate(form.birthDate)) e.birthDate = "Informe uma data válida";
    if (!form.objective) e.objective = "Selecione um objetivo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function formatCurrency(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  }

  async function submit() {
    if (!validate()) return;
    
    setCheckingWhatsApp(true);
    const validWA = await isWhatsApp(form.phone);
    setCheckingWhatsApp(false);

    if (!validWA) {
      setErrors(prev => ({ ...prev, phone: "WhatsApp não encontrado ou inválido" }));
      return;
    }

    setIsVerified(true);
    setLoading(true);
    
    const payload = { 
      ...form, 
      credit: formatCurrency(form.credit),
      months: String(form.months),
      installment: formatCurrency(estimatedInstallment)
    };

    sendLeadWebhook(webhookUrl, payload);
    
    // Salvar no banco de dados para auditoria
    try {
      await supabase.from("leads").insert([{
        name: form.name,
        phone: form.phone,
        cpf: form.cpf,
        birth_date: form.birthDate,
        income: form.income,
        objective: form.objective,
        credit: formatCurrency(form.credit),
        months: String(form.months),
        installment: formatCurrency(estimatedInstallment),
        has_lance: form.hasLance,
        source: "main_simulator",
        form_type: "main_calculator",
        status: "sent"
      }]);
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }
    
    const msg = buildContactMessage({ 
      name: form.name, 
      phone: form.phone, 
      cpf: form.cpf,
      birthDate: form.birthDate,
      income: form.income,
      objective: form.objective, 
      credit: formatCurrency(form.credit),
      months: String(form.months),
      installment: formatCurrency(estimatedInstallment),
      hasLance: form.hasLance,
      baseMessage: config.contact.whatsappMessage
    });
    
    const whatsappUrl = buildWhatsAppUrl(config.contact.whatsapp, msg, true);
    if (whatsappUrl.startsWith("javascript:")) {
      // Execute the javascript code which includes the GTM callback
      const code = whatsappUrl.replace("javascript:", "");
      new Function(code)();
    } else {
      window.open(whatsappUrl, "_blank");
    }
    setTimeout(() => { setLoading(false); setSent(true); }, 500);
  }

  if (sent) return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-whatsapp/10 flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-6 h-6 text-whatsapp" /></div>
      <p className="font-heading text-xl mb-1">Simulação enviada!</p>
      <p className="text-sm text-muted-foreground">O Farid retornará em breve com sua simulação personalizada.</p>
      <Button variant="outline" size="sm" onClick={() => setSent(false)} className="mt-4">Nova simulação</Button>
    </div>
  );

  return (
    <div className="space-y-8 sm:space-y-10 overflow-hidden">
      {/* Seção de Valores (Essência do Simulador) */}
      <div className="space-y-8 sm:space-y-10">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-[2px] text-gold mb-2 block">Quanto você precisa?</label>
              <p className="text-xs sm:text-sm text-muted-foreground font-light">Arraste para selecionar o crédito</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase block mb-1">Crédito Selecionado</span>
              <p className="font-numbers text-3xl sm:text-4xl md:text-5xl font-semibold text-midnight tracking-tighter">
                {formatCurrency(form.credit).split(",")[0]}
              </p>
            </div>
          </div>
          
          <div className="pt-4 pb-2 relative group">
            <Slider 
              value={[form.credit]} 
              min={(form.objective.toLowerCase().includes("veículo") || form.objective.toLowerCase().includes("carro") || form.objective.toLowerCase().includes("automóvel")) ? (calc.vehicleMinCredit || calc.creditMin) : calc.creditMin} 
              max={(form.objective.toLowerCase().includes("veículo") || form.objective.toLowerCase().includes("carro") || form.objective.toLowerCase().includes("automóvel")) ? (calc.vehicleMaxCredit || calc.creditMax) : calc.creditMax} 
              step={(form.objective.toLowerCase().includes("veículo") || form.objective.toLowerCase().includes("carro") || form.objective.toLowerCase().includes("automóvel")) ? (calc.vehicleCreditStep || calc.creditStep) : calc.creditStep} 
              onValueChange={([v]) => setForm(f => ({ ...f, credit: v }))}
              className="py-4 cursor-pointer"
            />
            {/* Gradiente sutil atrás do slider */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/30 via-gold to-gold/30 -translate-y-1/2 -z-10 opacity-20" />
            
            <div className="flex justify-between text-[10px] uppercase tracking-[1.5px] text-muted-foreground/50 font-bold mt-4 font-numbers">
              <span>{formatCurrency(calc.creditMin).split(",")[0]}</span>
              <span>{formatCurrency(calc.creditMax).split(",")[0]}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 border-t border-[#F0EBE0]">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-[2px] text-midnight/70 block">Prazo de Pagamento</label>
            <Select value={String(form.months)} onValueChange={v => setForm(f => ({ ...f, months: Number(v) }))}>
              <SelectTrigger className="h-14 bg-[#F9F8F6] border-none rounded-2xl px-5 text-base shadow-inner focus:ring-1 focus:ring-gold/30">
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-[#EDE8DC] shadow-xl">
                {(form.objective.toLowerCase().includes("veículo") || form.objective.toLowerCase().includes("carro") || form.objective.toLowerCase().includes("automóvel") 
                  ? (calc.vehiclePrazoOptions || calc.prazoOptions) 
                  : calc.prazoOptions
                ).map(p => (
                  <SelectItem key={p.value} value={String(p.value)} className="py-3 px-4 focus:bg-gold-pale">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-midnight rounded-[24px] sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group/parcela">
            {/* Efeito visual dentro do box da parcela */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover/parcela:scale-150 transition-transform duration-700" />
            
            <p className="text-[10px] text-white/40 uppercase tracking-[2px] font-bold mb-2 relative z-10">Parcela Estimada*</p>
            <p className="text-3xl sm:text-4xl font-numbers font-semibold text-gold leading-none tracking-tighter relative z-10">
              {formatCurrency(estimatedInstallment)}
            </p>
            <p className="text-[9px] text-white/30 mt-3 font-light relative z-10 italic">*valor sugerido</p>
          </div>
        </div>
      </div>

      {/* Seção de Contato - Design mais limpo */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px bg-[#F0EBE0] flex-1" />
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground/60">Dados para contato</p>
          <div className="h-px bg-[#F0EBE0] flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Input 
              placeholder="Nome completo" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              className={`h-14 rounded-2xl px-5 border-none bg-[#F9F8F6] shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30 ${errors.name ? "ring-1 ring-destructive" : ""}`} 
            />
            {errors.name && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <div className="relative">
              <Input 
                placeholder="WhatsApp" 
                value={form.phone} 
                onChange={e => {
                  setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
                  setIsVerified(false);
                }} 
                className={`h-14 rounded-2xl px-5 pr-10 border-none bg-[#F9F8F6] shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30 ${errors.phone ? "ring-1 ring-destructive" : ""}`} 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : isVerified ? <CheckCircle2 className="w-4 h-4 text-whatsapp" /> : null}
              </div>
            </div>
            {errors.phone && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.phone}</p>}
          </div>
        </div>

        {((config.formFields?.showCPF ?? true) || (config.formFields?.showBirthDate ?? true)) && (
          <div className={cn(
            "grid gap-4",
            (config.formFields?.showCPF ?? true) && (config.formFields?.showBirthDate ?? true) ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          )}>
            {(config.formFields?.showCPF ?? true) && (
              <div className="space-y-1.5">
                <Input 
                  placeholder="CPF (000.000.000-00)" 
                  value={form.cpf} 
                  onChange={e => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))} 
                  className={cn(
                    "h-14 rounded-2xl px-5 border-none bg-[#F9F8F6] shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30",
                    errors.cpf ? "ring-1 ring-destructive" : ""
                  )} 
                />
                {errors.cpf && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.cpf}</p>}
              </div>
            )}
            
            {(config.formFields?.showBirthDate ?? true) && (
              <div className="space-y-1.5">
                <Input 
                  placeholder="Nascimento (DD/MM/AAAA)" 
                  value={form.birthDate} 
                  onChange={e => setForm(f => ({ ...f, birthDate: formatBirthDate(e.target.value) }))} 
                  className={cn(
                    "h-14 rounded-2xl px-5 border-none bg-[#F9F8F6] shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30",
                    errors.birthDate ? "ring-1 ring-destructive" : ""
                  )} 
                />
                {errors.birthDate && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.birthDate}</p>}
              </div>
            )}
          </div>
        )}
        
        <div className={cn(
          "grid gap-4",
          (config.formFields?.showIncome ?? true) ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        )}>
          {(config.formFields?.showIncome ?? true) && (
            <Select 
              value={form.income} 
              onValueChange={v => setForm(f => ({ ...f, income: v }))}
            >
              <SelectTrigger className="h-14 rounded-2xl px-5 border-none bg-[#F9F8F6] shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30">
                <SelectValue placeholder="Qual sua renda?" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-[#EDE8DC] shadow-xl">
                <SelectItem value="Até R$ 3.000" className="py-3 px-4 focus:bg-gold-pale">Até R$ 3.000</SelectItem>
                <SelectItem value="R$ 3.000 a R$ 5.000" className="py-3 px-4 focus:bg-gold-pale">R$ 3.000 a R$ 5.000</SelectItem>
                <SelectItem value="R$ 5.000 a R$ 10.000" className="py-3 px-4 focus:bg-gold-pale">R$ 5.000 a R$ 10.000</SelectItem>
                <SelectItem value="Acima de R$ 10.000" className="py-3 px-4 focus:bg-gold-pale">Acima de R$ 10.000</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={form.hasLance} onValueChange={v => setForm(f => ({ ...f, hasLance: v }))}>
            <SelectTrigger className="h-14 rounded-2xl px-5 border-none bg-[#F9F8F6] shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30">
              <SelectValue placeholder="Possui lance?" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#EDE8DC] shadow-xl">
              <SelectItem value="Sim" className="py-3 px-4 focus:bg-gold-pale">Sim, tenho reserva</SelectItem>
              <SelectItem value="Não" className="py-3 px-4 focus:bg-gold-pale">Não, apenas parcelas</SelectItem>
              <SelectItem value="Talvez" className="py-3 px-4 focus:bg-gold-pale">Gostaria de avaliar</SelectItem>
            </SelectContent>
          </Select>
        </div>


        <div className="pt-4">
          <Button 
            onClick={submit} 
            disabled={loading || checkingWhatsApp} 
            className="w-full h-16 gap-3 bg-midnight hover:bg-midnight/90 text-white text-base font-bold rounded-2xl shadow-xl shadow-midnight/10 transition-all hover:scale-[1.01] active:scale-[0.99] group/btn"
          >
            {loading || checkingWhatsApp ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <MessageCircle className="w-5 h-5 text-gold group-hover/btn:scale-110 transition-transform" />
                <span>{checkingWhatsApp ? "VERIFICANDO..." : "RECEBER SIMULAÇÃO COMPLETA"}</span>
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground/60 font-medium">
            <Check className="w-3 h-3 text-gold" />
            <span className="uppercase tracking-[1px]">Privacidade 100% garantida</span>
          </div>
        </div>
      </div>
    </div>
  );
}
