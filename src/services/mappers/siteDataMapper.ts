import { SiteConfig, Content } from "@/types";

export const siteDataMapper = {
  toFrontend(dbConfig: any, dbContent: any): { siteConfig: SiteConfig; content: Content } {
    return {
      siteConfig: {
        ...dbConfig,
        brand: {
          ...dbConfig.brand,
          hideName: dbConfig.brand?.hideName,
        },
        sectionOrder: dbConfig.section_order,
        formFields: dbConfig.form_fields || dbConfig.formFields,
      },
      content: dbContent,
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
