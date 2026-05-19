import { SiteConfig, Content } from "@/types";

export const siteDataMapper = {
  toFrontend(dbConfig: any, dbContent: any): { siteConfig: SiteConfig; content: Content } {
    return {
      siteConfig: {
        ...dbConfig,
        brand: {
          ...dbConfig.brand,
          hideName: dbConfig.hide_brand_name ?? dbConfig.brand?.hideName,
        },
        sectionOrder: dbConfig.section_order,
        formFields: dbConfig.form_fields || dbConfig.formFields,
      },
      content: dbContent,
    };
  },

  toDatabase(siteConfig: SiteConfig, content: Content): { config: any; content: any } {
    const { sectionOrder, formFields, ...restConfig } = siteConfig;
    return {
      config: {
        ...restConfig,
        section_order: sectionOrder,
        form_fields: formFields,
        hide_brand_name: siteConfig.brand?.hideName,
      },
      content,
    };
  },
};
