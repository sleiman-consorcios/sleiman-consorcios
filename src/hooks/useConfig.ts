import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import type { SiteConfig, Content, SectionKey } from "@/types";
import { siteContentService } from "@/services/siteContentService";
import { siteDataMapper } from "@/services/mappers/siteDataMapper";
import { adminAuthService } from "@/services/adminAuthService";

const KEY_SITE_DRAFT = "site-config-draft";
const KEY_CONTENT_DRAFT = "content-draft";

export interface SaveResult {
  ok: true;
  version?: number;
}

export interface SaveError {
  ok: false;
  error: string;
}

type LoadingState = "loading" | "ready" | "error";

export interface UseConfigReturn {
  siteConfig: SiteConfig | null;
  content: Content | null;
  publishedSiteConfig: SiteConfig | null;
  publishedContent: Content | null;
  loading: boolean;
  state: LoadingState;
  saving: boolean;
  dirty: boolean;
  saveError: string | null;
  source: "supabase" | "fallback-json";
  updateSiteConfig: (c: SiteConfig) => void;
  updateContent: (c: Content) => void;
  saveDraft: () => Promise<SaveResult | SaveError>;
  publish: () => Promise<SaveResult | SaveError>;
  discardDraft: () => Promise<void>;
  reload: () => Promise<void>;
}

async function fetchJsonFallback<T>(url: string): Promise<T> {
  const r = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Falha ao carregar ${url}`);
  return (await r.json()) as T;
}

export function useConfig(isAdmin: boolean = false): UseConfigReturn {
  const [publishedSiteConfig, setPublishedSiteConfig] = useState<SiteConfig | null>(() => {
    if (isAdmin) return null;
    try {
      const saved = localStorage.getItem("site-config-cache");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [publishedContent, setPublishedContent] = useState<Content | null>(() => {
    if (isAdmin) return null;
    try {
      const saved = localStorage.getItem("content-cache");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [siteConfig, setSiteConfigState] = useState<SiteConfig | null>(publishedSiteConfig);
  const [content, setContentState] = useState<Content | null>(publishedContent);
  const [state, setState] = useState<LoadingState>(siteConfig ? "ready" : "loading");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "fallback-json">("supabase");

  const load = useCallback(async () => {
    setState("loading");
    try {
      if (isAdmin) {
        // Admin always loads draft from Supabase
        const data = await siteContentService.getDraftSiteData();
        if (data) {
          const mapped = siteDataMapper.toFrontend(data.siteConfig, data.content);
          setSiteConfigState(mapped.siteConfig);
          setContentState(mapped.content);
          setSource("supabase");
        }
      } else {
        // Public page loads published from Supabase with JSON fallback
        const data = await siteContentService.getPublishedSiteData();
        if (data) {
          const mapped = siteDataMapper.toFrontend(data.siteConfig, data.content);
          setPublishedSiteConfig(mapped.siteConfig);
          setPublishedContent(mapped.content);
          setSiteConfigState(mapped.siteConfig);
          setContentState(mapped.content);
          setSource("supabase");
          
          if (!isAdmin) {
            localStorage.setItem("site-config-cache", JSON.stringify(mapped.siteConfig));
            localStorage.setItem("content-cache", JSON.stringify(mapped.content));
          }
        } else {
          // Fallback to JSON
          const [site, cont] = await Promise.all([
            fetchJsonFallback<SiteConfig>("/site-config.json"),
            fetchJsonFallback<Content>("/content.json"),
          ]);
          setPublishedSiteConfig(site);
          setPublishedContent(cont);
          setSiteConfigState(site);
          setContentState(cont);
          setSource("fallback-json");
        }
      }
      setState("ready");
    } catch (e) {
      console.error("useConfig.load failed", e);
      // Even in error, try JSON fallback for public
      if (!isAdmin) {
        try {
          const [site, cont] = await Promise.all([
            fetchJsonFallback<SiteConfig>("/site-config.json"),
            fetchJsonFallback<Content>("/content.json"),
          ]);
          // Aplica o mapeamento aos dados do JSON para garantir que resolveAssetUrl
          // registre os caminhos locais no mapa originalByLocalPath para o fallback visual
          const mapped = siteDataMapper.toFrontend(site, cont);
          setSiteConfigState(mapped.siteConfig);
          setContentState(mapped.content);
          setSource("fallback-json");
          setState("ready");
        } catch (err) {
          console.error("useConfig fallback failed", err);
          setState("error");
        }
      } else {
        setState("error");
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSiteConfig = useCallback((c: SiteConfig) => {
    setSiteConfigState(c);
    setDirty(true);
  }, []);

  const updateContent = useCallback((c: Content) => {
    setContentState(c);
    setDirty(true);
  }, []);

  const saveDraft = useCallback(async (): Promise<SaveResult | SaveError> => {
    if (!siteConfig || !content) return { ok: false, error: "Sem dados para salvar." };
    setSaving(true);
    setSaveError(null);
    try {
      const { config, content: dbContent } = siteDataMapper.toDatabase(siteConfig, content);
      await Promise.all([
        siteContentService.saveDraftContent(dbContent),
        siteContentService.saveSiteConfig(config)
      ]);
      setDirty(false);
      return { ok: true };
    } catch (e: any) {
      setSaveError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, [siteConfig, content]);

  const publish = useCallback(async (): Promise<SaveResult | SaveError> => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveDraft();
      await siteContentService.publishDraft();
      setDirty(false);
      return { ok: true };
    } catch (e: any) {
      setSaveError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, [saveDraft]);

  const discardDraft = useCallback(async () => {
    setState("loading");
    try {
      await siteContentService.restorePublishedToDraft();
      await load();
      setDirty(false);
    } catch (e) {
      console.error("Discard failed", e);
    } finally {
      setState("ready");
    }
  }, [load]);

  return {
    siteConfig, content, publishedSiteConfig, publishedContent,
    loading: state === "loading",
    state, saving, dirty, saveError, source,
    updateSiteConfig, updateContent, saveDraft, publish, discardDraft,
    reload: load,
  };
}
