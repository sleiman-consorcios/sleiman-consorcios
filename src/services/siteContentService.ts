import { supabase } from "../integrations/supabase/client";
import { SiteConfig, Content } from "@/types";

export interface SiteData {
  siteConfig: SiteConfig;
  content: Content;
}

export const siteContentService = {
  async getPublishedSiteData(): Promise<SiteData | null> {
    const { data: configData, error: configError } = await supabase
      .from("site_config")
      .select("*")
      .eq("singleton_key", "main")
      .single();

    if (configError) {
      console.error("Error fetching site config:", configError);
      return null;
    }

    const { data: contentData, error: contentError } = await supabase
      .from("site_content")
      .select("*")
      .eq("status", "published")
      .single();

    if (contentError) {
      console.error("Error fetching site content:", contentError);
      return null;
    }

    return {
      siteConfig: configData as any,
      content: contentData.content as any,
    };
  },

  async getDraftSiteData(): Promise<SiteData | null> {
    const { data: configData, error: configError } = await supabase
      .from("site_config")
      .select("*")
      .eq("singleton_key", "main")
      .single();

    if (configError) throw configError;

    let { data: draftContent, error: draftError } = await supabase
      .from("site_content")
      .select("*")
      .eq("status", "draft")
      .maybeSingle();

    if (draftError) throw draftError;

    if (!draftContent) {
      // Create draft from published
      const { data: published } = await supabase
        .from("site_content")
        .select("*")
        .eq("status", "published")
        .maybeSingle();

      const { data: newDraft, error: createError } = await supabase
        .from("site_content")
        .insert({
          content: published?.content || {},
          status: "draft",
          version: (published?.version || 0) + 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      draftContent = newDraft;
    }

    return {
      siteConfig: configData as any,
      content: draftContent.content as any,
    };
  },

  async saveDraftContent(content: Content): Promise<void> {
    const { error } = await supabase
      .from("site_content")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("status", "draft");

    if (error) throw error;
  },

  async saveSiteConfig(config: Partial<SiteConfig>): Promise<void> {
    const { error } = await supabase
      .from("site_config")
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq("singleton_key", "main");

    if (error) throw error;
  },

  async publishDraft(): Promise<void> {
    const { data: draft, error: draftError } = await supabase
      .from("site_content")
      .select("*")
      .eq("status", "draft")
      .single();

    if (draftError) throw draftError;

    const { data: config, error: configError } = await supabase
      .from("site_config")
      .select("*")
      .eq("singleton_key", "main")
      .single();

    if (configError) throw configError;

    const { error: publishError } = await supabase
      .from("site_content")
      .update({
        content: draft.content,
        version: draft.version,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("status", "published");

    if (publishError) throw publishError;

    // Create version history
    await supabase.from("content_versions").insert({
      content: draft.content,
      config: config,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      label: `Version ${draft.version}`,
    });

    // Update draft version for next cycle
    await supabase
      .from("site_content")
      .update({ version: draft.version + 1 })
      .eq("status", "draft");
  },

  async restorePublishedToDraft(): Promise<void> {
    const { data: published, error: pubError } = await supabase
      .from("site_content")
      .select("*")
      .eq("status", "published")
      .single();

    if (pubError) throw pubError;

    const { error: draftError } = await supabase
      .from("site_content")
      .update({ content: published.content, updated_at: new Date().toISOString() })
      .eq("status", "draft");

    if (draftError) throw draftError;
  },
};
