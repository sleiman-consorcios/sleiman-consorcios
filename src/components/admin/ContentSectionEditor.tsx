import { Field, TextareaField, NumberField } from "./Fields";
import { ImageUploadField } from "./ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { useState } from "react";
import type { Content } from "@/types";

interface Props { content: Content; onChange: (c: Content) => void }

function set<T>(obj: T, path: string, value: unknown): T {
  const c = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let o: any = c;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
    o = o[k];
  }
  const last = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1]);
  o[last] = value;
  return c;
}

export function ContentSectionEditor({ content: rawContent, onChange }: Props) {
  // Ensure cardapio exists for editing
  const content: Content = {
    ...rawContent,
    cardapio: rawContent.cardapio || { title: "Nossos Produtos", subtitle: "", items: [], ctaText: "Realize seu sonho" },
  };
  const u = (path: string, value: unknown) => onChange(set(content, path, value));

  return (
    <div className="space-y-6">
      {/* HERO */}
      <CollapsibleSection title="🏠 Tela Inicial (Hero)" description="Textos e imagens principais que aparecem no topo da página">
        <Field label="Destaque superior" value={content.hero.eyebrow || ""} onChange={v => u("hero.eyebrow", v)} />
        <Field label="Título principal (use — para destacar parte do texto)" value={content.hero.headline} onChange={v => u("hero.headline", v)} />
        <TextareaField label="Subtítulo" value={content.hero.subheadline} onChange={v => u("hero.subheadline", v)} />
        <Field label="Texto de confiança" value={content.hero.trustText || ""} onChange={v => u("hero.trustText", v)} />
        <ImageUploadField label="Imagem principal" value={content.hero.image || ""} onChange={v => u("hero.image", v)} hint="Imagem de destaque que aparece no topo do site" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Botão principal (texto)" value={content.hero.ctaPrimary.text} onChange={v => u("hero.ctaPrimary.text", v)} />
          <Field label="Botão secundário (texto)" value={content.hero.ctaSecondary.text} onChange={v => u("hero.ctaSecondary.text", v)} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Selos de confiança</p>
          {content.hero.trustBadges.map((badge, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <Input value={badge} onChange={e => {
                const items = [...content.hero.trustBadges];
                items[i] = e.target.value;
                u("hero.trustBadges", items);
              }} className="text-sm flex-1" />
              <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                u("hero.trustBadges", content.hero.trustBadges.filter((_, j) => j !== i));
              }}><Trash2 className="w-3 h-3" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => u("hero.trustBadges", [...content.hero.trustBadges, ""])} className="mt-1">
            <Plus className="w-3 h-3 mr-1" />Adicionar selo
          </Button>
        </div>
      </CollapsibleSection>

      {/* CREDIBILITY */}
      <CollapsibleSection title="📊 Números e Parceiros" description="Estatísticas e logos de parceiros que geram confiança">
        {content.credibility.stats.map((stat, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-foreground">Estatística {i + 1}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Valor (ex: 20+)" value={stat.value} onChange={v => u(`credibility.stats.${i}.value`, v)} />
              <Field label="Descrição" value={stat.label} onChange={v => u(`credibility.stats.${i}.label`, v)} />
            </div>
            <Field label="Ícone" value={stat.icon} onChange={v => u(`credibility.stats.${i}.icon`, v)} />
          </div>
        ))}
        <Field label="Título da seção de parceiros" value={content.credibility.partners.title} onChange={v => u("credibility.partners.title", v)} />
        <p className="text-xs text-muted-foreground">Parceiros ({content.credibility.partners.logos.length}/5) — o layout se ajusta automaticamente</p>
        {content.credibility.partners.logos.map((logo, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Parceiro {i + 1}</p>
              <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => {
                const logos = content.credibility.partners.logos.filter((_, j) => j !== i);
                u("credibility.partners.logos", logos);
              }}><Trash2 className="w-3 h-3 mr-1" />Remover</Button>
            </div>
            <Field label="Nome" value={logo.name} onChange={v => u(`credibility.partners.logos.${i}.name`, v)} />
            <ImageUploadField label="Logo do parceiro" value={logo.image} onChange={v => u(`credibility.partners.logos.${i}.image`, v)} hint="Logo da empresa parceira (preferencialmente PNG com fundo transparente)" />
          </div>
        ))}
        {content.credibility.partners.logos.length < 5 && (
          <Button variant="outline" size="sm" onClick={() => {
            const logos = [...content.credibility.partners.logos, { name: "", image: "" }];
            u("credibility.partners.logos", logos);
          }}>
            <Plus className="w-3 h-3 mr-1" />Adicionar parceiro
          </Button>
        )}
      </CollapsibleSection>

      {/* ABOUT */}
      <CollapsibleSection title="👤 Sobre o Consultor" description="Informações pessoais, foto e credenciais do consultor">
        <Field label="Título da seção" value={content.about.title} onChange={v => u("about.title", v)} />
        <Field label="Tag / Subtítulo" value={content.about.subtitle} onChange={v => u("about.subtitle", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome do consultor" value={content.about.founderName || ""} onChange={v => u("about.founderName", v)} />
          <Field label="Cargo" value={content.about.founderRole || ""} onChange={v => u("about.founderRole", v)} />
        </div>
        <Field label="Selo / Badge" value={content.about.badge || ""} onChange={v => u("about.badge", v)} />
        <TextareaField label="Citação" value={content.about.quote || ""} onChange={v => u("about.quote", v)} />
        <TextareaField label="Texto principal (linha vazia separa parágrafos)" value={content.about.text} onChange={v => u("about.text", v)} rows={5} />
        <ImageUploadField label="Foto do consultor" value={content.about.image} onChange={v => u("about.image", v)} hint="Foto profissional do consultor" />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Métricas de destaque</p>
          {(content.about.metrics || []).map((m, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <Field label={`Valor`} value={m.value} onChange={v => u(`about.metrics.${i}.value`, v)} />
              <Field label={`Descrição`} value={m.label} onChange={v => u(`about.metrics.${i}.label`, v)} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* HOW IT WORKS */}
      <CollapsibleSection title="🔄 Como Funciona" description="Passo a passo que explica o processo ao cliente">
        <Field label="Título" value={content.howItWorks.title} onChange={v => u("howItWorks.title", v)} />
        <Field label="Subtítulo" value={content.howItWorks.subtitle} onChange={v => u("howItWorks.subtitle", v)} />
        {content.howItWorks.steps.map((step, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-foreground">Passo {step.number}</p>
            <Field label="Título" value={step.title} onChange={v => u(`howItWorks.steps.${i}.title`, v)} />
            <TextareaField label="Descrição" value={step.description} onChange={v => u(`howItWorks.steps.${i}.description`, v)} rows={2} />
          </div>
        ))}
      </CollapsibleSection>

      {/* OBJECTIVES */}
      <CollapsibleSection title="🎯 Objetivos / Soluções" description="Cards com os diferentes objetivos que o cliente pode ter">
        <Field label="Título" value={content.objectives.title} onChange={v => u("objectives.title", v)} />
        <Field label="Subtítulo" value={content.objectives.subtitle} onChange={v => u("objectives.subtitle", v)} />
        {content.objectives.cards.map((card, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-foreground">Objetivo {i + 1}</p>
            <Field label="Título" value={card.title} onChange={v => u(`objectives.cards.${i}.title`, v)} />
            <TextareaField label="Descrição" value={card.description} onChange={v => u(`objectives.cards.${i}.description`, v)} rows={2} />
            <Field label="Texto do botão" value={card.cta} onChange={v => u(`objectives.cards.${i}.cta`, v)} />
            <Field label="Ícone" value={card.icon} onChange={v => u(`objectives.cards.${i}.icon`, v)} />
          </div>
        ))}
      </CollapsibleSection>

      {/* COMPARISON */}
      <CollapsibleSection title="⚖️ Comparativo" description="Tabela comparando consórcio vs financiamento">
        <Field label="Tag" value={content.comparison.tag || ""} onChange={v => u("comparison.tag", v)} />
        <Field label="Título" value={content.comparison.title} onChange={v => u("comparison.title", v)} />
        <Field label="Subtítulo" value={content.comparison.subtitle} onChange={v => u("comparison.subtitle", v)} />
        <Field label="Texto de economia" value={content.comparison.savingsText || ""} onChange={v => u("comparison.savingsText", v)} />
        <Field label="Texto do botão" value={content.comparison.ctaText || ""} onChange={v => u("comparison.ctaText", v)} />
        {content.comparison.rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <Field label="Característica" value={row.feature} onChange={v => u(`comparison.rows.${i}.feature`, v)} />
            <Field label="Consórcio" value={row.consortium} onChange={v => u(`comparison.rows.${i}.consortium`, v)} />
            <Field label="Financiamento" value={row.financing} onChange={v => u(`comparison.rows.${i}.financing`, v)} />
          </div>
        ))}
        <TextareaField label="Aviso legal" value={content.comparison.disclaimer} onChange={v => u("comparison.disclaimer", v)} rows={2} />
      </CollapsibleSection>

      {/* SIMULATOR PLANS */}
      <CollapsibleSection title="🧮 Simulador — Tabela de Planos" description="Configure os valores de crédito, parcelas e taxas que aparecem no simulador" defaultOpen>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Cada linha representa um plano de consórcio. O <strong>valor do crédito</strong> é quanto o cliente pode comprar,
              a <strong>parcela</strong> é o valor mensal, e a <strong>taxa</strong> é a porcentagem mensal de administração.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Crédito (R$)</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Parcela (R$)</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Taxa (%)</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(content.simulator.calc.plans || []).map((plan, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-1.5 px-1">
                    <Input
                      type="number"
                      step={50000}
                      value={plan.creditValue}
                      onChange={e => u(`simulator.calc.plans.${i}.creditValue`, Number(e.target.value))}
                      className="text-sm h-9"
                    />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input
                      type="number"
                      step={50}
                      value={plan.installment}
                      onChange={e => u(`simulator.calc.plans.${i}.installment`, Number(e.target.value))}
                      className="text-sm h-9"
                    />
                  </td>
                  <td className="py-1.5 px-1">
                    <Input
                      type="number"
                      step={0.01}
                      value={plan.interestRate}
                      onChange={e => u(`simulator.calc.plans.${i}.interestRate`, Number(e.target.value))}
                      className="text-sm h-9"
                    />
                  </td>
                  <td className="py-1.5 px-1">
                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => {
                      const plans = [...content.simulator.calc.plans];
                      plans.splice(i, 1);
                      u("simulator.calc.plans", plans);
                    }}><Trash2 className="w-3 h-3" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          const plans = [...(content.simulator.calc.plans || [])];
          const lastCredit = plans.length > 0 ? plans[plans.length - 1].creditValue + 100000 : 100000;
          plans.push({ creditValue: lastCredit, installment: 0, interestRate: 0 });
          u("simulator.calc.plans", plans);
        }} className="mt-2">
          <Plus className="w-3 h-3 mr-1" />Adicionar plano
        </Button>
      </CollapsibleSection>

      {/* SIMULATOR CONFIG */}
      <CollapsibleSection title="⚙️ Simulador — Configurações Gerais" description="Parâmetros técnicos e textos do simulador">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Taxa adm. mensal (ex: 0.0017)" value={content.simulator.calc.adminRate} onChange={v => u("simulator.calc.adminRate", v)} step={0.0001} />
          <NumberField label="Fator de redução (ex: 0.55)" value={content.simulator.calc.reductionFactor} onChange={v => u("simulator.calc.reductionFactor", v)} step={0.01} />
          <NumberField label="Crédito mínimo (R$)" value={content.simulator.calc.creditMin} onChange={v => u("simulator.calc.creditMin", v)} step={10000} />
          <NumberField label="Crédito máximo (R$)" value={content.simulator.calc.creditMax} onChange={v => u("simulator.calc.creditMax", v)} step={10000} />
          <NumberField label="Incremento (R$)" value={content.simulator.calc.creditStep} onChange={v => u("simulator.calc.creditStep", v)} step={5000} />
          <NumberField label="Crédito padrão (R$)" value={content.simulator.calc.creditDefault} onChange={v => u("simulator.calc.creditDefault", v)} step={10000} />
          <NumberField label="Crédito máx veículos (R$)" value={content.simulator.calc.vehicleMaxCredit} onChange={v => u("simulator.calc.vehicleMaxCredit", v)} step={10000} />
          <NumberField label="Prazo padrão (meses)" value={content.simulator.calc.prazoDefault} onChange={v => u("simulator.calc.prazoDefault", v)} step={10} />
        </div>
        <Field label="Texto do botão de simulação" value={content.simulator.calc.ctaText} onChange={v => u("simulator.calc.ctaText", v)} />
        <Field label="Texto de privacidade" value={content.simulator.calc.privacyText} onChange={v => u("simulator.calc.privacyText", v)} />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Selos do simulador</p>
          {content.simulator.calc.badges.map((badge, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <Input value={badge} onChange={e => {
                const items = [...content.simulator.calc.badges];
                items[i] = e.target.value;
                u("simulator.calc.badges", items);
              }} className="text-sm flex-1" />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Opções de prazo</p>
          {content.simulator.calc.prazoOptions.map((opt, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <NumberField label="Meses" value={opt.value} onChange={v => u(`simulator.calc.prazoOptions.${i}.value`, v)} />
              <Field label="Descrição" value={opt.label} onChange={v => u(`simulator.calc.prazoOptions.${i}.label`, v)} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* SIMULATOR FORM */}
      <CollapsibleSection title="📝 Simulador — Formulário" description="Textos e opções do formulário de contato">
        <Field label="Título" value={content.simulator.title} onChange={v => u("simulator.title", v)} />
        <Field label="Subtítulo" value={content.simulator.subtitle} onChange={v => u("simulator.subtitle", v)} />
        <ListEditor label="Objetivos disponíveis" items={content.simulator.objectives} onUpdate={items => u("simulator.objectives", items)} />
        <ListEditor label="Faixas de crédito" items={content.simulator.creditRanges} onUpdate={items => u("simulator.creditRanges", items)} />
        <ListEditor label="Faixas de parcela" items={content.simulator.installmentRanges} onUpdate={items => u("simulator.installmentRanges", items)} />
      </CollapsibleSection>

      {/* VIDEOS */}
      <CollapsibleSection title="🎬 Vídeos" description="Vídeos do YouTube que aparecem na página">
        <Field label="Tag" value={content.videos.tag || ""} onChange={v => u("videos.tag", v)} />
        <Field label="Título" value={content.videos.title} onChange={v => u("videos.title", v)} />
        <Field label="Subtítulo" value={content.videos.subtitle} onChange={v => u("videos.subtitle", v)} />
        {content.videos.items.map((item, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-foreground">Vídeo {i + 1}</p>
            <Field label="Título" value={item.title} onChange={v => u(`videos.items.${i}.title`, v)} />
            <Field label="Tag" value={item.tag || ""} onChange={v => u(`videos.items.${i}.tag`, v)} />
            <Field label="Link do YouTube" value={item.url} onChange={v => u(`videos.items.${i}.url`, v)} />
            <ImageUploadField label="Thumbnail (miniatura)" value={item.thumbnail} onChange={v => u(`videos.items.${i}.thumbnail`, v)} hint="Imagem de capa do vídeo" />
          </div>
        ))}
      </CollapsibleSection>

      {/* TESTIMONIALS */}
      <CollapsibleSection title="💬 Depoimentos" description="Avaliações e depoimentos de clientes">
        <Field label="Tag" value={content.testimonials.tag || ""} onChange={v => u("testimonials.tag", v)} />
        <Field label="Título" value={content.testimonials.title} onChange={v => u("testimonials.title", v)} />
        {content.testimonials.items.map((item, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-foreground">Depoimento {i + 1}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Nome" value={item.name} onChange={v => u(`testimonials.items.${i}.name`, v)} />
              <Field label="Cidade" value={item.city || ""} onChange={v => u(`testimonials.items.${i}.city`, v)} />
            </div>
            <TextareaField label="Depoimento" value={item.text} onChange={v => u(`testimonials.items.${i}.text`, v)} rows={2} />
            <ImageUploadField label="Foto do cliente" value={item.image || ""} onChange={v => u(`testimonials.items.${i}.image`, v)} hint="Foto do cliente (opcional)" />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => {
          const items = [...content.testimonials.items, { name: "", role: "Cliente", text: "", rating: 5, image: "", city: "" }];
          u("testimonials.items", items);
        }}><Plus className="w-3 h-3 mr-1" />Adicionar depoimento</Button>
      </CollapsibleSection>

      {/* SECURITY */}
      <CollapsibleSection title="🔒 Segurança" description="Pontos de segurança e confiança">
        <Field label="Título" value={content.security.title} onChange={v => u("security.title", v)} />
        <Field label="Subtítulo" value={content.security.subtitle} onChange={v => u("security.subtitle", v)} />
        {content.security.points.map((point, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-foreground">Ponto {i + 1}</p>
            <Field label="Título" value={point.title} onChange={v => u(`security.points.${i}.title`, v)} />
            <TextareaField label="Descrição" value={point.description} onChange={v => u(`security.points.${i}.description`, v)} rows={2} />
            <Field label="Ícone" value={point.icon} onChange={v => u(`security.points.${i}.icon`, v)} />
          </div>
        ))}
      </CollapsibleSection>

      {/* FAQ */}
      <CollapsibleSection title="❓ Perguntas Frequentes" description="Dúvidas comuns dos clientes">
        <Field label="Título" value={content.faq.title} onChange={v => u("faq.title", v)} />
        <Field label="Subtítulo" value={content.faq.subtitle} onChange={v => u("faq.subtitle", v)} />
        {content.faq.items.map((item, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <Field label={`Pergunta ${i + 1}`} value={item.question} onChange={v => u(`faq.items.${i}.question`, v)} />
            <TextareaField label="Resposta" value={item.answer} onChange={v => u(`faq.items.${i}.answer`, v)} rows={2} />
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
              const items = [...content.faq.items];
              items.splice(i, 1);
              u("faq.items", items);
            }}><Trash2 className="w-3 h-3 mr-1" />Remover</Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => {
          u("faq.items", [...content.faq.items, { question: "", answer: "" }]);
        }}><Plus className="w-3 h-3 mr-1" />Adicionar pergunta</Button>
      </CollapsibleSection>

      {/* FINAL CTA */}
      <CollapsibleSection title="📣 Chamada Final" description="Última seção antes do rodapé com botão de ação">
        <Field label="Tag" value={content.finalCta.tag || ""} onChange={v => u("finalCta.tag", v)} />
        <Field label="Título" value={content.finalCta.title} onChange={v => u("finalCta.title", v)} />
        <Field label="Subtítulo" value={content.finalCta.subtitle} onChange={v => u("finalCta.subtitle", v)} />
        <Field label="Texto do botão WhatsApp" value={content.finalCta.ctaWhatsapp} onChange={v => u("finalCta.ctaWhatsapp", v)} />
        <Field label="Texto de privacidade" value={content.finalCta.privacyText || ""} onChange={v => u("finalCta.privacyText", v)} />
        <ListEditor label="Objetivos" items={content.finalCta.objectives || []} onUpdate={items => u("finalCta.objectives", items)} />
        <ListEditor label="Opções de crédito" items={content.finalCta.creditOptions || []} onUpdate={items => u("finalCta.creditOptions", items)} />
      </CollapsibleSection>

      {/* FOOTER */}
      <CollapsibleSection title="📄 Rodapé" description="Informações do rodapé do site">
        <TextareaField label="Descrição" value={content.footer.description} onChange={v => u("footer.description", v)} rows={2} />
        <TextareaField label="Texto legal" value={content.footer.legal} onChange={v => u("footer.legal", v)} rows={2} />
        <ListEditor label="Links de navegação" items={content.footer.navLinks || []} onUpdate={items => u("footer.navLinks", items)} />
        <ListEditor label="Links de produtos" items={content.footer.productLinks || []} onUpdate={items => u("footer.productLinks", items)} />
      </CollapsibleSection>

      {/* PROMO BANNER */}
      <CollapsibleSection title="🖼️ Banner Promocional (Carrossel)" description="Até 3 imagens que rodam automaticamente. Com 1 imagem, aparece fixa.">
        {(content.promoBanner?.slides || []).map((slide, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Slide {i + 1}</p>
              {(content.promoBanner?.slides || []).length > 1 && (
                <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => {
                  const slides = (content.promoBanner?.slides || []).filter((_, j) => j !== i);
                  u("promoBanner.slides", slides);
                }}><Trash2 className="w-3 h-3 mr-1" />Remover</Button>
              )}
            </div>
            <ImageUploadField
              label="Imagem do banner"
              value={slide.image || ""}
              onChange={v => u(`promoBanner.slides.${i}.image`, v)}
              hint="Tamanho ideal: 1920x800 pixels. Imagem horizontal/paisagem."
            />
            <Field label="Texto alternativo (acessibilidade)" value={slide.alt || ""} onChange={v => u(`promoBanner.slides.${i}.alt`, v)} />
          </div>
        ))}
        {(content.promoBanner?.slides || []).length < 3 && (
          <Button variant="outline" size="sm" onClick={() => {
            const slides = [...(content.promoBanner?.slides || []), { image: "", alt: "" }];
            u("promoBanner.slides", slides);
          }}>
            <Plus className="w-3 h-3 mr-1" />Adicionar slide
          </Button>
        )}
        <Field label="Texto do botão" value={content.promoBanner?.ctaText || "Simule agora"} onChange={v => u("promoBanner.ctaText", v)} />
        <Field label="Link do botão (ex: #simulacao)" value={content.promoBanner?.ctaHref || "#simulacao"} onChange={v => u("promoBanner.ctaHref", v)} />
      </CollapsibleSection>

      {/* CARDÁPIO */}
      <CollapsibleSection title="🍽️ Cardápio de Produtos" description="Carrossel com cards de produtos de simulação">
        <Field label="Título" value={content.cardapio?.title || ""} onChange={v => u("cardapio.title", v)} />
        <Field label="Subtítulo" value={content.cardapio?.subtitle || ""} onChange={v => u("cardapio.subtitle", v)} />
        <Field label="Texto do botão" value={content.cardapio?.ctaText || "Realize seu sonho"} onChange={v => u("cardapio.ctaText", v)} />

        <p className="text-xs font-medium text-muted-foreground mt-3">Itens do cardápio</p>
        {(content.cardapio?.items || []).map((item, i) => (
          <div key={i} className="border border-border/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium">Item {i + 1}</p>
              <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => {
                const items = [...(content.cardapio?.items || [])];
                items.splice(i, 1);
                u("cardapio.items", items);
              }}><Trash2 className="w-3 h-3" /></Button>
            </div>
            <Field label="Produto" value={item.title} onChange={v => u(`cardapio.items.${i}.title`, v)} />
            <Field label="Valor (ex: R$ 450,00)" value={item.installmentText} onChange={v => u(`cardapio.items.${i}.installmentText`, v)} />
            <ImageUploadField label="Imagem (quadrada)" value={item.image} onChange={v => u(`cardapio.items.${i}.image`, v)} hint="Imagem quadrada do produto" />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => {
          const items = [...(content.cardapio?.items || []), { image: "", title: "", installmentText: "" }];
          u("cardapio.items", items);
        }} className="mt-1">
          <Plus className="w-3 h-3 mr-1" />Adicionar item
        </Button>
      </CollapsibleSection>

      {/* NAV */}
      <CollapsibleSection title="🧭 Menu de Navegação" description="Itens do menu superior do site">
        {content.nav.map((item, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <Field label={`Item ${i + 1} - Nome`} value={item.label} onChange={v => u(`nav.${i}.label`, v)} />
            <Field label="Link (ex: #simulacao)" value={item.href} onChange={v => u(`nav.${i}.href`, v)} />
          </div>
        ))}
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({ title, description, children, defaultOpen = false }: { title: string; description?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-heading text-base font-medium">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          <div className="pt-3 space-y-3">
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
