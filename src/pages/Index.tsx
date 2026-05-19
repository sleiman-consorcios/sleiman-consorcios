import { useEffect, useMemo } from "react";
import { useConfig } from "@/hooks/useConfig";
import { UnavailablePage } from "@/components/UnavailablePage";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import { SeoManager } from "@/components/SeoManager";
import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { Credibility } from "@/sections/Credibility";
import { Objectives } from "@/sections/Objectives";
import { HowItWorks } from "@/sections/HowItWorks";
import { About } from "@/sections/About";
import { Comparison } from "@/sections/Comparison";
import { Simulator } from "@/sections/Simulator";
import { Videos } from "@/sections/Videos";
import { Testimonials } from "@/sections/Testimonials";
import { Security } from "@/sections/Security";
import { FAQ } from "@/sections/FAQ";
import { FinalCta } from "@/sections/FinalCta";
import { Footer } from "@/sections/Footer";
import { PromoBanner } from "@/sections/PromoBanner";
import { Cardapio } from "@/sections/Cardapio";
import { News } from "@/sections/News";
import type { SectionKey } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";

const defaultSections = {
  hero: true, credibility: true, about: true, howItWorks: true,
  objectives: true, comparison: true, simulator: true, videos: true,
  testimonials: true, security: true, faq: true, finalCta: true,
  promoBanner: true, cardapio: true, news: true,
};

const Index = () => {
  const { siteConfig, content, loading, state } = useConfig();

  useEffect(() => {
    if (siteConfig?.theme) {
      document.documentElement.setAttribute("data-theme", siteConfig.theme);
    }
  }, [siteConfig?.theme]);

  const sectionOrder = useMemo(() => {
    const saved = siteConfig?.sectionOrder ?? DEFAULT_SECTION_ORDER;
    // Append any DEFAULT keys missing from saved order (handles new sections like cardapio)
    return [...saved, ...DEFAULT_SECTION_ORDER.filter(k => !saved.includes(k))];
  }, [siteConfig?.sectionOrder]);

  if (loading && (!siteConfig || !content)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white transition-opacity duration-300">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "error" || (!loading && (!siteConfig || !content))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <p className="text-muted-foreground">Erro ao carregar configuração. Por favor, recarregue a página.</p>
      </div>
    );
  }

  if (!siteConfig.page.active) {
    return (
      <UnavailablePage
        title={siteConfig.page.unavailableTitle}
        message={siteConfig.page.unavailableMessage}
        brandName={siteConfig.brand.name}
      />
    );
  }

  const s = { ...defaultSections, ...siteConfig.sections };

  const defaultCardapio = { title: "Nossos Produtos", subtitle: "Conheça nossas opções de consórcio", items: [], ctaText: "Realize seu sonho" };

  const sectionComponents: Record<SectionKey, React.ReactNode> = {
    hero: <Hero content={content.hero} config={siteConfig} simulatorCalc={content.simulator.calc} />,
    promoBanner: content.promoBanner ? <PromoBanner content={content.promoBanner} /> : null,
    credibility: <Credibility content={content.credibility} />,
    about: <About content={content.about} />,
    howItWorks: <HowItWorks content={content.howItWorks} />,
    objectives: <Objectives content={content.objectives} />,
    comparison: <Comparison content={content.comparison} />,
    cardapio: <Cardapio content={content.cardapio} />,
    simulator: <Simulator content={content.simulator} config={siteConfig} webhookUrl={siteConfig.webhookUrl} />,
    videos: <Videos content={content.videos} />,
    testimonials: <Testimonials content={content.testimonials} />,
    security: <Security content={content.security} />,
    faq: <FAQ content={content.faq} />,
    finalCta: <FinalCta content={content.finalCta} config={siteConfig} />,
    news: <News content={content.news} />,
  };

  return (
    <div className="min-h-screen bg-warm-white text-foreground pt-16">
      <SeoManager siteConfig={siteConfig} />
      <Header nav={content.nav} config={siteConfig} />
      {sectionOrder.map(key => s[key] ? <div key={key}>{sectionComponents[key]}</div> : null)}
      <Footer content={content.footer} config={siteConfig} />
      {(siteConfig.contact.showWhatsappFloating ?? true) && (
        <WhatsAppFloating phone={siteConfig.contact.whatsapp} message={siteConfig.contact.whatsappMessage} />
      )}
    </div>
  );
};

export default Index;
