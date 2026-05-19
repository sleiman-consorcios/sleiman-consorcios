import { useEffect } from "react";
import type { SiteConfig } from "@/types";

/**
 * Aplica SEO, favicon, GTM e Meta Pixel a partir do siteConfig.
 * Não roda em /admin (controlado pelo prop `enabled`).
 * Garante idempotência: marca elementos com data-seo-managed para evitar duplicação.
 */
export function SeoManager({ siteConfig, enabled = true }: { siteConfig: SiteConfig | null; enabled?: boolean }) {
  useEffect(() => {
    if (!enabled || !siteConfig) return;

    const { seo, brand, scripts } = siteConfig;

    // Title
    if (seo.title) document.title = seo.title;

    // Meta tags
    upsertMeta("name", "description", seo.description);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    upsertMeta("name", "keywords", `${brand.name}, consórcio, simulação de consórcio, consórcio imobiliário, consórcio de veículos, planejamento patrimonial`);
    if (seo.ogImage) upsertMeta("property", "og:image", absoluteUrl(seo.ogImage));
    if (seo.ogUrl) upsertMeta("property", "og:url", seo.ogUrl);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    if (seo.ogImage) upsertMeta("name", "twitter:image", absoluteUrl(seo.ogImage));

    // Canonical
    if (seo.canonical) upsertLink("canonical", seo.canonical);

    // Favicon
    if (brand.favicon) {
      upsertLink("icon", brand.favicon, inferIconType(brand.favicon));
    }

    // JSON-LD Structured Data
    injectJsonLd(siteConfig);

    // GTM
    if (scripts.gtmId) injectGtm(scripts.gtmId);

    // Meta Pixel
    if (scripts.metaPixelId) injectMetaPixel(scripts.metaPixelId);
  }, [enabled, siteConfig]);

  return null;
}

function absoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).toString();
}

function upsertMeta(attr: "name" | "property", key: string, value: string | undefined): void {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("data-seo-managed", "1");
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel: string, href: string, type?: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-seo-managed", "1");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  if (type) el.setAttribute("type", type);
}

function inferIconType(url: string): string | undefined {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "svg") return "image/svg+xml";
  if (ext === "png") return "image/png";
  if (ext === "ico") return "image/x-icon";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return undefined;
}

function injectGtm(gtmId: string): void {
  if (document.querySelector(`script[data-gtm="${gtmId}"]`)) return;
  const s = document.createElement("script");
  s.dataset.gtm = gtmId;
  s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
  document.head.appendChild(s);
  // noscript iframe
  if (!document.querySelector(`noscript[data-gtm="${gtmId}"]`)) {
    const ns = document.createElement("noscript");
    ns.dataset.gtm = gtmId;
    ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.prepend(ns);
  }
}

function injectMetaPixel(pixelId: string): void {
  if (document.querySelector(`script[data-fbq="${pixelId}"]`)) return;
  const s = document.createElement("script");
  s.dataset.fbq = pixelId;
  s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
  document.head.appendChild(s);
}

function injectJsonLd(config: SiteConfig): void {
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) existing.remove();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": config.brand.name,
    "description": config.seo.description,
    "url": window.location.origin,
    "logo": absoluteUrl(config.brand.logo),
    "image": absoluteUrl(config.seo.ogImage),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.contact.address || "",
      "addressLocality": config.contact.region || "",
      "addressCountry": "BR"
    },
    "telephone": config.contact.whatsapp,
    "areaServed": "BR",
    "serviceType": "Consórcio",
    "sameAs": [
      config.social?.instagram,
      config.social?.facebook,
      config.social?.linkedin,
      config.social?.youtube
    ].filter(Boolean)
  };

  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.text = JSON.stringify(jsonLd);
  document.head.appendChild(s);
}
