import { useState, useCallback } from "react";
import { MessageCircle, Check, ChevronsUpDown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { buildWhatsAppUrl, buildContactMessage } from "@/utils/whatsapp";
import { safeScrollTo } from "./Header";
import { Input } from "@/components/ui/input";
import { formatPhone, isValidPhone, isWhatsApp, formatCPF, isValidCPF, formatBirthDate, isValidBirthDate } from "@/utils/phone";
import { sendLeadWebhook } from "@/utils/leadWebhook";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { HeroContent, SiteConfig, SimulatorCalc } from "@/types";

interface Props { content: HeroContent; config: SiteConfig; simulatorCalc: SimulatorCalc }


function fmt(n: number) {
  return "R$ " + Math.round(n).toLocaleString("pt-BR");
}

export function Hero({ content, config, simulatorCalc }: Props) {
  const calc = simulatorCalc;
  const [type, setType] = useState<"imovel" | "veiculo">("imovel");
  const isVehicle = type === "veiculo";
  
  const currentAdminRate = isVehicle && calc.vehicleAdminRate !== undefined ? calc.vehicleAdminRate : calc.adminRate;
  const currentReductionFactor = isVehicle && calc.vehicleReductionFactor !== undefined ? calc.vehicleReductionFactor : calc.reductionFactor;

  // Dynamic ranges based on type
  const minCredit = isVehicle ? (calc.vehicleMinCredit || 50000) : calc.creditMin;
  const maxCredit = isVehicle ? (calc.vehicleMaxCredit || 300000) : calc.creditMax;
  const creditStep = isVehicle ? (calc.vehicleCreditStep || 10000) : calc.creditStep;
  
  const [credit, setCredit] = useState(isVehicle ? 80000 : 210000);
  const [prazo, setPrazo] = useState(isVehicle ? 80 : 240);
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const [urgencyValue, setUrgencyValue] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCPF, setCustomerCPF] = useState("");
  const [customerBirthDate, setCustomerBirthDate] = useState("");
  const [customerIncome, setCustomerIncome] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checkingWhatsApp, setCheckingWhatsApp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const urgencyOptions = [
    { value: "pretende-comprar", label: "Pretende comprar" },
    { value: "sem-prazo", label: "Sem prazo" },
  ];
  
  // Prazo options also vary by type
  const currentPrazoOptions = isVehicle 
    ? (calc.vehiclePrazoOptions || [{ value: 60, label: "60 meses" }, { value: 72, label: "72 meses" }, { value: 80, label: "80 meses" }, { value: 100, label: "100 meses" }])
    : calc.prazoOptions;

  const actualCredit = Math.max(minCredit, Math.min(credit, maxCredit));
  
  // Cálculo da parcela
  const totalWithAdmin = actualCredit * (1 + currentAdminRate / 100);
  const baseInstallment = totalWithAdmin / prazo;
  const parcela = currentReductionFactor > 0 ? baseInstallment * (currentReductionFactor / 100) : baseInstallment;

  const handleCta = (href: string) => {
    if (href === "whatsapp") {
      setIsModalOpen(true);
    } else {
      safeScrollTo(href);
    }
  };

  async function submitSimulation() {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.name = "Informe seu nome";
    if (!isValidPhone(customerPhone)) e.phone = "Informe um WhatsApp válido";
    
    const showCPF = config.formFields?.showCPF ?? true;
    const showBirthDate = config.formFields?.showBirthDate ?? true;

    if (showCPF && !isValidCPF(customerCPF)) e.cpf = "Informe um CPF válido";
    if (showBirthDate && !isValidBirthDate(customerBirthDate)) e.birthDate = "Informe uma data válida";
    
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    // Se já está verificado, prossegue direto
    if (isVerified) {
      proceedToWhatsApp();
      return;
    }

    setCheckingWhatsApp(true);
    const validWA = await isWhatsApp(customerPhone);
    setCheckingWhatsApp(false);

    if (!validWA) {
      setErrors({ phone: "WhatsApp não encontrado ou inválido" });
      return;
    }

    setIsVerified(true);
    setLoading(true);

    const urgencyLabel = urgencyValue 
      ? urgencyOptions.find(o => o.value === urgencyValue)?.label 
      : "Não informado";
    
    const payload = { 
      name: customerName,
      phone: customerPhone,
      cpf: customerCPF,
      birthDate: customerBirthDate,
      income: customerIncome,
      objective: type === "imovel" ? "Imóvel" : "Veículo",
      credit: fmt(actualCredit),
      months: String(prazo),
      installment: fmt(parcela),
      urgency: urgencyLabel
    };

    // Salvar no banco de dados para auditoria
    try {
      await supabase.from("leads").insert([{
        name: customerName,
        phone: customerPhone,
        cpf: customerCPF,
        birth_date: customerBirthDate,
        income: customerIncome,
        objective: type === "imovel" ? "Imóvel" : "Veículo",
        credit: fmt(actualCredit),
        months: String(prazo),
        installment: fmt(parcela),
        urgency: urgencyLabel,
        source: "hero_simulator",
        form_type: "hero_modal",
        status: "sent"
      }]);
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }

    sendLeadWebhook(config.webhookUrl, payload);
    
    const msg = buildContactMessage({ 
      name: customerName, 
      phone: customerPhone, 
      cpf: customerCPF,
      birthDate: customerBirthDate,
      income: customerIncome,
      objective: type === "imovel" ? "Imóvel" : "Veículo", 
      credit: fmt(actualCredit),
      months: String(prazo),
      installment: fmt(parcela),
      urgency: urgencyLabel,
      baseMessage: config.contact.whatsappMessage
    });
    
    window.open(buildWhatsAppUrl(config.contact.whatsapp, msg, true), "_blank");
    
    setTimeout(() => { 
      setLoading(false); 
      setIsModalOpen(false);
    }, 500);
  }

  function proceedToWhatsApp() {
    setLoading(true);

    const urgencyLabel = urgencyValue 
      ? urgencyOptions.find(o => o.value === urgencyValue)?.label 
      : "Não informado";
    
    const payload = { 
      name: customerName,
      phone: customerPhone,
      cpf: customerCPF,
      birthDate: customerBirthDate,
      income: customerIncome,
      objective: type === "imovel" ? "Imóvel" : "Veículo",
      credit: fmt(actualCredit),
      months: String(prazo),
      installment: fmt(parcela),
      urgency: urgencyLabel
    };

    // Save to DB
    supabase.from("leads").insert([{
      name: customerName,
      phone: customerPhone,
      cpf: customerCPF,
      birth_date: customerBirthDate,
      income: customerIncome,
      objective: type === "imovel" ? "Imóvel" : "Veículo",
      credit: fmt(actualCredit),
      months: String(prazo),
      installment: fmt(parcela),
      urgency: urgencyLabel,
      source: "hero_simulator",
      status: "sent"
    }]).then(({error}) => {
       if(error) console.error("Erro ao salvar lead:", error);
    });

    sendLeadWebhook(config.webhookUrl, payload);
    
    const msg = buildContactMessage({ 
      name: customerName, 
      phone: customerPhone, 
      cpf: customerCPF,
      birthDate: customerBirthDate,
      income: customerIncome,
      objective: type === "imovel" ? "Imóvel" : "Veículo", 
      credit: fmt(actualCredit),
      months: String(prazo),
      installment: fmt(parcela),
      urgency: urgencyLabel,
      baseMessage: config.contact.whatsappMessage
    });
    
    window.open(buildWhatsAppUrl(config.contact.whatsapp, msg, true), "_blank");
    
    setTimeout(() => { 
      setLoading(false); 
      setIsModalOpen(false);
    }, 500);
  }

  const handleTypeChange = useCallback((t: "imovel" | "veiculo") => {
    setType(t);
    if (t === "veiculo") {
      setCredit(80000);
      setPrazo(isVehicle && calc.vehiclePrazoOptions ? calc.vehiclePrazoOptions[calc.vehiclePrazoOptions.length - 1].value : 80);
    } else {
      setCredit(300000);
      setPrazo(calc.prazoDefault || 240);
    }
  }, [isVehicle, calc.vehiclePrazoOptions, calc.prazoDefault]);

  return (
    <section 
      id="inicio" 
      className={cn(
        "relative min-h-[75vh] flex bg-midnight overflow-hidden",
        content.verticalAlign === "top" ? "items-start pt-20" : content.verticalAlign === "bottom" ? "items-end pb-20" : "items-center"
      )}
    >
      {/* Background Image with Overlay */}
      {content.image ? (
        <div className="absolute inset-0 z-0">
          <img 
            src={content.image} 
            className="w-full h-full object-cover opacity-20" 
            alt={`Banner de consórcio - ${config.brand.name}`} 
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/80 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-midnight" />
      )}

      
      <div className="arabesque" />
      <div className="absolute w-[600px] h-[600px] -top-[200px] -right-[150px] rounded-full border border-gold/15 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bottom-[100px] -left-[100px] rounded-full border border-gold/15 pointer-events-none" />

      <div className={cn(
        "relative z-10 max-w-[1100px] mx-auto px-4 sm:px-8 pt-6 pb-4 md:pt-8 md:pb-6 w-full",
        content.verticalAlign === "top" ? "mb-auto" : content.verticalAlign === "bottom" ? "mt-auto" : ""
      )}>
        <div className={cn(
          "grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-16",
          content.verticalAlign === "top" ? "items-start" : "items-center"
        )}>
          {/* Left content */}
          <div className="flex flex-col gap-7">
            <AnimatedSection noAnimation>
              <div className="inline-flex items-center gap-2 text-gold text-xs font-semibold tracking-[2px] uppercase">
                <span className="w-8 h-px bg-gold" />
                {content.eyebrow}
              </div>
            </AnimatedSection>
            <AnimatedSection noAnimation>
              <h1 className="font-heading text-[clamp(2.5rem,6.5vw,4.8rem)] font-light leading-[1.05] tracking-[-0.03em] text-white break-words">
                {content.headline.split("—")[0]}
                {content.headline.includes("—") && (
                  <><br /><em className="italic text-gold font-normal">{content.headline.split("—")[1]}</em></>
                )}
              </h1>
            </AnimatedSection>
            <AnimatedSection noAnimation>
              <p className="text-[17px] text-white/60 leading-[1.7] max-w-[480px] font-light">
                {content.subheadline}
              </p>
            </AnimatedSection>
            <AnimatedSection noAnimation>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {["JL", "MA", "RS", "+"].map((initials, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-midnight bg-gradient-to-br from-navy-light to-gold-pale flex items-center justify-center text-xs font-bold text-midnight">
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-white/55">
                  <strong className="text-white font-semibold">{content.trustText.split(" ").slice(0, 3).join(" ")}</strong>{" "}
                  {content.trustText.split(" ").slice(3).join(" ")}
                </p>
              </div>
            </AnimatedSection>
          </div>

          {/* Right - Simulator card */}
          <AnimatedSection noAnimation>
            <div className="bg-white rounded-[32px] p-4 sm:p-6 shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(200,168,75,0.15)] relative overflow-hidden ring-1 ring-gold/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
              <h3 className="font-heading text-[22px] font-medium text-midnight mb-4 tracking-tight">{calc.title || "Simule seu consórcio"}</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-muted-foreground/80 mb-1.5">Tipo de bem</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTypeChange("imovel")}
                      className={`py-1.5 px-4 border-2 rounded-xl text-center text-[13px] font-semibold transition-all duration-300 ${type === "imovel" ? "border-gold bg-gold-pale/50 text-midnight shadow-sm" : "border-border/60 text-muted-foreground hover:border-gold/40 hover:bg-gold-pale/10"}`}
                    >
                      Imóvel
                    </button>
                    <button
                      onClick={() => handleTypeChange("veiculo")}
                      className={`py-1.5 px-4 border-2 rounded-xl text-center text-[13px] font-semibold transition-all duration-300 ${type === "veiculo" ? "border-gold bg-gold-pale/50 text-midnight shadow-sm" : "border-border/60 text-muted-foreground hover:border-gold/40 hover:bg-gold-pale/10"}`}
                    >
                      Veículo
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground/80 mb-2">Crédito desejado</p>
                  <p className="font-numbers text-3xl font-semibold text-midnight tracking-tighter mb-1">{fmt(actualCredit)}</p>
                  <div className="relative pt-1 pb-2">
                    <input
                      type="range"
                      className="w-full accent-gold h-2 rounded-full cursor-pointer bg-muted"
                      min={minCredit}
                      max={maxCredit}
                      step={creditStep}
                      value={actualCredit}
                      onChange={e => setCredit(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 mt-2 font-numbers">
                      <span>{fmt(minCredit)}</span>
                      <span>{fmt(maxCredit)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-1">Prazo</p>
                  <select
                    value={prazo}
                    onChange={e => setPrazo(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border-[1.5px] border-border rounded-lg text-[13px] text-foreground bg-white outline-none cursor-pointer appearance-none"
                  >
                    {currentPrazoOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-1">Qual a urgência?</p>
                  <Popover open={urgencyOpen} onOpenChange={setUrgencyOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={urgencyOpen}
                        className="w-full justify-between px-3 py-1.5 h-auto border-[1.5px] border-border rounded-lg text-[13px] font-normal text-foreground bg-white hover:bg-white"
                      >
                        {urgencyValue
                          ? urgencyOptions.find((opt) => opt.value === urgencyValue)?.label
                          : "Selecione..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar urgência..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                          <CommandGroup>
                            {urgencyOptions.map((opt) => (
                              <CommandItem
                                key={opt.value}
                                value={opt.value}
                                onSelect={(currentValue) => {
                                  setUrgencyValue(currentValue === urgencyValue ? "" : currentValue);
                                  setUrgencyOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    urgencyValue === opt.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {opt.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className={cn(
                  "bg-midnight/95 backdrop-blur-sm rounded-xl p-3 border border-white/5",
                  calc.showAdminRate !== false ? "grid grid-cols-2 gap-6" : "flex flex-col items-center justify-center text-center space-y-2"
                )}>
                  <div className={cn(
                    "flex flex-col",
                    calc.showAdminRate === false ? "items-center w-full" : ""
                  )}>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-[1.5px] mb-2">{calc.installmentLabel || "Parcela reduzida*"}</p>
                    <p className={cn(
                      "font-numbers font-semibold text-gold leading-none",
                      calc.showAdminRate === false ? "text-[32px] md:text-[38px]" : "text-[24px]"
                    )}>{fmt(parcela)}</p>
                    <p className="text-[10px] text-white/30 mt-2 italic">*até a contemplação</p>
                  </div>
                  {calc.showAdminRate !== false && (
                    <div className="border-l border-white/10 pl-4 flex flex-col justify-center">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-[1.5px] mb-1">Taxa adm./mês</p>
                      <p className="font-numbers text-[24px] font-semibold text-gold leading-none">{((currentAdminRate / prazo)).toFixed(2)}%</p>
                      <p className="text-[10px] text-white/30 mt-2 italic">{calc.interestFreeLabel || "sem juros"}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {calc.badges.map((badge, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gold-pale text-foreground border border-gold/30">{badge}</span>
                  ))}
                </div>

                <Button
                  onClick={() => handleCta("whatsapp")}
                  className="w-full gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-lg py-2.5 h-auto text-[14px] font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  {calc.ctaText}
                </Button>
                <div className="space-y-1">
                  <p className="text-center text-[11px] text-muted-foreground">{calc.privacyText}</p>
                  <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed italic">
                    {calc.disclaimerText || "*Os valores das parcelas são apenas para consulta. O valor real e as condições devem ser confirmados com o consultor."}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-midnight p-6 text-white">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-heading font-medium text-gold tracking-tight">Quase lá!</DialogTitle>
              <DialogDescription className="text-white/60 font-light">
                Informe seus dados para receber a simulação detalhada de {type === "imovel" ? "imóvel" : "veículo"} no seu WhatsApp.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-5 bg-white">
            <div className="flex items-center justify-between p-4 bg-gold-pale/30 rounded-2xl border border-gold/10">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Crédito Simulado</p>
                <p className="text-xl font-numbers font-semibold text-midnight">{fmt(actualCredit)}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Prazo</p>
                <p className="text-xl font-numbers font-semibold text-midnight">{prazo} meses</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-midnight/70 ml-1">Nome Completo</label>
                <Input 
                  placeholder="Seu nome" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  className={`h-12 rounded-xl px-4 border-none bg-warm-white shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30 ${errors.name ? "ring-1 ring-destructive" : ""}`} 
                />
                {errors.name && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-midnight/70 ml-1">WhatsApp</label>
                <div className="relative">
                  <Input 
                    placeholder="(00) 00000-0000" 
                    value={customerPhone} 
                    onChange={e => {
                      setCustomerPhone(formatPhone(e.target.value));
                      setIsVerified(false);
                    }} 
                    className={`h-12 rounded-xl px-4 pr-10 border-none bg-warm-white shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30 ${errors.phone ? "ring-1 ring-destructive" : ""}`} 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : isVerified ? <CheckCircle2 className="w-4 h-4 text-whatsapp" /> : null}
                  </div>
                </div>
                {errors.phone && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.phone}</p>}
              </div>
              {((config.formFields?.showCPF ?? true) || (config.formFields?.showBirthDate ?? true)) && (
                <div className={cn(
                  "grid gap-3",
                  (config.formFields?.showCPF ?? true) && (config.formFields?.showBirthDate ?? true) ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                )}>
                  {(config.formFields?.showCPF ?? true) && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-midnight/70 ml-1">CPF</label>
                      <Input 
                        placeholder="000.000.000-00" 
                        value={customerCPF} 
                        onChange={e => setCustomerCPF(formatCPF(e.target.value))} 
                        className={cn(
                          "h-12 rounded-xl px-4 border-none bg-warm-white shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30",
                          errors.cpf ? "ring-1 ring-destructive" : ""
                        )} 
                      />
                      {errors.cpf && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.cpf}</p>}
                    </div>
                  )}

                  {(config.formFields?.showBirthDate ?? true) && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-midnight/70 ml-1">Nascimento</label>
                      <Input 
                        placeholder="DD/MM/AAAA" 
                        value={customerBirthDate} 
                        onChange={e => setCustomerBirthDate(formatBirthDate(e.target.value))} 
                        className={cn(
                          "h-12 rounded-xl px-4 border-none bg-warm-white shadow-inner focus-visible:ring-1 focus-visible:ring-gold/30",
                          errors.birthDate ? "ring-1 ring-destructive" : ""
                        )} 
                      />
                      {errors.birthDate && <p className="text-[10px] text-destructive font-semibold ml-2 uppercase tracking-wider">{errors.birthDate}</p>}
                    </div>
                  )}
                </div>
              )}

              {(config.formFields?.showIncome ?? true) && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-midnight/70 ml-1">Qual sua renda?</label>
                  <select
                    value={customerIncome}
                    onChange={e => setCustomerIncome(e.target.value)}
                    className="w-full h-12 rounded-xl px-4 border-none bg-warm-white shadow-inner focus:ring-1 focus:ring-gold/30 text-sm outline-none appearance-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="Até R$ 3.000">Até R$ 3.000</option>
                    <option value="R$ 3.000 a R$ 5.000">R$ 3.000 a R$ 5.000</option>
                    <option value="R$ 5.000 a R$ 10.000">R$ 5.000 a R$ 10.000</option>
                    <option value="Acima de R$ 10.000">Acima de R$ 10.000</option>
                  </select>
                </div>
              )}
            </div>

            <Button 
              onClick={submitSimulation} 
              disabled={loading || checkingWhatsApp} 
              className="w-full h-14 gap-3 bg-whatsapp hover:bg-whatsapp/90 text-white text-base font-bold rounded-xl shadow-xl shadow-whatsapp/10 transition-all active:scale-[0.98] group/btn"
            >
              {loading || checkingWhatsApp ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span>{checkingWhatsApp ? "VERIFICANDO..." : "RECEBER SIMULAÇÃO"}</span>
                </>
              )}
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground/60 italic">
              *Ao clicar, você será redirecionado para o WhatsApp com os dados preenchidos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}