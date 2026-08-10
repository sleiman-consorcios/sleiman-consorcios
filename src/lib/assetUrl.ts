/**
 * Tradução de URLs de assets do Supabase Storage para arquivos servidos
 * estaticamente pela Vercel (public/assets/), com fallback para a origem.
 *
 * VITE_ASSETS_MODE:
 *   "local"    (padrão) -> traduz para /assets/<arquivo>
 *   "supabase"          -> mantém a URL original (rollback sem deploy de código)
 */

const SUPABASE_PUBLIC_MARKER = "/storage/v1/object/public/site-assets/";
const BUCKET_NAME = "site-assets";

/** Mapa localPath -> URL original do Supabase, usado no fallback visual. */
const originalByLocalPath = new Map<string, string>();

function getAssetsMode(): "local" | "supabase" {
  const raw = (import.meta.env?.VITE_ASSETS_MODE as string | undefined)?.trim().toLowerCase();
  return raw === "supabase" ? "supabase" : "local";
}

/**
 * Converte uma URL pública do bucket "site-assets" em um caminho local
 * (/assets/<nome-do-arquivo>). Qualquer outra string é devolvida intacta.
 */
export function resolveAssetUrl(url: string): string {
  if (typeof url !== "string" || url.length === 0) return url;
  
  // Se já for uma URL local, não processa
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  const markerIndex = url.indexOf(SUPABASE_PUBLIC_MARKER);
  if (markerIndex === -1) {
    // Tenta detectar se é uma URL do Supabase mas de outro bucket ou formato
    if (url.includes(".supabase.co/storage/v1/object/public/")) {
       // Se não for do nosso bucket alvo, apenas retorna a original
       if (!url.includes(`/${BUCKET_NAME}/`)) return url;
    } else {
       return url;
    }
  }

  if (getAssetsMode() === "supabase") return url;

  const afterMarker = markerIndex !== -1 
    ? url.slice(markerIndex + SUPABASE_PUBLIC_MARKER.length)
    : url.split(`/${BUCKET_NAME}/`)[1];

  if (!afterMarker) return url;

  const relative = afterMarker.split("?")[0];
  const rawFileName = relative.split("/").pop() || "";
  if (!rawFileName) return url;

  let fileName = rawFileName;
  try {
    fileName = decodeURIComponent(rawFileName);
  } catch {
    // nome com % inválido: mantém como veio
  }

  const localPath = `/assets/${fileName}`;
  originalByLocalPath.set(localPath, url);
  return localPath;
}

/**
 * Retorna a URL original (Supabase) correspondente a um caminho local.
 * Se não houver registro, devolve o próprio caminho.
 */
export function originalAssetUrl(localPath: string, originalUrl?: string): string {
  if (originalUrl) return originalUrl;
  if (typeof localPath !== "string") return localPath;
  const bare = localPath.startsWith("/") ? localPath : localPath.replace(/^https?:\/\/[^/]+/, "");
  return originalByLocalPath.get(bare) ?? originalByLocalPath.get(localPath) ?? localPath;
}

/** Aplica resolveAssetUrl recursivamente em qualquer estrutura de dados. */
export function resolveAssetUrlsDeep<T>(value: T): T {
  if (typeof value === "string") return resolveAssetUrl(value) as unknown as T;
  if (Array.isArray(value)) return value.map(item => resolveAssetUrlsDeep(item)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = resolveAssetUrlsDeep(val);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * onError para <img>/<video>: troca o src pela URL original do Supabase
 * uma única vez (flag no dataset evita loop). Retorna true se houve fallback.
 */
export function handleAssetError(
  event: { currentTarget: HTMLImageElement | HTMLVideoElement } | { target: EventTarget | null },
): boolean {
  const el = ("currentTarget" in event ? event.currentTarget : event.target) as
    | HTMLImageElement
    | HTMLVideoElement
    | null;
  if (!el || !("dataset" in el)) return false;
  if (el.dataset.assetFallback === "1") return false;
  
  const current = el.getAttribute("src") || "";
  if (!current) return false;

  const original = originalAssetUrl(current);
  if (!original || original === current) {
    console.warn(`[AssetUrl] Fallback failed for: ${current}. Verifying direct URL.`);
    if (current.includes(".supabase.co")) return false;
    return false;
  }

  console.info(`[AssetUrl] Falling back to original asset: ${original}`);
  el.dataset.assetFallback = "1";
  el.setAttribute("src", original);
  if (el instanceof HTMLVideoElement) {
    el.querySelectorAll("source").forEach(source => source.remove());
    el.load();
  }
  return true;
}
