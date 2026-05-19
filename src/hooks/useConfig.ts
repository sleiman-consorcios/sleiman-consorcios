import { useEffect, useState, useCallback } from "react";
import type { SiteConfig, Content, AdminConfig } from "@/types";
import { getItem, setItem, removeItem, hasItem } from "@/utils/storage";

const KEY_SITE = "site-config";
const KEY_CONTENT = "content";

// Deep merge: defaults filled in for any missing keys, but local values win.
// Arrays are NOT merged — local array fully replaces default (so user edits stick).
function deepMerge<T>(defaults: T, local: T): T {
  if (local === null || local === undefined) return defaults;
  if (Array.isArray(defaults) || Array.isArray(local)) return local;
  if (typeof defaults !== "object" || typeof local !== "object") return local;
  const out: any = { ...defaults };
  for (const key of Object.keys(local as any)) {
    const dv = (defaults as any)?.[key];
    const lv = (local as any)[key];
    out[key] = dv !== undefined && typeof dv === "object" && !Array.isArray(dv)
      ? deepMerge(dv, lv)
      : lv;
  }
  return out;
}

export function useConfig() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [defaults, setDefaults] = useState<{ site: SiteConfig; content: Content } | null>(null);
  const [hasLocal, setHasLocal] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      // Migrate old localStorage data to IndexedDB (one-time)
      const oldSite = localStorage.getItem("sleiman-site-config");
      const oldContent = localStorage.getItem("sleiman-content");
      if (oldSite) {
        await setItem(KEY_SITE, JSON.parse(oldSite));
        localStorage.removeItem("sleiman-site-config");
      }
      if (oldContent) {
        await setItem(KEY_CONTENT, JSON.parse(oldContent));
        localStorage.removeItem("sleiman-content");
      }

      const [site, cont, admin] = await Promise.all([
        fetch("/site-config.json").then(r => r.json()),
        fetch("/content.json").then(r => r.json()),
        fetch("/admin-config.json").then(r => r.json()),
      ]);
      setDefaults({ site, content: cont });

      const [localSite, localContent] = await Promise.all([
        getItem<SiteConfig>(KEY_SITE),
        getItem<Content>(KEY_CONTENT),
      ]);

      setSiteConfig(localSite ? deepMerge(site, localSite) : site);
      setContent(localContent ? deepMerge(cont, localContent) : cont);
      setAdminConfig(admin);
      setHasLocal(localSite !== null || localContent !== null);
    } catch (e) {
      console.error("Failed to load config", e);
    } finally {
      setLoading(false);
    }
  }

  const updateSiteConfig = useCallback(async (c: SiteConfig) => {
    setSiteConfig(c);
    await setItem(KEY_SITE, c);
    setHasLocal(true);
  }, []);

  const updateContent = useCallback(async (c: Content) => {
    setContent(c);
    await setItem(KEY_CONTENT, c);
    setHasLocal(true);
  }, []);

  const resetToDefaults = useCallback(async () => {
    await Promise.all([removeItem(KEY_SITE), removeItem(KEY_CONTENT)]);
    if (defaults) {
      setSiteConfig(defaults.site);
      setContent(defaults.content);
    }
    setHasLocal(false);
  }, [defaults]);

  const hasLocalChanges = useCallback(() => hasLocal, [hasLocal]);

  return {
    siteConfig, content, adminConfig, loading,
    updateSiteConfig, updateContent, resetToDefaults, hasLocalChanges,
  };
}
