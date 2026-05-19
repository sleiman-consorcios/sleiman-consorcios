export type ThemeKey = "gold" | "blue" | "green" | "ice" | "pearl";

export interface SectionVisibility {
  hero: boolean; credibility: boolean; about: boolean; howItWorks: boolean;
  objectives: boolean; comparison: boolean; simulator: boolean; videos: boolean;
  testimonials: boolean; security: boolean; faq: boolean; finalCta: boolean;
  promoBanner: boolean; cardapio: boolean;
}

export type SectionKey = keyof SectionVisibility;

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "hero", "promoBanner", "credibility", "about", "howItWorks",
  "objectives", "comparison", "cardapio", "simulator", "videos",
  "testimonials", "security", "faq", "finalCta",
];

export interface SiteConfig {
  brand: { name: string; logo: string; favicon: string };
  contact: { whatsapp: string; whatsappDisplay: string; email: string; region: string };
  social?: { instagram?: string; facebook?: string; tiktok?: string; youtube?: string; linkedin?: string };
  seo: { title: string; description: string; ogImage: string; ogUrl: string; canonical: string };
  scripts: { gtmId: string; metaPixelId: string; additionalHeadScripts: string; additionalBodyScripts: string };
  page: { active: boolean; unavailableTitle: string; unavailableMessage: string };
  webhookUrl: string;
  theme: ThemeKey;
  sections: SectionVisibility;
  sectionOrder?: SectionKey[];
}

export interface NavItem { label: string; href: string }
export interface CTA { text: string; href: string }

export interface HeroContent {
  image: string; headline: string; subheadline: string;
  ctaPrimary: CTA; ctaSecondary: CTA; trustBadges: string[];
  eyebrow: string; trustText: string;
}

export interface StatItem { icon: string; value: string; label: string }
export interface PartnerLogo { name: string; image: string }
export interface CredibilityContent {
  title: string; stats: StatItem[];
  partners: { title: string; logos: PartnerLogo[] };
}

export interface ObjectiveCard { icon: string; title: string; description: string; cta: string }
export interface ObjectivesContent { title: string; subtitle: string; cards: ObjectiveCard[] }

export interface Step { icon: string; number: string; title: string; description: string }
export interface HowItWorksContent { title: string; subtitle: string; steps: Step[] }

export interface AboutContent {
  title: string; subtitle: string; image: string; text: string; highlights: string[];
  founderName: string; founderRole: string; badge: string;
  quote: string; metrics: { value: string; label: string }[];
}

export interface ComparisonRow { feature: string; consortium: string; financing: string }
export interface ComparisonContent {
  title: string; subtitle: string; headers: string[];
  rows: ComparisonRow[]; disclaimer: string;
  tag: string; savingsText: string; ctaText: string;
}

export interface SimulatorPlan {
  creditValue: number;
  installment: number;
  interestRate: number;
}

export interface SimulatorCalc {
  adminRate: number;
  reductionFactor: number;
  creditMin: number;
  creditMax: number;
  creditStep: number;
  creditDefault: number;
  vehicleMaxCredit: number;
  prazoOptions: { value: number; label: string }[];
  prazoDefault: number;
  badges: string[];
  ctaText: string;
  privacyText: string;
  plans: SimulatorPlan[];
}

export interface SimulatorContent {
  title: string; subtitle: string;
  objectives: string[]; creditRanges: string[]; installmentRanges: string[];
  calc: SimulatorCalc;
}

export interface VideoItem { title: string; description: string; thumbnail: string; url: string; tag: string }
export interface VideosContent { title: string; subtitle: string; tag: string; items: VideoItem[] }

export interface TestimonialItem { name: string; role: string; text: string; rating: number; image: string; city: string }
export interface TestimonialsContent { title: string; subtitle: string; tag: string; items: TestimonialItem[] }

export interface SecurityPoint { icon: string; title: string; description: string }
export interface SecurityContent { title: string; subtitle: string; points: SecurityPoint[] }

export interface FAQItem { question: string; answer: string }
export interface FAQContent { title: string; subtitle: string; items: FAQItem[] }

export interface FinalCtaContent { title: string; subtitle: string; ctaWhatsapp: string; ctaForm: string; tag: string; privacyText: string; objectives: string[]; creditOptions: string[] }
export interface FooterContent { description: string; legal: string; privacyPolicy: string; terms: string; navLinks: string[]; productLinks: string[] }

export interface PromoBannerSlide { image: string; alt: string }
export interface PromoBannerContent { slides: PromoBannerSlide[]; ctaText: string; ctaHref: string; image?: string; alt?: string }

export interface CardapioItem { image: string; title: string; installmentText: string }
export interface CardapioContent { title: string; subtitle: string; items: CardapioItem[]; ctaText: string }

export interface Content {
  nav: NavItem[]; hero: HeroContent; credibility: CredibilityContent;
  objectives: ObjectivesContent; howItWorks: HowItWorksContent; about: AboutContent;
  comparison: ComparisonContent; simulator: SimulatorContent; videos: VideosContent;
  testimonials: TestimonialsContent; security: SecurityContent; faq: FAQContent;
  finalCta: FinalCtaContent; footer: FooterContent; promoBanner: PromoBannerContent;
  cardapio: CardapioContent;
}

export interface AdminConfig { password: string; sessionDurationMinutes: number }
