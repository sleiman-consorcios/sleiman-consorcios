import { SiteConfig, Content } from "@/types";
import { resolveAssetUrlsDeep } from "@/lib/assetUrl";

export const siteDataMapper = {
  toFrontend(dbConfig: any, dbContent: any): { siteConfig: SiteConfig; content: Content } {
    // Traduz todas as URLs de mídia do bucket "site-assets" para /assets/<arquivo>.
    // O objeto original permanece intacto (dbConfig/dbContent) e o mapa interno de
    // assetUrl.ts guarda a URL do Supabase para o fallback visual.
    const config = resolveAssetUrlsDeep(dbConfig ?? {});
    const content = resolveAssetUrlsDeep(dbContent ?? {});

    return {
      siteConfig: {
        ...config,
        brand: {
          name: config.brand?.name || "Sleiman Consórcios",
          logo: config.brand?.logo || "/logo.png", // Valor padrão se estiver vazio ou falhar
          favicon: config.brand?.favicon || "/favicon.ico",
          headerCta: config.brand?.headerCta || "Simular grátis",
          hideName: !!config.brand?.hideName,
        },
        contact: {
          whatsapp: config.contact?.whatsapp || "",
          whatsappDisplay: config.contact?.whatsappDisplay || "",
          region: config.contact?.region || "Brasil",
          ...config.contact,
        },
        seo: {
          title: config.seo?.title || "Sleiman Consórcios",
          description: config.seo?.description || "",
          ogImage: config.seo?.ogImage || "/logo.png",
          ogUrl: config.seo?.ogUrl || "",
          canonical: config.seo?.canonical || "",
          ...config.seo,
        },
        page: {
          active: config.page?.active ?? true,
          unavailableTitle: config.page?.unavailableTitle || "Manutenção",
          unavailableMessage: config.page?.unavailableMessage || "Voltamos em breve.",
        },
        scripts: config.scripts || { gtmId: "", metaPixelId: "", additionalHeadScripts: "", additionalBodyScripts: "", gtmScript1: "", gtmScript2: "" },
        theme: config.theme || "gold",
        sections: config.sections || {},
        sectionOrder: config.section_order || config.sectionOrder || [],
        formFields: config.form_fields || config.formFields || { showCPF: true, showIncome: true, showBirthDate: true },
      },
      content: {
        nav: content.nav || [],
        hero: content.hero || { headline: "", subheadline: "", ctaPrimary: { text: "", href: "" }, ctaSecondary: { text: "", href: "" }, trustBadges: [], eyebrow: "", trustText: "", image: "/hero_test_image.png" },
        credibility: content.credibility || { title: "", stats: [], partners: { title: "", logos: [] } },
        objectives: content.objectives || { title: "", subtitle: "", cards: [] },
        howItWorks: content.howItWorks || { title: "", subtitle: "", steps: [] },
        about: content.about || { title: "", subtitle: "", image: "/hero_test_image.png", text: "", highlights: [], founderName: "", founderRole: "", badge: "", quote: "", metrics: [] },
        comparison: content.comparison || { title: "", subtitle: "", headers: [], rows: [], disclaimer: "", tag: "", savingsText: "", ctaText: "" },
        simulator: content.simulator || { title: "", subtitle: "", objectives: [], creditRanges: [], installmentRanges: [], calc: { adminRate: 0, reductionFactor: 0, creditMin: 0, creditMax: 0, creditStep: 0, creditDefault: 0, prazoOptions: [], prazoDefault: 0, badges: [], ctaText: "", privacyText: "", plans: [] } },
        videos: content.videos || { title: "", subtitle: "", tag: "", items: [] },
        testimonials: content.testimonials || { title: "", subtitle: "", tag: "", items: [] },
        security: content.security || { title: "", subtitle: "", tag: "", points: [] },
        faq: content.faq || { title: "", subtitle: "", tag: "", items: [] },
        finalCta: content.finalCta || { title: "", subtitle: "", ctaWhatsapp: "", ctaForm: "", tag: "", privacyText: "", objectives: [], creditOptions: [] },
        footer: content.footer || { description: "", legal: "", privacyPolicy: "", terms: "", navLinks: [], productLinks: [] },
        promoBanner: {
          slides: Array.isArray(content.promoBanner?.slides) && content.promoBanner.slides.length > 0 
            ? content.promoBanner.slides 
            : [{ src: "/hero_test_image.png", alt: "Promoção", type: "image" }],
          ctaText: content.promoBanner?.ctaText || "",
          ctaHref: content.promoBanner?.ctaHref || ""
        },
        cardapio: content.cardapio || { title: "", subtitle: "", items: [], ctaText: "" },
        news: content.news || { title: "", subtitle: "", items: [] },
      },
    };
  },


  toDatabase(siteConfig: SiteConfig, content: Content): { config: any; content: any } {
    const { sectionOrder, formFields, ...restConfig } = siteConfig;
    
    // The previous implementation was trying to save 'section_order', 'form_fields', and 'hide_brand_name'
    // as top-level columns, but these columns don't exist in the database table.
    // In Supabase/PostgREST, sending extra fields that don't match columns results in a 400 error.
    
    // We only send the fields that we know exist as columns.
    // Based on the DB structure, most configurations are stored within JSONB objects.
    const dbConfig: any = {
      brand: restConfig.brand,
      contact: restConfig.contact,
      page: restConfig.page,
      scripts: restConfig.scripts,
      social: restConfig.social,
      seo: restConfig.seo,
      sections: restConfig.sections,
      theme: restConfig.theme,
      // We keep section_order and form_fields if they are indeed columns, 
      // but let's check the error again: it specifically complained about 'hide_brand_name'.
      // Looking at the read_query result, 'form_fields' and 'section_order' ARE columns.
      section_order: sectionOrder,
      form_fields: formFields,
    };

    return {
      config: dbConfig,
      content,
    };
  },
};
