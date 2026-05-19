import { useState, useEffect } from "react";
import { useConfig } from "@/hooks/useConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Download, Upload, RotateCcw, LogOut, Lock, ArrowUp, ArrowDown } from "lucide-react";
import { ContentSectionEditor } from "@/components/admin/ContentSectionEditor";
import { Field, TextareaField } from "@/components/admin/Fields";
import type { SiteConfig, Content, AdminConfig, ThemeKey, SectionVisibility, SectionKey } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";

function AdminLogin({ adminConfig, onLogin }: { adminConfig: AdminConfig; onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === adminConfig.password) {
      sessionStorage.setItem("sleiman-admin", Date.now().toString());
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-medium">Admin</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito</p>
        </div>
        <Input type="password" placeholder="Senha" value={pw} onChange={e => { setPw(e.target.value); setError(false); }} className={error ? "border-destructive" : ""} />
        {error && <p className="text-xs text-destructive">Senha incorreta</p>}
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </div>
  );
}

function ThemeSelector({ value, onChange }: { value: ThemeKey; onChange: (t: ThemeKey) => void }) {
  const themes: { key: ThemeKey; label: string; colors: string[]; desc: string }[] = [
    { key: "gold", label: "Dourado Premium", colors: ["#0B1520", "#C8A84B", "#F7F2EA"], desc: "Clássico e sofisticado" },
    { key: "blue", label: "Azul Profissional", colors: ["#1A2540", "#2563EB", "#F5F7FA"], desc: "Confiança e autoridade" },
    { key: "green", label: "Verde Natural", colors: ["#152420", "#2E9E7A", "#F5FAF7"], desc: "Equilibrado e orgânico" },
    { key: "ice", label: "Branco + Azul", colors: ["#FCFCFF", "#4A90D9", "#F0F4F8"], desc: "Clean, leve e confiável" },
    { key: "pearl", label: "Branco + Verde", colors: ["#FCFFFC", "#4DAA8D", "#F2F7F5"], desc: "Sofisticado e sereno" },
  ];

  return (
    <div>
      <h3 className="font-heading text-lg font-medium mb-4">Tema de Cores</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {themes.map(theme => (
          <button
            key={theme.key}
            onClick={() => onChange(theme.key)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${value === theme.key ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}
          >
            <div className="flex gap-1.5 mb-3">
              {theme.colors.map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-sm font-semibold">{theme.label}</p>
            <p className="text-[11px] text-muted-foreground">{theme.desc}</p>
            {value === theme.key && <p className="text-xs text-primary mt-1">✓ Ativo</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

const defaultSections: SectionVisibility = {
  hero: true, credibility: true, about: true, howItWorks: true,
  objectives: true, comparison: true, simulator: true, videos: true,
  testimonials: true, security: true, faq: true, finalCta: true,
  promoBanner: false, cardapio: false,
};

const sectionLabels: Record<keyof SectionVisibility, string> = {
  hero: "🏠 Tela Inicial (Hero)",
  credibility: "📊 Números e Parceiros",
  about: "👤 Sobre o Consultor",
  howItWorks: "🔄 Como Funciona",
  objectives: "🎯 Objetivos / Soluções",
  comparison: "⚖️ Comparativo",
  simulator: "🧮 Simulador",
  videos: "🎬 Vídeos",
  testimonials: "💬 Depoimentos",
  security: "🔒 Segurança",
  faq: "❓ Perguntas Frequentes",
  finalCta: "📣 Chamada Final",
  promoBanner: "🖼️ Banner Promocional",
  cardapio: "🍽️ Cardápio de Produtos",
};

function SectionToggles({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const sections = { ...defaultSections, ...config.sections };
  // Ensure every known section key is in the order (append missing keys at the end)
  const savedOrder: SectionKey[] = config.sectionOrder ?? [...DEFAULT_SECTION_ORDER];
  const allKeys = Object.keys(defaultSections) as SectionKey[];
  const order: SectionKey[] = [
    ...savedOrder.filter(k => allKeys.includes(k)),
    ...allKeys.filter(k => !savedOrder.includes(k)),
  ];

  function toggle(key: SectionKey) {
    const updated = { ...config, sections: { ...sections, [key]: !sections[key] }, sectionOrder: order };
    onChange(updated);
  }

  function move(key: SectionKey, direction: -1 | 1) {
    const idx = order.indexOf(key);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= order.length) return;
    const newOrder = [...order];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    onChange({ ...config, sectionOrder: newOrder });
  }

  return (
    <div>
      <h3 className="font-heading text-lg font-medium mb-2">Seções Visíveis e Ordem</h3>
      <p className="text-xs text-muted-foreground mb-4">Ative/desative e reordene as seções usando as setas</p>
      <div className="space-y-2">
        {order.map((key, idx) => (
          <div key={key} className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${sections[key] ? "border-primary/30 bg-primary/5" : "border-border bg-muted/10 opacity-60"}`}>
            <div className="flex flex-col gap-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => move(key, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === order.length - 1} onClick={() => move(key, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground font-mono w-6 text-center">{idx + 1}</span>
            <Switch checked={sections[key]} onCheckedChange={() => toggle(key)} id={`section-${key}`} />
            <Label htmlFor={`section-${key}`} className="text-sm cursor-pointer flex-1">{sectionLabels[key]}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteConfigEditor({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const u = (path: string, value: string | boolean) => {
    const c = JSON.parse(JSON.stringify(config));
    const keys = path.split(".");
    let obj = c;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    onChange(c);
  };

  return (
    <div className="space-y-8">
      <ThemeSelector value={config.theme || "gold"} onChange={v => u("theme", v as unknown as string)} />

      <SectionToggles config={config} onChange={onChange} />

      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Marca</h3>
        <div className="space-y-3">
          <Field label="Nome" value={config.brand.name} onChange={v => u("brand.name", v)} />
          <Field label="Logo URL" value={config.brand.logo} onChange={v => u("brand.logo", v)} />
          <Field label="Favicon URL" value={config.brand.favicon} onChange={v => u("brand.favicon", v)} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Contato</h3>
        <div className="space-y-3">
          <Field label="WhatsApp (só números)" value={config.contact.whatsapp} onChange={v => u("contact.whatsapp", v)} />
          <Field label="WhatsApp (exibição)" value={config.contact.whatsappDisplay} onChange={v => u("contact.whatsappDisplay", v)} />
          <Field label="E-mail" value={config.contact.email} onChange={v => u("contact.email", v)} />
          <Field label="Região" value={config.contact.region} onChange={v => u("contact.region", v)} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Redes Sociais (opcional)</h3>
        <div className="space-y-3">
          <Field label="Instagram URL" value={config.social?.instagram || ""} onChange={v => u("social.instagram", v)} />
          <Field label="Facebook URL" value={config.social?.facebook || ""} onChange={v => u("social.facebook", v)} />
          <Field label="TikTok URL" value={config.social?.tiktok || ""} onChange={v => u("social.tiktok", v)} />
          <Field label="YouTube URL" value={config.social?.youtube || ""} onChange={v => u("social.youtube", v)} />
          <Field label="LinkedIn URL" value={config.social?.linkedin || ""} onChange={v => u("social.linkedin", v)} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">SEO</h3>
        <div className="space-y-3">
          <Field label="Título" value={config.seo.title} onChange={v => u("seo.title", v)} />
          <TextareaField label="Descrição" value={config.seo.description} onChange={v => u("seo.description", v)} />
          <Field label="OG Image URL" value={config.seo.ogImage} onChange={v => u("seo.ogImage", v)} />
          <Field label="URL canônica" value={config.seo.canonical} onChange={v => u("seo.canonical", v)} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Scripts</h3>
        <div className="space-y-3">
          <Field label="GTM ID" value={config.scripts.gtmId} onChange={v => u("scripts.gtmId", v)} />
          <Field label="Meta Pixel ID" value={config.scripts.metaPixelId} onChange={v => u("scripts.metaPixelId", v)} />
          <TextareaField label="Scripts adicionais (head)" value={config.scripts.additionalHeadScripts} onChange={v => u("scripts.additionalHeadScripts", v)} rows={2} />
          <TextareaField label="Scripts adicionais (body)" value={config.scripts.additionalBodyScripts} onChange={v => u("scripts.additionalBodyScripts", v)} rows={2} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Página</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={config.page.active} onCheckedChange={v => u("page.active", v)} id="page-active" />
            <Label htmlFor="page-active">Página ativa</Label>
          </div>
          <Field label="Título indisponibilidade" value={config.page.unavailableTitle} onChange={v => u("page.unavailableTitle", v)} />
          <TextareaField label="Mensagem indisponibilidade" value={config.page.unavailableMessage} onChange={v => u("page.unavailableMessage", v)} />
        </div>
      </div>
      <div>
        <Field label="Webhook URL (opcional)" value={config.webhookUrl} onChange={v => u("webhookUrl", v)} />
      </div>
    </div>
  );
}

export default function Admin() {
  const { siteConfig, content, adminConfig, loading, updateSiteConfig, updateContent, resetToDefaults, hasLocalChanges } = useConfig();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ts = sessionStorage.getItem("sleiman-admin");
    if (ts && adminConfig) {
      const elapsed = (Date.now() - parseInt(ts)) / 60000;
      if (elapsed < adminConfig.sessionDurationMinutes) setAuthed(true);
    }
  }, [adminConfig]);

  useEffect(() => {
    if (siteConfig?.theme) {
      document.documentElement.setAttribute("data-theme", siteConfig.theme);
    }
  }, [siteConfig?.theme]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!adminConfig) return <p className="p-8 text-muted-foreground">Erro ao carregar admin config.</p>;
  if (!authed) return <AdminLogin adminConfig={adminConfig} onLogin={() => setAuthed(true)} />;
  if (!siteConfig || !content) return <p className="p-8 text-muted-foreground">Erro ao carregar dados.</p>;

  function exportJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(callback: (data: unknown) => void) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try { callback(JSON.parse(text)); } catch { alert("JSON inválido"); }
    };
    input.click();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-heading text-lg font-medium">Administração</h1>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem("sleiman-admin"); setAuthed(false); }}>
            <LogOut className="w-4 h-4 mr-1" />Sair
          </Button>
        </div>
      </header>

      {hasLocalChanges() && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-accent/30 bg-accent/5">
            <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Alterações locais ativas</p>
              <p className="text-muted-foreground">As mudanças estão salvas apenas neste navegador. Exporte o JSON para persistir.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => exportJson(siteConfig, "site-config.json")}><Download className="w-4 h-4 mr-1" />Exportar Config</Button>
          <Button variant="outline" size="sm" onClick={() => exportJson(content, "content.json")}><Download className="w-4 h-4 mr-1" />Exportar Conteúdo</Button>
          <Button variant="outline" size="sm" onClick={() => importJson(d => updateSiteConfig(d as SiteConfig))}><Upload className="w-4 h-4 mr-1" />Importar Config</Button>
          <Button variant="outline" size="sm" onClick={() => importJson(d => updateContent(d as Content))}><Upload className="w-4 h-4 mr-1" />Importar Conteúdo</Button>
          <Button variant="outline" size="sm" onClick={resetToDefaults}><RotateCcw className="w-4 h-4 mr-1" />Resetar</Button>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="site">Configuração</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <ContentSectionEditor content={content} onChange={updateContent} />
          </TabsContent>
          <TabsContent value="site">
            <SiteConfigEditor config={siteConfig} onChange={updateSiteConfig} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
