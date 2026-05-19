import { useState, useEffect, useCallback } from "react";
import { useConfig } from "@/hooks/useConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, RotateCcw, LogOut, Lock, ArrowUp, ArrowDown, 
  CloudUpload, RefreshCw, Loader2, Eye, EyeOff, Save, CheckCircle2, History,
  Layout, Users
} from "lucide-react";
import { toast } from "sonner";
import { ContentSectionEditor } from "@/components/admin/ContentSectionEditor";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { Field, TextareaField } from "@/components/admin/Fields";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminContext } from "@/components/admin/AdminContext";
import type { SiteConfig, Content, ThemeKey, SectionVisibility, SectionKey } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";
import { adminAuthService } from "@/services/adminAuthService";
import { assetsService } from "@/services/assetsService";

// ---------------- Login ----------------

function AdminLogin({ onLogged }: { onLogged: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminAuthService.signInAdmin(email, pw);
      onLogged();
    } catch (err: any) {
      setError(err.message || "Erro ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-medium">Administração</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito - Sleiman Consórcios</p>
        </div>
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }}
          className={error ? "border-destructive" : ""}
          autoFocus
        />
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            placeholder="Senha"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(null); }}
            className={error ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Entrar no Painel
        </Button>
      </form>
    </div>
  );
}

// ---------------- Theme & sections ----------------

function ThemeSelector({ value, onChange }: { value: ThemeKey; onChange: (t: ThemeKey) => void }) {
  const themes: { key: ThemeKey; label: string; colors: string[]; desc: string }[] = [
    { key: "gold", label: "Dourado Premium", colors: ["#0B1520", "#C8A84B", "#F7F2EA"], desc: "Clássico e sofisticado" },
    { key: "blue", label: "Azul Profissional", colors: ["#1A2540", "#2563EB", "#F5F7FA"], desc: "Confiança e autoridade" },
    { key: "green", label: "Verde Natural", colors: ["#152420", "#2E9E7A", "#F5FAF7"], desc: "Equilibrado e orgânico" },
    { key: "ice", label: "Branco + Azul", colors: ["#FCFCFF", "#4A90D9", "#F0F4F8"], desc: "Clean, leve e confiável" },
    { key: "pearl", label: "Branco + Verde", colors: ["#FCFFFC", "#4DAA8D", "#F2F7F5"], desc: "Sofisticado e sereno" },
    { key: "minimal", label: "Minimalista", colors: ["#000000", "#FFFFFF", "#F2F2F2"], desc: "Simples, moderno e focado" },
  ];
  return (
    <div>
      <h3 className="font-heading text-lg font-medium mb-4">Tema de Cores</h3>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
        {themes.map(theme => (
          <button
            key={theme.key}
            onClick={() => onChange(theme.key)}
            className={`p-4 rounded-xl border-2 transition-all text-left w-full ${value === theme.key ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}
          >
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {theme.colors.map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border border-border shrink-0" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-sm font-semibold truncate">{theme.label}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{theme.desc}</p>
            {value === theme.key && <p className="text-xs text-primary mt-1 font-bold">✓ Ativo</p>}
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
  promoBanner: true, cardapio: false, news: false,
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
  news: "📰 Matérias e Notícias",
};

export function SectionToggles({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const sections = { ...defaultSections, ...config.sections };
  const savedOrder: SectionKey[] = config.sectionOrder ?? [...DEFAULT_SECTION_ORDER];
  const allKeys = Object.keys(defaultSections) as SectionKey[];
  
  const order: SectionKey[] = [
    ...savedOrder.filter(k => allKeys.includes(k)),
    ...allKeys.filter(k => !savedOrder.includes(k)),
  ];

  function toggle(key: SectionKey) {
    onChange({ ...config, sections: { ...sections, [key]: !sections[key] }, sectionOrder: order });
  }
  
  function move(key: SectionKey, direction: -1 | 1) {
    const idx = order.indexOf(key);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= order.length) return;
    const newOrder = [...order];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    onChange({ ...config, sectionOrder: newOrder });
  }

  function restoreDefault() {
    if (confirm("Deseja restaurar a ordem padrão das seções?")) {
      onChange({ ...config, sectionOrder: [...DEFAULT_SECTION_ORDER] });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg font-medium">Seções Visíveis e Ordem</h3>
        <Button variant="ghost" size="sm" onClick={restoreDefault} className="text-[11px] h-7 px-2">
          <RotateCcw className="w-3 h-3 mr-1" /> Restaurar padrão
        </Button>
      </div>
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
            <div className="flex-1 cursor-pointer" onClick={() => toggle(key)}>
              <Label htmlFor={`section-${key}`} className="text-sm cursor-pointer block">{sectionLabels[key]}</Label>
              <span className="text-[10px] text-muted-foreground">{sections[key] ? "Visível" : "Oculto"}</span>
            </div>
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
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
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
          <div className="flex items-center gap-3 py-1">
            <Switch checked={config.brand.hideName} onCheckedChange={v => u("brand.hideName", v)} id="hide-brand-name" />
            <Label htmlFor="hide-brand-name" className="text-sm">Ocultar nome ao lado do logo</Label>
          </div>
          <Field label="Texto do Botão (Menu)" value={config.brand.headerCta || ""} onChange={v => u("brand.headerCta", v)} />
          <ImageUploadField folder="upload" label="Logo" value={config.brand.logo} onChange={v => u("brand.logo", v)} hint="PNG/SVG/JPG. Máx 8MB." />
          <ImageUploadField folder="upload" label="Favicon" value={config.brand.favicon} onChange={v => u("brand.favicon", v)} hint="Ícone do navegador (PNG/SVG, 32x32 ou 64x64)." />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Contato</h3>
        <div className="space-y-3">
          <Field label="WhatsApp (só números)" value={config.contact.whatsapp} onChange={v => u("contact.whatsapp", v)} />
          <Field label="WhatsApp (exibição)" value={config.contact.whatsappDisplay} onChange={v => u("contact.whatsappDisplay", v)} />
          <Field label="E-mail (opcional)" value={config.contact.email || ""} onChange={v => u("contact.email", v)} />
          <Field label="CNPJ (opcional)" value={config.contact.cnpj || ""} onChange={v => u("contact.cnpj", v)} />
          <Field label="Endereço (opcional)" value={config.contact.address || ""} onChange={v => u("contact.address", v)} />
          <TextareaField label="Mensagem padrão WhatsApp" value={config.contact.whatsappMessage || ""} onChange={v => u("contact.whatsappMessage", v)} hint="Mensagem que o cliente envia ao clicar nos botões de contato." />
          <div className="flex items-center gap-3 py-1">
            <Switch checked={config.contact.showWhatsappFloating ?? true} onCheckedChange={v => u("contact.showWhatsappFloating", v)} id="show-whatsapp-floating" />
            <Label htmlFor="show-whatsapp-floating" className="text-sm font-medium">Mostrar botão flutuante do WhatsApp</Label>
          </div>
          <Field label="Região" value={config.contact.region} onChange={v => u("contact.region", v)} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Redes Sociais</h3>
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
          <ImageUploadField folder="upload" label="Imagem de Compartilhamento (WhatsApp)" value={config.seo.ogImage} onChange={v => u("seo.ogImage", v)} hint="Para melhor resultado nas redes sociais, use uma imagem de 1200x630px em PNG." />
          <Field label="URL canônica" value={config.seo.canonical} onChange={v => u("seo.canonical", v)} />
        </div>
      </div>
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Scripts</h3>
        <div className="space-y-3">
          <Field label="GTM ID" value={config.scripts.gtmId} onChange={v => u("scripts.gtmId", v)} />
          <Field label="Meta Pixel ID" value={config.scripts.metaPixelId} onChange={v => u("scripts.metaPixelId", v)} />
          <TextareaField label="HeadScripts" value={config.scripts.additionalHeadScripts} onChange={v => u("scripts.additionalHeadScripts", v)} rows={2} />
          <TextareaField label="BodyScripts" value={config.scripts.additionalBodyScripts} onChange={v => u("scripts.additionalBodyScripts", v)} rows={2} />
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
        <h3 className="font-heading text-lg font-medium mb-4">Campos do Formulário</h3>
        <p className="text-xs text-muted-foreground mb-4">Ative ou desative campos extras nos formulários. Se ativos, eles serão obrigatórios.</p>
        <div className="space-y-3 bg-white p-4 rounded-xl border border-[#EDE8DC]">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-cpf">Solicitar CPF</Label>
              <p className="text-[10px] text-muted-foreground">Inclui validação e máscara de CPF</p>
            </div>
            <Switch 
              checked={config.formFields?.showCPF ?? true} 
              onCheckedChange={v => u("formFields.showCPF", v)} 
              id="field-cpf" 
            />
          </div>
          <div className="h-px bg-[#EDE8DC]" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-income">Solicitar Renda</Label>
              <p className="text-[10px] text-muted-foreground">Pergunta a faixa de renda mensal</p>
            </div>
            <Switch 
              checked={config.formFields?.showIncome ?? true} 
              onCheckedChange={v => u("formFields.showIncome", v)} 
              id="field-income" 
            />
          </div>
          <div className="h-px bg-[#EDE8DC]" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-birth">Solicitar Nascimento</Label>
              <p className="text-[10px] text-muted-foreground">Inclui máscara e cálculo de idade</p>
            </div>
            <Switch 
              checked={config.formFields?.showBirthDate ?? true} 
              onCheckedChange={v => u("formFields.showBirthDate", v)} 
              id="field-birth" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Page ----------------

export default function Admin() {
  const [authState, setAuthState] = useState<"checking" | "anon" | "logged">("checking");

  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex,nofollow";
    document.head.appendChild(m);
    
    adminAuthService.getCurrentSession().then(session => {
      setAuthState(session ? "logged" : "anon");
    });

    return () => { m.remove(); };
  }, []);

  if (authState === "checking") return null;

  if (authState === "anon") {
    return <AdminLogin onLogged={() => setAuthState("logged")} />;
  }

  return <AuthenticatedAdminPanel onLogout={() => setAuthState("anon")} />;
}

function AuthenticatedAdminPanel({ onLogout }: { onLogout: () => void }) {
  const cfg = useConfig(true);
  const {
    siteConfig, content, loading, dirty, saving, source,
    updateSiteConfig, updateContent, saveDraft, publish, discardDraft, reload
  } = cfg;

  const [activeMainTab, setActiveMainTab] = useState("content");

  useEffect(() => {
    if (siteConfig?.theme) {
      document.documentElement.setAttribute("data-theme", siteConfig.theme);
    }
  }, [siteConfig?.theme]);

  useEffect(() => {
    if (!dirty) return;
    function handler(e: BeforeUnloadEvent) { e.preventDefault(); e.returnValue = ""; }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const onSaveDraft = useCallback(async () => {
    if (!siteConfig || !content) return;
    const t = toast.loading("Salvando rascunho...");
    const r = await saveDraft();
    if (r.ok === true) {
      toast.success("Rascunho salvo com sucesso", { id: t });
    } else {
      toast.error("Erro ao salvar rascunho", { id: t, description: String(r.error) });
    }
  }, [saveDraft, siteConfig, content]);

  const onPublish = useCallback(async () => {
    if (!siteConfig || !content) return;
    if (!confirm("Isso tornará suas alterações públicas. Continuar?")) return;
    
    const t = toast.loading("Publicando alterações...");
    const r = await publish();
    if (r.ok === true) {
      toast.success("Site publicado com sucesso!", { id: t });
    } else {
      toast.error("Erro ao publicar", { id: t, description: String(r.error) });
    }
  }, [publish, siteConfig, content]);

  const onDiscardDraft = useCallback(async () => {
    if (confirm("Deseja descartar seu rascunho e restaurar a versão publicada?")) {
      await discardDraft();
      toast.success("Rascunho descartado.");
    }
  }, [discardDraft]);

  const logoutAction = useCallback(async () => {
    await adminAuthService.signOutAdmin();
    onLogout();
  }, [onLogout]);

  const onUploadAsset = useCallback(async (file: File, folder?: string) => {
    const res = await assetsService.uploadSiteAsset(file, folder || "images");
    return { ok: true as const, ...res };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-spin"><Loader2 className="w-8 h-8" /></div>;
  if (!siteConfig || !content) return <p className="p-8">Erro ao carregar dados.</p>;

  return (
    <AdminContext.Provider value={{ uploadAsset: onUploadAsset, uploadEnabled: true, updateSiteConfig }}>
      <div className="min-h-screen bg-[#FDFCF9] pb-20">
        <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 h-auto min-h-16 flex flex-col sm:flex-row items-center px-4 py-2 sm:py-0">
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-gold flex items-center justify-center shadow-sm">
                <Lock className="w-4 h-4 text-midnight" />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-lg font-semibold text-midnight leading-tight truncate">Painel de Controle</h1>
                {source === "supabase" ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-green-600 font-bold tracking-wider uppercase truncate">Sincronizado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-amber-500"></span>
                    <span className="text-[10px] text-amber-600 font-bold tracking-wider uppercase truncate">Modo Offline</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Button size="sm" variant="outline" onClick={onSaveDraft} disabled={saving || !dirty} className="flex-1 sm:flex-none whitespace-nowrap">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Rascunho
              </Button>
              <Button size="sm" onClick={onPublish} disabled={saving} className="flex-1 sm:flex-none whitespace-nowrap">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-1" />}
                Publicar
              </Button>
              <Button variant="ghost" size="sm" onClick={logoutAction} className="whitespace-nowrap"><LogOut className="w-4 h-4 mr-1" />Sair</Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <TabsList className="bg-muted/50 p-1 rounded-xl h-auto w-full sm:w-auto flex overflow-x-auto scrollbar-none">
                <TabsTrigger value="content" className="flex-1 sm:flex-none rounded-lg px-4 sm:px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                  <Layout className="w-4 h-4 mr-2" /> Conteúdo
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex-1 sm:flex-none rounded-lg px-4 sm:px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                  <Users className="w-4 h-4 mr-2" /> Leads / Auditoria
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 sm:flex-none rounded-lg px-4 sm:px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
                  <RefreshCw className="w-4 h-4 mr-2" /> Configurações
                </TabsTrigger>
              </TabsList>

              {dirty && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-medium text-amber-700">Alterações não salvas</span>
                </div>
              )}
            </div>

            <TabsContent value="content" className="mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-2xl border border-[#EDE8DC] p-0 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#EDE8DC] bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold/10 shrink-0">
                      <Layout className="w-5 h-5 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-heading font-bold text-midnight truncate">Editor de Conteúdo</h2>
                      <p className="text-xs text-muted-foreground">Personalize os textos, imagens e seções da sua landing page</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <ContentSectionEditor content={content} siteConfig={siteConfig} onChange={updateContent} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leads" className="mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-2xl border border-[#EDE8DC] p-0 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#EDE8DC] bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold/10 shrink-0">
                      <Users className="w-5 h-5 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-heading font-bold text-midnight truncate">Auditoria de Leads</h2>
                      <p className="text-xs text-muted-foreground">Acompanhe todos os contatos realizados através dos simuladores</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 bg-[#FDFCF9]/50">
                  <LeadsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-2xl border border-[#EDE8DC] p-0 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-[#EDE8DC] bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold/10 shrink-0">
                      <RefreshCw className="w-5 h-5 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-heading font-bold text-midnight truncate">Configurações Gerais</h2>
                      <p className="text-xs text-muted-foreground">Gerencie o tema, marca, contatos e integrações técnicas</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <SiteConfigEditor config={siteConfig} onChange={updateSiteConfig} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t z-40 flex items-center px-4 md:hidden">
          <div className="flex w-full gap-2">
            <Button className="flex-1" onClick={onSaveDraft} disabled={saving || !dirty}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
            <Button className="flex-1" variant="outline" onClick={onPublish} disabled={saving}>
              <CloudUpload className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </footer>
      </div>
    </AdminContext.Provider>
  );
}
