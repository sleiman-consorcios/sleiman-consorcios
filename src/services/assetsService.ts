import { supabase } from "../integrations/supabase/client";
import { resolveAssetUrl } from "@/lib/assetUrl";

export interface SiteAssetInfo {
  name: string;
  path: string;
  folder: string;
  publicUrl: string;
  updatedAt: string;
}

// Faixa Unicode "Combining Diacritical Marks" (0300-036F), usada para remover
// acentos após normalize("NFD"). Construída via charCode para evitar bytes
// não-ASCII no fonte.
const DIACRITICS_RE = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

/** Normaliza o nome original do arquivo em um slug legível (sem acento/espaço/símbolo). */
function sanitizeBaseName(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  const slug = withoutExt
    .normalize("NFD").replace(DIACRITICS_RE, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "arquivo";
}

export const assetsService = {
  async uploadSiteAsset(file: File, folder: string = "images") {
    const fileExt = file.name.split(".").pop() || "bin";
    const base = sanitizeBaseName(file.name);

    const { data: existing } = await supabase.storage
      .from("site-assets")
      .list(folder, { search: base });
    const takenNames = new Set((existing || []).map(f => f.name));

    let fileName = `${base}.${fileExt}`;
    if (takenNames.has(fileName)) {
      fileName = `${base}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
    }
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("site-assets")
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl,
    };
  },

  /** Procura, em todas as pastas do bucket, um arquivo já enviado com o mesmo nome (normalizado). */
  async findExistingByName(originalFileName: string): Promise<SiteAssetInfo | null> {
    const base = sanitizeBaseName(originalFileName);
    const assets = await assetsService.listSiteAssets();
    const match = assets.find(a => sanitizeBaseName(a.name) === base);
    return match || null;
  },

  /** Lista todos os arquivos já enviados ao bucket "site-assets", em qualquer pasta. */
  async listSiteAssets(): Promise<SiteAssetInfo[]> {
    const { data: rootEntries, error: rootError } = await supabase.storage
      .from("site-assets")
      .list("", { limit: 100 });
    if (rootError || !rootEntries) return [];

    const folders = rootEntries.filter(e => e.id === null).map(e => e.name);
    const all: SiteAssetInfo[] = [];

    for (const folder of folders) {
      const { data: files } = await supabase.storage
        .from("site-assets")
        .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
      for (const f of files || []) {
        if (f.id === null) continue; // subpasta aninhada, ignora
        const path = `${folder}/${f.name}`;
        const { data: { publicUrl } } = supabase.storage.from("site-assets").getPublicUrl(path);
        all.push({
          name: f.name,
          path,
          folder,
          publicUrl,
          updatedAt: f.updated_at || f.created_at || "",
        });
      }
    }

    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  /** Remove um arquivo do bucket "site-assets" definitivamente. */
  async deleteSiteAsset(path: string): Promise<void> {
    const { error } = await supabase.storage.from("site-assets").remove([path]);
    if (error) throw error;
  },

  getPublicAssetUrl(path: string) {
    if (path.startsWith("/")) return path;
    if (path.startsWith("http")) return resolveAssetUrl(path);
    const { data: { publicUrl } } = supabase.storage
      .from("site-assets")
      .getPublicUrl(path);
    return resolveAssetUrl(publicUrl);
  },
};
