import { supabase } from "../integrations/supabase/client";
import { resolveAssetUrl } from "@/lib/assetUrl";

export const assetsService = {
  async uploadSiteAsset(file: File, folder: string = "images") {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
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

  getPublicAssetUrl(path: string) {
    if (path.startsWith("/")) return path;
    if (path.startsWith("http")) return resolveAssetUrl(path);
    const { data: { publicUrl } } = supabase.storage
      .from("site-assets")
      .getPublicUrl(path);
    return resolveAssetUrl(publicUrl);
  },
};
