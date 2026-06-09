import { Field, TextareaField, NumberField, SelectField, CheckboxField, DateTimeField } from "./Fields";
import { ImageUploadField } from "./ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Trash2, ChevronDown, ChevronRight, HelpCircle, Timer, 
  ArrowUp, ArrowDown, MapPin, Layout, User, Repeat, Target, 
  Scale, Calculator, Film, MessageSquare, Shield, HelpCircle as FaqIcon, 
  Bell, Utensils, Navigation, Info, Smartphone, Monitor, Newspaper 
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAdminContext } from "./AdminContext";
import type { Content, PromoBannerSlide } from "@/types";

interface Props { content: Content; siteConfig: any; onChange: (c: Content) => void }

function set<T>(obj: T, path: string, value: unknown): T {
  const c = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let o: any = c;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
    // Safety: ensure intermediate path exists
    if (o[k] === undefined) {
      const nextKeyIsNumber = !isNaN(Number(keys[i+1]));
      o[k] = nextKeyIsNumber ? [] : {};
    }
    o = o[k];
  }
  const last = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1]);
  o[last] = value;
  return c;
}

function FieldGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-100 mt-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        {title}
        <span className="h-px bg-slate-100 flex-1"></span>
      </p>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}


export function ContentSectionEditor({ content: rawContent, siteConfig, onChange }: Props) {
  const adminCtx = useAdminContext();
  const content: Content = {
    ...rawContent,
    credibility: {
      ...rawContent.credibility,
      stats: rawContent.credibility?.stats || [],
      partners: {
        title: rawContent.credibility?.partners?.title || "Representante autorizado de",
        logos: rawContent.credibility?.partners?.logos || [],
      }
    },
    about: {
      ...rawContent.about,
      metrics: rawContent.about?.metrics || [],
    },
    videos: {
      title: rawContent.videos?.title || "O especialista por trás da Sleiman",
      subtitle: rawContent.videos?.subtitle || "Farid compartilha sua experiência de 20 anos no mercado. Assista antes de decidir.",
      tag: rawContent.videos?.tag || "Aprenda com quem sabe",
      items: rawContent.videos?.items || [],
      clickAction: rawContent.videos?.clickAction || "youtube",
    },
    testimonials: {
      title: rawContent.testimonials?.title || "Depoimentos de quem já realizou",
      subtitle: rawContent.testimonials?.subtitle || "",
      tag: rawContent.testimonials?.tag || "Histórias de sucesso",
      items: rawContent.testimonials?.items || [],
    },
    security: {
      title: rawContent.security?.title || "Vantagens do—consórcio",
      subtitle: rawContent.security?.subtitle || "",
      tag: rawContent.security?.tag || "Por que escolher",
      points: rawContent.security?.points || [],
    },
    faq: {
      title: rawContent.faq?.title || "Perguntas—frequentes",
      subtitle: rawContent.faq?.subtitle || "",
      tag: rawContent.faq?.tag || "Tire suas dúvidas",
      items: rawContent.faq?.items || [],
    },
    finalCta: {
      title: rawContent.finalCta?.title || "Pronto para—começar?",
      tag: rawContent.finalCta?.tag || "Fale conosco",
      subtitle: rawContent.finalCta?.subtitle || "Tire suas dúvidas agora mesmo pelo WhatsApp",
      ctaWhatsapp: rawContent.finalCta?.ctaWhatsapp || "Conversar via WhatsApp",
      ctaForm: rawContent.finalCta?.ctaForm || "Enviar solicitação",
      privacyText: rawContent.finalCta?.privacyText || "Seus dados estão protegidos por criptografia.",
      objectives: rawContent.finalCta?.objectives || ["🏠 Imóveis", "🚗 Veículos", "🚜 Pesados", "💰 Crédito"],
      creditOptions: rawContent.finalCta?.creditOptions || ["Até R$ 100 mil", "R$ 100k - R$ 300k", "R$ 300k - R$ 500k", "Acima de R$ 500k"],
    },
    cardapio: {
      title: rawContent.cardapio?.title || "Nossos Produtos",
      subtitle: rawContent.cardapio?.subtitle || "",
      items: rawContent.cardapio?.items || [],
      ctaText: rawContent.cardapio?.ctaText || "Realize seu sonho",
    },
    news: {
      title: rawContent.news?.title || "Matérias e Notícias",
      subtitle: rawContent.news?.subtitle || "Acompanhe as principais novidades do mercado",
      items: rawContent.news?.items || [],
    },
  };
  const u = (path: string, value: unknown) => onChange(set(content, path, value));

  const renderSection = (key: string) => {
    switch (key) {
      case "hero":
        return (
          <CollapsibleSection key="hero" title="🏠 Tela Inicial (Hero)" description="Textos e imagens principais da primeira dobra do site" icon={<Layout className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Field label="Destaque superior" hint="Pequeno texto acima do título principal (ex: Consultoria de consórcio)" value={content.hero.eyebrow || ""} onChange={v => u("hero.eyebrow", v)} />
                <Field label="Título principal" hint="Use — (travessão) para colocar uma palavra em itálico e cor dourada" value={content.hero.headline} onChange={v => u("hero.headline", v)} />
                <TextareaField label="Subtítulo" hint="Texto explicativo abaixo do título" value={content.hero.subheadline} onChange={v => u("hero.subheadline", v)} />
              </div>
              <div className="space-y-4">
                <ImageUploadField folder="upload" label="Imagem principal" value={content.hero.image || ""} onChange={v => u("hero.image", v)} hint="Imagem de fundo da área principal" />
                <Field label="Texto de confiança" hint="Frase curta que aparece acima da imagem/vídeo" value={content.hero.trustText || ""} onChange={v => u("hero.trustText", v)} />
              </div>
            </div>
            <div className="h-px bg-slate-100 my-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField 
                label="Alinhamento Vertical" 
                value={content.hero.verticalAlign || "middle"} 
                onChange={v => u("hero.verticalAlign", v)}
                options={[
                  { label: "Topo", value: "top" },
                  { label: "Meio (Padrão)", value: "middle" },
                  { label: "Base", value: "bottom" },
                ]}
              />
              <Field label="Botão principal" value={content.hero.ctaPrimary.text} onChange={v => u("hero.ctaPrimary.text", v)} />
              <Field label="Botão secundário" value={content.hero.ctaSecondary.text} onChange={v => u("hero.ctaSecondary.text", v)} />
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-100 mt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                Selos de confiança
                <span className="h-px bg-slate-100 flex-1"></span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {content.hero.trustBadges.map((badge, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={badge} onChange={e => {
                      const items = [...content.hero.trustBadges];
                      items[i] = e.target.value;
                      u("hero.trustBadges", items);
                    }} className="text-sm h-9 flex-1" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-destructive" onClick={() => {
                      u("hero.trustBadges", content.hero.trustBadges.filter((_, j) => j !== i));
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => u("hero.trustBadges", [...content.hero.trustBadges, ""])} className="mt-3 w-full border-dashed border-slate-200 text-slate-500 h-9">
                <Plus className="w-3 h-3 mr-1" />Adicionar selo
              </Button>
            </div>
          </CollapsibleSection>
        );
      case "credibility":
        return (
          <CollapsibleSection key="credibility" title="📊 Números e Parceiros" description="Estatísticas e logos" icon={<Target className="w-4 h-4" />}>
            {content.credibility.stats.map((stat, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Estatística {i + 1}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                    const stats = content.credibility.stats.filter((_, j) => j !== i);
                    u("credibility.stats", stats);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Valor" value={stat.value} onChange={v => u(`credibility.stats.${i}.value`, v)} />
                  <Field label="Descrição" value={stat.label} onChange={v => u(`credibility.stats.${i}.label`, v)} />
                </div>
                <Field label="Ícone (Lucide)" value={stat.icon} onChange={v => u(`credibility.stats.${i}.icon`, v)} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("credibility.stats", [...content.credibility.stats, { icon: "Target", value: "0", label: "Novo número" }])}>
              <Plus className="w-3 h-3 mr-1" />Adicionar estatística
            </Button>
            <div className="flex items-center justify-between gap-4">
              <Field label="Título parceiros" value={content.credibility.partners.title} onChange={v => u("credibility.partners.title", v)} className="flex-1" />
              <div className="pt-6">
                <ImageUploadField 
                  label="" value="" onChange={() => {}} multiple 
                  onUploadMultiple={(paths) => {
                    const newLogos = paths.map(p => ({ name: "", image: p }));
                    u("credibility.partners.logos", [...content.credibility.partners.logos, ...newLogos]);
                  }}
                  folder="logos" hint="Upload em massa"
                />
              </div>
            </div>
            {content.credibility.partners.logos.map((logo, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Parceiro {i + 1}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                    const logos = content.credibility.partners.logos.filter((_, j) => j !== i);
                    u("credibility.partners.logos", logos);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <Field label="Nome" value={logo.name} onChange={v => u(`credibility.partners.logos.${i}.name`, v)} />
                <ImageUploadField folder="upload" label="Logo" value={logo.image} onChange={v => u(`credibility.partners.logos.${i}.image`, v)} previewHeight="h-[56px]" />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("credibility.partners.logos", [...content.credibility.partners.logos, { name: "", image: "" }])}>
              <Plus className="w-3 h-3 mr-1" />Adicionar parceiro
            </Button>
          </CollapsibleSection>
        );
      case "about":
        return (
          <CollapsibleSection key="about" title="👤 Sobre o Consultor" description="Informações pessoais" icon={<User className="w-4 h-4" />}>
            <Field label="Título" value={content.about.title} onChange={v => u("about.title", v)} />
            <Field label="Nome" value={content.about.founderName || ""} onChange={v => u("about.founderName", v)} />
            <Field label="Cargo" value={content.about.founderRole || ""} onChange={v => u("about.founderRole", v)} />
            <Field label="Selo/Badge (Opcional)" value={content.about.badge || ""} onChange={v => u("about.badge", v)} />
            <TextareaField label="Citação" value={content.about.quote || ""} onChange={v => u("about.quote", v)} rows={3} />
            <TextareaField label="Texto Principal" value={content.about.text} onChange={v => u("about.text", v)} rows={5} />
            <ImageUploadField folder="upload" label="Foto" value={content.about.image} onChange={v => u("about.image", v)} />
            
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Métricas de Destaque</p>
              {content.about.metrics.map((metric, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">Métrica {i + 1}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                      const metrics = content.about.metrics.filter((_, j) => j !== i);
                      u("about.metrics", metrics);
                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Valor" value={metric.value} onChange={v => u(`about.metrics.${i}.value`, v)} />
                    <Field label="Descrição" value={metric.label} onChange={v => u(`about.metrics.${i}.label`, v)} />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => u("about.metrics", [...content.about.metrics, { value: "0", label: "Nova métrica" }])}>
                <Plus className="w-3 h-3 mr-1" />Adicionar métrica
              </Button>
            </div>
          </CollapsibleSection>
        );
      case "howItWorks":
        return (
          <CollapsibleSection key="howItWorks" title="🔄 Como Funciona" description="Passo a passo" icon={<Repeat className="w-4 h-4" />}>
            <Field label="Título" value={content.howItWorks.title} onChange={v => u("howItWorks.title", v)} />
            <Field label="Subtítulo (Destaque)" value={content.howItWorks.subtitle || ""} onChange={v => u("howItWorks.subtitle", v)} />
            {content.howItWorks.steps.map((step, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Passo {step.number || i + 1}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                    const steps = content.howItWorks.steps.filter((_, j) => j !== i);
                    u("howItWorks.steps", steps);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <Field label="Nº" value={step.number} onChange={v => u(`howItWorks.steps.${i}.number`, v)} />
                  </div>
                  <div className="col-span-3">
                    <Field label="Título" value={step.title} onChange={v => u(`howItWorks.steps.${i}.title`, v)} />
                  </div>
                </div>
                <TextareaField label="Descrição" value={step.description} onChange={v => u(`howItWorks.steps.${i}.description`, v)} rows={2} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("howItWorks.steps", [...content.howItWorks.steps, { number: String(content.howItWorks.steps.length + 1), title: "", description: "", icon: "" }])}>
              <Plus className="w-3 h-3 mr-1" />Adicionar passo
            </Button>
          </CollapsibleSection>
        );
      case "objectives":
        return (
          <CollapsibleSection key="objectives" title="🎯 Objetivos" description="Cards de soluções" icon={<Target className="w-4 h-4" />}>
            <Field label="Título" value={content.objectives.title} onChange={v => u("objectives.title", v)} />
            <Field label="Subtítulo" value={content.objectives.subtitle || ""} onChange={v => u("objectives.subtitle", v)} />
            {content.objectives.cards.map((card, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Objetivo {i + 1}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                    const cards = content.objectives.cards.filter((_, j) => j !== i);
                    u("objectives.cards", cards);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <Field label="Título" value={card.title} onChange={v => u(`objectives.cards.${i}.title`, v)} />
                <TextareaField label="Descrição" value={card.description} onChange={v => u(`objectives.cards.${i}.description`, v)} rows={2} />
                <Field label="Texto Botão" value={card.cta || ""} onChange={v => u(`objectives.cards.${i}.cta`, v)} />
                <Field label="Ícone/Emoji" value={card.icon || ""} onChange={v => u(`objectives.cards.${i}.icon`, v)} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("objectives.cards", [...content.objectives.cards, { title: "", description: "", cta: "Ver detalhes", icon: "🏠" }])}>
              <Plus className="w-3 h-3 mr-1" />Adicionar objetivo
            </Button>
          </CollapsibleSection>
        );
      case "comparison":
        return (
          <CollapsibleSection key="comparison" title="⚖️ Comparativo" description="Tabela" icon={<Scale className="w-4 h-4" />}>
            <Field label="Título" value={content.comparison.title} onChange={v => u("comparison.title", v)} />
            <Field label="Subtítulo" value={content.comparison.subtitle || ""} onChange={v => u("comparison.subtitle", v)} />
            <Field label="Destaque superior" value={content.comparison.tag || ""} onChange={v => u("comparison.tag", v)} />
            
            <div className="grid grid-cols-3 gap-2">
              <Field label="Cabeçalho 1" value={content.comparison.headers[0] || ""} onChange={v => {
                const h = [...content.comparison.headers]; h[0] = v; u("comparison.headers", h);
              }} />
              <Field label="Cabeçalho 2" value={content.comparison.headers[1] || ""} onChange={v => {
                const h = [...content.comparison.headers]; h[1] = v; u("comparison.headers", h);
              }} />
              <Field label="Cabeçalho 3" value={content.comparison.headers[2] || ""} onChange={v => {
                const h = [...content.comparison.headers]; h[2] = v; u("comparison.headers", h);
              }} />
            </div>

            {content.comparison.rows.map((row, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Linha {i + 1}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                    const rows = content.comparison.rows.filter((_, j) => j !== i);
                    u("comparison.rows", rows);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Característica" value={row.feature} onChange={v => u(`comparison.rows.${i}.feature`, v)} />
                  <Field label="Consórcio" value={row.consortium} onChange={v => u(`comparison.rows.${i}.consortium`, v)} />
                  <Field label="Financiamento" value={row.financing} onChange={v => u(`comparison.rows.${i}.financing`, v)} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("comparison.rows", [...content.comparison.rows, { feature: "", consortium: "", financing: "" }])} className="mt-2">
              <Plus className="w-3 h-3 mr-1" />Adicionar linha
            </Button>
            
            <div className="mt-4 space-y-3 border-t pt-4">
              <Field label="Texto Economia" value={content.comparison.savingsText || ""} onChange={v => u("comparison.savingsText", v)} />
              <Field label="Texto Botão" value={content.comparison.ctaText || ""} onChange={v => u("comparison.ctaText", v)} />
              <TextareaField label="Nota de rodapé" value={content.comparison.disclaimer || ""} onChange={v => u("comparison.disclaimer", v)} rows={2} />
            </div>
          </CollapsibleSection>
        );
      case "simulator":
        return (
          <CollapsibleSection key="simulator" title="🧮 Simulador e Formulários" description="Cálculos, taxas e campos de contato" icon={<Calculator className="w-4 h-4" />}>
             <FieldGroup title="Configuração dos Formulários">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <CheckboxField label="Exibir campo CPF" value={siteConfig.formFields?.showCPF !== false} onChange={v => {
                   const c = JSON.parse(JSON.stringify(siteConfig));
                   if (!c.formFields) c.formFields = {};
                   c.formFields.showCPF = v;
                   onChange({ ...content }); // Force state update
                   adminCtx.updateSiteConfig(c);
                 }} />
                 <CheckboxField label="Exibir campo Nascimento" value={siteConfig.formFields?.showBirthDate !== false} onChange={v => {
                   const c = JSON.parse(JSON.stringify(siteConfig));
                   if (!c.formFields) c.formFields = {};
                   c.formFields.showBirthDate = v;
                   onChange({ ...content }); // Force state update
                   adminCtx.updateSiteConfig(c);
                 }} />
                 <CheckboxField label="Exibir campo Renda" value={siteConfig.formFields?.showIncome !== false} onChange={v => {
                   const c = JSON.parse(JSON.stringify(siteConfig));
                   if (!c.formFields) c.formFields = {};
                   c.formFields.showIncome = v;
                   onChange({ ...content }); // Force state update
                   adminCtx.updateSiteConfig(c);
                 }} />
                 <CheckboxField label="Exibir pergunta 'Conhece consórcio?'" value={siteConfig.formFields?.showKnowsConsortium === true} onChange={v => {
                   const c = JSON.parse(JSON.stringify(siteConfig));
                   if (!c.formFields) c.formFields = {};
                   c.formFields.showKnowsConsortium = v;
                   onChange({ ...content }); // Force state update
                   adminCtx.updateSiteConfig(c);
                 }} />
               </div>
               <p className="text-[10px] text-muted-foreground mt-2 italic">* Estas configurações afetam todos os formulários da landing page.</p>
             </FieldGroup>

             <Field label="Destaque superior (Tag)" hint="Texto pequeno acima do título (ex: Simulação Personalizada)" value={content.simulator.tag || ""} onChange={v => u("simulator.tag", v)} />
             <Field label="Título" hint="Título principal da seção de simulação" value={content.simulator.title} onChange={v => u("simulator.title", v)} />

             <TextareaField label="Subtítulo" value={content.simulator.subtitle} onChange={v => u("simulator.subtitle", v)} />
             
             <div className="space-y-4 pt-2 mb-6 border-t mt-4">
               <p className="text-[10px] font-bold text-midnight/50 uppercase tracking-widest flex items-center gap-2 pt-2">
                 Destaques do Simulador (Ícones)
                 <span className="h-px bg-border flex-1"></span>
               </p>
               {(content.simulator.features || [
                 { title: "Sem Juros", desc: "Economize até 10x mais que um financiamento comum." },
                 { title: "Flexibilidade", desc: "Prazos e parcelas que cabem no seu orçamento." },
                 { title: "Consultoria", desc: "Suporte especializado do início até a contemplação." }
               ]).map((feat, i) => (
                 <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 relative group">
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                     const currentFeatures = content.simulator.features || [
                       { title: "Sem Juros", desc: "Economize até 10x mais que um financiamento comum." },
                       { title: "Flexibilidade", desc: "Prazos e parcelas que cabem no seu orçamento." },
                       { title: "Consultoria", desc: "Suporte especializado do início até a contemplação." }
                     ];
                     const features = currentFeatures.filter((_, j) => j !== i);
                     u("simulator.features", features);
                   }}><Trash2 className="w-3.5 h-3.5" /></Button>
                   <Field label="Título" value={feat.title} onChange={v => u(`simulator.features.${i}.title`, v)} />
                   <TextareaField label="Descrição" value={feat.desc} onChange={v => u(`simulator.features.${i}.desc`, v)} rows={2} />
                 </div>
               ))}
               <Button variant="outline" size="sm" onClick={() => {
                 const currentFeatures = content.simulator.features || [
                   { title: "Sem Juros", desc: "Economize até 10x mais que um financiamento comum." },
                   { title: "Flexibilidade", desc: "Prazos e parcelas que cabem no seu orçamento." },
                   { title: "Consultoria", desc: "Suporte especializado do início até a contemplação." }
                 ];
                 u("simulator.features", [...currentFeatures, { title: "Novo Destaque", desc: "" }]);
               }} className="w-full border-dashed">
                 <Plus className="w-3 h-3 mr-1" />Adicionar destaque
               </Button>
             </div>

             <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <NumberField label="Imóvel: Crédito mín." hint="Valor mínimo permitido na simulação de imóvel" value={content.simulator.calc.creditMin} onChange={v => u("simulator.calc.creditMin", v)} step={10000} isCurrency />
              <NumberField label="Imóvel: Crédito máx." hint="Valor máximo permitido na simulação de imóvel" value={content.simulator.calc.creditMax} onChange={v => u("simulator.calc.creditMax", v)} step={10000} isCurrency />
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mt-3">
              <NumberField label="Auto: Crédito mín." hint="Valor mínimo permitido na simulação de automóveis" value={content.simulator.calc.vehicleMinCredit} onChange={v => u("simulator.calc.vehicleMinCredit", v)} step={5000} isCurrency />
              <NumberField label="Auto: Crédito máx." hint="Valor máximo permitido na simulação de automóveis" value={content.simulator.calc.vehicleMaxCredit} onChange={v => u("simulator.calc.vehicleMaxCredit", v)} step={5000} isCurrency />
            </div>
            <div className="mt-3">
              <Field 
                label="Título do Simulador" 
                value={content.simulator.calc.title || "Simule seu consórcio"} 
                onChange={v => u("simulator.calc.title", v)} 
              />
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mt-3">
              <NumberField label="Imóvel: Taxa Adm total (%)" hint="Taxa administrativa total aplicada no cálculo das parcelas de IMÓVEL" value={content.simulator.calc.adminRate} onChange={v => u("simulator.calc.adminRate", v)} step={0.1} />
              <NumberField label="Auto: Taxa Adm total (%)" hint="Taxa administrativa total aplicada no cálculo das parcelas de AUTOMÓVEL" value={content.simulator.calc.vehicleAdminRate || 15} onChange={v => u("simulator.calc.vehicleAdminRate", v)} step={0.1} />
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mt-3">
              <NumberField label="Imóvel: Fator Redução" hint="Multiplicador para parcelas reduzidas de IMÓVEL (ex: 0.7 para 70%)" value={content.simulator.calc.reductionFactor} onChange={v => u("simulator.calc.reductionFactor", v)} step={0.05} />
              <NumberField label="Auto: Fator Redução" hint="Multiplicador para parcelas reduzidas de AUTOMÓVEL (ex: 0.7 para 70%)" value={content.simulator.calc.vehicleReductionFactor || 0} onChange={v => u("simulator.calc.vehicleReductionFactor", v)} step={0.05} />
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mt-3">
              <NumberField label="Passo Imóvel" hint="O incremento de valor ao mover o slider de imóvel (ex: de 10 em 10 mil)" value={content.simulator.calc.creditStep} onChange={v => u("simulator.calc.creditStep", v)} step={1000} isCurrency />
              <NumberField label="Passo Auto" hint="O incremento de valor ao mover o slider de automóvel" value={content.simulator.calc.vehicleCreditStep} onChange={v => u("simulator.calc.vehicleCreditStep", v)} step={1000} isCurrency />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mt-3">
              <Field 
                label="Rótulo Parcela" 
                hint="Texto acima do valor da parcela (ex: Parcela reduzida*)" 
                value={content.simulator.calc.installmentLabel || "Parcela reduzida*"} 
                onChange={v => u("simulator.calc.installmentLabel", v)} 
              />
              <Field 
                label="Rótulo Sem Juros" 
                hint="Texto abaixo da taxa adm (ex: sem juros)" 
                value={content.simulator.calc.interestFreeLabel || "sem juros"} 
                onChange={v => u("simulator.calc.interestFreeLabel", v)} 
              />
            </div>

            <div className="mt-3 p-3 bg-gold-pale/30 rounded-lg border border-gold/10">
              <CheckboxField 
                label="Exibir taxa administrativa na landing page" 
                hint="Se desativado, a taxa adm./mês não será mostrada no simulador para o usuário" 
                value={content.simulator.calc.showAdminRate !== false} 
                onChange={v => u("simulator.calc.showAdminRate", v)} 
              />
            </div>

            <div className="mt-3">
              <TextareaField 
                label="Texto de Observação (Disclaimer)" 
                hint="Texto pequeno que aparece no rodapé do simulador" 
                value={content.simulator.calc.disclaimerText || "*Os valores das parcelas são apenas para consulta. O valor real e as condições devem ser confirmados com o consultor."} 
                onChange={v => u("simulator.calc.disclaimerText", v)} 
                rows={2}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-3">
                <p className="text-xs font-bold text-midnight/50 uppercase tracking-widest flex items-center gap-2">
                  Prazos: Imóvel
                  <span className="h-px bg-border flex-1"></span>
                </p>
                {(content.simulator.calc.prazoOptions || []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input type="number" placeholder="Meses" value={opt.value} onChange={e => u(`simulator.calc.prazoOptions.${i}.value`, Number(e.target.value))} className="w-20 h-8 text-xs" />
                    <Input placeholder="Rótulo" value={opt.label} onChange={e => u(`simulator.calc.prazoOptions.${i}.label`, e.target.value)} className="flex-1 h-8 text-xs" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                      const opts = content.simulator.calc.prazoOptions.filter((_, j) => j !== i);
                      u("simulator.calc.prazoOptions", opts);
                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => u("simulator.calc.prazoOptions", [...(content.simulator.calc.prazoOptions || []), { value: 120, label: "120 meses" }])} className="w-full text-[10px] h-7">
                  <Plus className="w-3 h-3 mr-1" />Adicionar prazo Imóvel
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-midnight/50 uppercase tracking-widest flex items-center gap-2">
                  Prazos: Automóvel
                  <span className="h-px bg-border flex-1"></span>
                </p>
                {(content.simulator.calc.vehiclePrazoOptions || []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input type="number" placeholder="Meses" value={opt.value} onChange={e => u(`simulator.calc.vehiclePrazoOptions.${i}.value`, Number(e.target.value))} className="w-20 h-8 text-xs" />
                    <Input placeholder="Rótulo" value={opt.label} onChange={e => u(`simulator.calc.vehiclePrazoOptions.${i}.label`, e.target.value)} className="flex-1 h-8 text-xs" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                      const opts = content.simulator.calc.vehiclePrazoOptions.filter((_, j) => j !== i);
                      u("simulator.calc.vehiclePrazoOptions", opts);
                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => u("simulator.calc.vehiclePrazoOptions", [...(content.simulator.calc.vehiclePrazoOptions || []), { value: 60, label: "60 meses" }])} className="w-full text-[10px] h-7">
                  <Plus className="w-3 h-3 mr-1" />Adicionar prazo Auto
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-bold text-midnight/50 uppercase tracking-widest">Informação Importante</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O simulador utiliza as <strong>Taxas Administrativas</strong> e <strong>Fatores de Redução</strong> configurados acima para calcular as parcelas dinamicamente. A tabela de planos abaixo não afeta os cálculos do simulador, servindo apenas como referência histórica ou consulta para o administrador.
              </p>
            </div>

            <CollapsibleSection title="📋 Tabela de Planos (Apenas Referência)" description="Valores históricos para consulta do administrador" icon={<Utensils className="w-4 h-4" />} defaultOpen={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 px-2">Crédito</th><th className="text-left py-2 px-2">Parcela</th><th className="w-10"></th></tr></thead>
                  <tbody>
                    {(content.simulator.calc.plans || []).map((plan, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td><NumberField label="" value={plan.creditValue} onChange={v => u(`simulator.calc.plans.${i}.creditValue`, v)} isCurrency /></td>
                        <td><NumberField label="" value={plan.installment} onChange={v => u(`simulator.calc.plans.${i}.installment`, v)} isCurrency /></td>
                        <td className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                            const plans = content.simulator.calc.plans.filter((_, j) => j !== i);
                            u("simulator.calc.plans", plans);
                          }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" onClick={() => u("simulator.calc.plans", [...(content.simulator.calc.plans || []), { creditValue: 100000, installment: 0, interestRate: 0 }])} className="mt-3 w-full border-dashed">
                <Plus className="w-3 h-3 mr-1" />Adicionar plano de referência
              </Button>
            </CollapsibleSection>
          </CollapsibleSection>
        );
      case "videos":
        return (
          <CollapsibleSection key="videos" title="🎬 Vídeos" description="YouTube" icon={<Film className="w-4 h-4" />}>
            <SelectField 
              label="Ação ao clicar no vídeo" 
              value={content.videos.clickAction || "youtube"} 
              onChange={v => u("videos.clickAction", v)}
              options={[
                { label: "Abrir no YouTube (Nova aba)", value: "youtube" },
                { label: "Abrir no site (Modal)", value: "modal" },
              ]}
              hint="Escolha se o vídeo deve abrir diretamente no YouTube ou em uma janela sobreposta no próprio site."
            />
            <Field label="Tag superior" value={content.videos.tag} onChange={v => u("videos.tag", v)} />
            <Field label="Título" value={content.videos.title} onChange={v => u("videos.title", v)} />
            <TextareaField label="Subtítulo" value={content.videos.subtitle} onChange={v => u("videos.subtitle", v)} rows={2} />
            {content.videos.items.map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-white shadow-sm space-y-3 relative group">
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-0.5 mr-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-400 hover:text-gold" 
                      disabled={i === 0}
                      onClick={() => {
                        const items = [...content.videos.items];
                        [items[i-1], items[i]] = [items[i], items[i-1]];
                        u("videos.items", items);
                      }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-400 hover:text-gold" 
                      disabled={i === content.videos.items.length - 1}
                      onClick={() => {
                        const items = [...content.videos.items];
                        [items[i+1], items[i]] = [items[i], items[i+1]];
                        u("videos.items", items);
                      }}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {
                    const items = content.videos.items.filter((_, j) => j !== i);
                    u("videos.items", items);
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Field label="Título" value={item.title} onChange={v => u(`videos.items.${i}.title`, v)} />
                    <Field label="Tag do vídeo" value={item.tag} onChange={v => u(`videos.items.${i}.tag`, v)} />
                    <Field label="URL do YouTube" value={item.url} onChange={v => u(`videos.items.${i}.url`, v)} />
                  </div>
                  <div className="space-y-3">
                    <ImageUploadField 
                      folder="upload" 
                      label="Capa do Vídeo (Opcional)" 
                      value={item.thumbnail || ""} 
                      onChange={v => u(`videos.items.${i}.thumbnail`, v)} 
                      hint="Recomendado: 1280x720px (Proporção 16:9). Se vazio, usará a miniatura do YouTube."
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("videos.items", [...content.videos.items, { title: "", tag: "Depoimento", url: "", thumbnail: "", description: "" }])} className="w-full border-dashed py-6"><Plus className="w-4 h-4 mr-2" />Adicionar novo vídeo</Button>
          </CollapsibleSection>
        );
      case "testimonials":
        return (
          <CollapsibleSection key="testimonials" title="💬 Depoimentos" description="Avaliações" icon={<MessageSquare className="w-4 h-4" />}>
            <Field label="Tag superior" value={content.testimonials.tag} onChange={v => u("testimonials.tag", v)} />
            <Field label="Título" value={content.testimonials.title} onChange={v => u("testimonials.title", v)} />
            {content.testimonials.items.map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => {
                  const items = content.testimonials.items.filter((_, j) => j !== i);
                  u("testimonials.items", items);
                }}><Trash2 className="w-3.5 h-3.5" /></Button>
                <Field label="Nome" value={item.name} onChange={v => u(`testimonials.items.${i}.name`, v)} />
                <Field label="Cidade ou Cargo" value={item.city || item.role} onChange={v => u(`testimonials.items.${i}.city`, v)} />
                <TextareaField label="Texto" value={item.text} onChange={v => u(`testimonials.items.${i}.text`, v)} rows={2} />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField label="Estrelas (1-5)" value={item.rating} onChange={v => u(`testimonials.items.${i}.rating`, v)} />
                  <ImageUploadField folder="testimonials" label="Foto (Opcional)" value={item.image} onChange={v => u(`testimonials.items.${i}.image`, v)} previewHeight="h-12" />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("testimonials.items", [...content.testimonials.items, { name: "", role: "Cliente", text: "", rating: 5, image: "", city: "" }])}><Plus className="w-3 h-3 mr-1" />Adicionar depoimento</Button>
          </CollapsibleSection>
        );
      case "security":
        return (
          <CollapsibleSection key="security" title="🔒 Segurança" description="Confiança" icon={<Shield className="w-4 h-4" />}>
            <Field label="Tag superior" value={content.security.tag} onChange={v => u("security.tag", v)} />
            <Field label="Título (use — para itálico)" value={content.security.title} onChange={v => u("security.title", v)} />
            {content.security.points.map((point, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => {
                  const points = content.security.points.filter((_, j) => j !== i);
                  u("security.points", points);
                }}><Trash2 className="w-3.5 h-3.5" /></Button>
                <Field label="Título" value={point.title} onChange={v => u(`security.points.${i}.title`, v)} />
                <TextareaField label="Descrição" value={point.description} onChange={v => u(`security.points.${i}.description`, v)} rows={2} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("security.points", [...content.security.points, { title: "Nova vantagem", description: "", icon: "" }])}><Plus className="w-3 h-3 mr-1" />Adicionar vantagem</Button>
          </CollapsibleSection>
        );
      case "faq":
        return (
          <CollapsibleSection key="faq" title="❓ FAQ" description="Perguntas" icon={<FaqIcon className="w-4 h-4" />}>
            <Field label="Tag superior" value={content.faq.tag} onChange={v => u("faq.tag", v)} />
            <Field label="Título (use — para itálico)" value={content.faq.title} onChange={v => u("faq.title", v)} />
            {content.faq.items.map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => {
                  const items = content.faq.items.filter((_, j) => j !== i);
                  u("faq.items", items);
                }}><Trash2 className="w-3.5 h-3.5" /></Button>
                <Field label="Pergunta" value={item.question} onChange={v => u(`faq.items.${i}.question`, v)} />
                <TextareaField label="Resposta" value={item.answer} onChange={v => u(`faq.items.${i}.answer`, v)} rows={2} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("faq.items", [...content.faq.items, { question: "", answer: "" }])}><Plus className="w-3 h-3 mr-1" />Adicionar pergunta</Button>
          </CollapsibleSection>
        );
      case "promoBanner":
        return (
          <CollapsibleSection key="promoBanner" title="📢 Banner Promocional (Carrossel)" description="Gerencie slides com imagens ou vídeos MP4" icon={<Bell className="w-4 h-4" />}>
            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary uppercase tracking-wider">Status do Banner</p>
                <p className="text-xs text-muted-foreground">Ative ou desative a exibição do banner no site</p>
              </div>
              <CheckboxField 
                label={siteConfig.sections?.promoBanner ? "Ativado" : "Desativado"} 
                value={!!siteConfig.sections?.promoBanner} 
                onChange={v => {
                  const newSections = { ...siteConfig.sections, promoBanner: v };
                  if (adminCtx?.updateSiteConfig) {
                    adminCtx.updateSiteConfig({ ...siteConfig, sections: newSections });
                  } else {
                    toast.info("Ajuste a visibilidade na aba 'Configurações do Site'");
                  }
                }}
              />
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Orientações de Formato</p>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
                    <li><strong>Desktop:</strong> Imagem/Vídeo horizontal em 1920x800.</li>
                    <li><strong>Mobile:</strong> Imagem/Vídeo vertical (ex: 1080x1350) melhora a visualização em celulares.</li>
                    <li><strong>Vídeos:</strong> Use formato MP4 (H.264). Evite arquivos muito pesados.</li>
                    <li><strong>Dica:</strong> Para vídeos de fundo, prefira arquivos sem áudio.</li>
                  </ul>
                </div>
              </div>
            </div>

            <Field label="Título da Seção (Opcional)" value={content.promoBanner?.title || ""} onChange={v => u("promoBanner.title", v)} />
            
            <div className="mt-4 p-5 bg-accent/5 rounded-xl border border-accent/10 space-y-4">
              <div className="flex items-center justify-between border-b border-accent/10 pb-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5" /> Contador Regressivo
                  </p>
                  <p className="text-[10px] text-muted-foreground">Exibir cronômetro de urgência para ofertas</p>
                </div>
                <Switch 
                  checked={!!content.promoBanner?.showCountdown} 
                  onCheckedChange={v => u("promoBanner.showCountdown", v)} 
                />
              </div>

              {!!content.promoBanner?.showCountdown && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <DateTimeField 
                    label="Data e Hora Final" 
                    hint="Quando a oferta termina" 
                    value={content.promoBanner?.countdownDate || ""} 
                    onChange={v => u("promoBanner.countdownDate", v)} 
                  />
                  <Field 
                    label="Texto de Chamada" 
                    hint="Ex: A oferta termina em:" 
                    value={content.promoBanner?.countdownText || ""} 
                    onChange={v => u("promoBanner.countdownText", v)} 
                  />
                </div>
              )}
            </div>

            <div className="mt-4 p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5" /> Botão de Ação (CTA)
                  </p>
                  <p className="text-[10px] text-muted-foreground">Link principal do banner promocional</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Texto do Botão" value={content.promoBanner?.ctaText || ""} onChange={v => u("promoBanner.ctaText", v)} />
                <Field label="Link do Botão" value={content.promoBanner?.ctaHref || ""} onChange={v => u("promoBanner.ctaHref", v)} />
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <p className="text-[10px] font-bold text-midnight/50 uppercase tracking-widest flex items-center gap-2">
                Slides do Carrossel (Máx. 3)
                <span className="h-px bg-border flex-1"></span>
              </p>
              
              {(content.promoBanner?.slides || []).map((slide, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-4 relative group shadow-sm">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10" 
                    onClick={() => {
                      const slides = content.promoBanner.slides.filter((_, j) => j !== i);
                      u("promoBanner.slides", slides);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                    <SelectField 
                      label="Tipo de Mídia" 
                      value={slide.type || "image"} 
                      onChange={v => u(`promoBanner.slides.${i}.type`, v)}
                      options={[
                        { label: "Imagem", value: "image" },
                        { label: "Vídeo", value: "video" }
                      ]}
                    />
                    <Field label="Texto Alternativo (SEO)" value={slide.alt || ""} onChange={v => u(`promoBanner.slides.${i}.alt`, v)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploadField 
                      label="Mídia Desktop (Principal)" 
                      value={slide.src || slide.image || ""} 
                      onChange={v => u(`promoBanner.slides.${i}.src`, v)}
                      folder="banners"
                      hint={slide.type === 'video' ? "Para vídeos, use uma URL pública ou faça o upload direto." : ""}
                    />
                    <ImageUploadField 
                      label="Mídia Mobile (Opcional)" 
                      value={slide.mobileSrc || ""} 
                      onChange={v => u(`promoBanner.slides.${i}.mobileSrc`, v)}
                      folder="banners"
                      hint="Se deixado vazio, usará a mídia de desktop."
                    />
                  </div>

                  {slide.type === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                      <ImageUploadField 
                        label="Capa/Poster do Vídeo" 
                        value={slide.poster || ""} 
                        onChange={v => u(`promoBanner.slides.${i}.poster`, v)}
                        folder="banners"
                        hint="Imagem exibida enquanto o vídeo carrega."
                      />
                      <Field 
                        label="Link WebM (Opcional)" 
                        value={slide.webmSrc || ""} 
                        onChange={v => u(`promoBanner.slides.${i}.webmSrc`, v)} 
                        hint="Formato WebM é mais leve para alguns navegadores."
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {(content.promoBanner?.slides || []).length < 3 && (
                <Button 
                  variant="outline" 
                  className="w-full border-dashed h-12 text-primary hover:bg-primary/5 hover:border-primary/50" 
                  onClick={() => u("promoBanner.slides", [...(content.promoBanner?.slides || []), { type: "image", src: "", alt: "" }])}
                >
                  <Plus className="w-4 h-4 mr-2" />Adicionar Novo Slide
                </Button>
              )}
            </div>
          </CollapsibleSection>
        );
      case "cardapio":
        return (
          <CollapsibleSection key="cardapio" title="🍽️ Cardápio" description="Simulações" icon={<Utensils className="w-4 h-4" />}>
            <Field label="Título" value={content.cardapio?.title || ""} onChange={v => u("cardapio.title", v)} />
            <Field label="Subtítulo" value={content.cardapio?.subtitle || ""} onChange={v => u("cardapio.subtitle", v)} />
            {(content.cardapio?.items || []).map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Produto {i + 1}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                    const items = content.cardapio.items.filter((_, j) => j !== i);
                    u("cardapio.items", items);
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
                <Field label="Título" value={item.title} onChange={v => u(`cardapio.items.${i}.title`, v)} />
                <NumberField label="Valor da Carta" value={Number(item.totalValue) || 0} onChange={v => u(`cardapio.items.${i}.totalValue`, v)} isCurrency />
                <NumberField label="Parcela" value={Number(item.installmentText) || 0} onChange={v => u(`cardapio.items.${i}.installmentText`, v)} isCurrency />
                <ImageUploadField folder="upload" label="Imagem" value={item.image} onChange={v => u(`cardapio.items.${i}.image`, v)} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("cardapio.items", [...(content.cardapio?.items || []), { image: "", title: "", installmentText: "", totalValue: "" }])}>
              <Plus className="w-3 h-3 mr-1" />Adicionar produto
            </Button>
            <div className="mt-4 border-t pt-4">
              <Field label="Texto Botão" value={content.cardapio?.ctaText || ""} onChange={v => u("cardapio.ctaText", v)} />
            </div>
          </CollapsibleSection>
        );
      case "finalCta":
        return (
          <CollapsibleSection key="finalCta" title="📣 Chamada Final" description="Formulário e WhatsApp" icon={<Bell className="w-4 h-4" />}>
            <Field label="Tag superior" value={content.finalCta.tag} onChange={v => u("finalCta.tag", v)} />
            <Field label="Título (use — para itálico)" value={content.finalCta.title} onChange={v => u("finalCta.title", v)} />
            <TextareaField label="Subtítulo" value={content.finalCta.subtitle} onChange={v => u("finalCta.subtitle", v)} rows={2} />
            <Field label="Texto Botão WhatsApp" value={content.finalCta.ctaWhatsapp} onChange={v => u("finalCta.ctaWhatsapp", v)} />
            <Field label="Texto Privacidade" value={content.finalCta.privacyText} onChange={v => u("finalCta.privacyText", v)} />
            
            <SelectField 
              label="Alinhamento Vertical" 
              value={content.finalCta.verticalAlign || "middle"} 
              onChange={v => u("finalCta.verticalAlign", v)}
              options={[
                { label: "Topo", value: "top" },
                { label: "Meio (Padrão)", value: "middle" },
                { label: "Base", value: "bottom" },
              ]}
            />
            
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opções de Crédito (Formulário)</p>
              {content.finalCta.creditOptions.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <Input value={opt} onChange={e => {
                    const items = [...content.finalCta.creditOptions];
                    items[i] = e.target.value;
                    u("finalCta.creditOptions", items);
                  }} className="text-sm flex-1" />
                  <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                    u("finalCta.creditOptions", content.finalCta.creditOptions.filter((_, j) => j !== i));
                  }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => u("finalCta.creditOptions", [...content.finalCta.creditOptions, ""])}>
                <Plus className="w-3 h-3 mr-1" />Adicionar opção
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Objetivos (Cards do formulário)</p>
              {content.finalCta.objectives.map((obj, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <Input value={obj} onChange={e => {
                    const items = [...content.finalCta.objectives];
                    items[i] = e.target.value;
                    u("finalCta.objectives", items);
                  }} className="text-sm flex-1" />
                  <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                    u("finalCta.objectives", content.finalCta.objectives.filter((_, j) => j !== i));
                  }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => u("finalCta.objectives", [...content.finalCta.objectives, "🏠 Novo"]) }>
                <Plus className="w-3 h-3 mr-1" />Adicionar objetivo
              </Button>
            </div>
          </CollapsibleSection>
        );
      case "news":
        return (
          <CollapsibleSection key="news" title="📰 Matérias e Notícias" description="Links para matérias de imprensa" icon={<Newspaper className="w-4 h-4" />}>
            <Field label="Título" value={content.news.title} onChange={v => u("news.title", v)} />
            <Field label="Subtítulo" value={content.news.subtitle || ""} onChange={v => u("news.subtitle", v)} />
            {content.news.items.map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 relative group mb-3">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => {
                  const items = content.news.items.filter((_, j) => j !== i);
                  u("news.items", items);
                }}><Trash2 className="w-3.5 h-3.5" /></Button>
                <Field label="Título da Matéria" value={item.title} onChange={v => u(`news.items.${i}.title`, v)} />
                <Field label="Link (URL)" value={item.url} onChange={v => u(`news.items.${i}.url`, v)} />
                <Field label="Tag (ex: Imprensa)" value={item.tag || ""} onChange={v => u(`news.items.${i}.tag`, v)} />
                <ImageUploadField folder="upload" label="Capa da Matéria" value={item.image} onChange={v => u(`news.items.${i}.image`, v)} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => u("news.items", [...content.news.items, { title: "", image: "", url: "", tag: "" }])}>
              <Plus className="w-3 h-3 mr-1" />Adicionar matéria
            </Button>
          </CollapsibleSection>
        );
      default:
        return null;
    }
  };

  const renderOrderedSections = () => {
    const order = siteConfig.sectionOrder || siteConfig.section_order || [];
    return order.map((key: string) => renderSection(key));
  };

  return (
    <div className="space-y-6">
      {renderOrderedSections()}
      
      {/* NAV */}
      <CollapsibleSection title="🧭 Menu de Navegação" description="Itens do menu superior do site" icon={<Navigation className="w-4 h-4" />}>
        {content.nav.map((item, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2 relative mb-2">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => {
              u("nav", content.nav.filter((_, j) => j !== i));
            }}><Trash2 className="w-3.5 h-3.5" /></Button>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              <Field label={`Item ${i + 1} - Nome`} value={item.label} onChange={v => u(`nav.${i}.label`, v)} />
              <Field label="Link (ex: #simulacao)" value={item.href} onChange={v => u(`nav.${i}.href`, v)} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => u("nav", [...content.nav, { label: "Novo Link", href: "#" }])} className="mt-2">
          <Plus className="w-3 h-3 mr-1" />Adicionar link no menu
        </Button>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({ title, description, icon, children, defaultOpen = false }: { title: string; description?: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
        {icon && <div className="text-primary shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-heading text-sm sm:text-base font-medium truncate">{title}</p>
          {description && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
        </div>
      </button>
      {open && (
        <div className="px-3 sm:px-4 pb-4 space-y-3 border-t border-border/50">
          <div className="pt-3 space-y-3 overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function ListEditor({ label, items, onUpdate }: { label: string; items: string[]; onUpdate: (items: string[]) => void }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-1.5">
          <Input value={item} onChange={e => {
            const newItems = [...items];
            newItems[i] = e.target.value;
            onUpdate(newItems);
          }} className="text-sm flex-1" />
          <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
            onUpdate(items.filter((_, j) => j !== i));
          }}><Trash2 className="w-3 h-3" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onUpdate([...items, ""])} className="mt-1">
        <Plus className="w-3 h-3 mr-1" />Adicionar
      </Button>
    </div>
  );
}
