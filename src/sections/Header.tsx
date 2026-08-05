import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import type { NavItem, SiteConfig } from "@/types";
import { handleAssetError } from "@/lib/assetUrl";

interface Props { nav: NavItem[]; config: SiteConfig }

/**
 * Helper to safely scroll to a section or navigate.
 */
export function safeScrollTo(href: string, whatsappUrl?: string) {
  if (href === "whatsapp" && whatsappUrl) {
    if (whatsappUrl.startsWith("javascript:")) {
      const code = whatsappUrl.replace("javascript:", "");
      new Function(code)();
    } else {
      window.open(whatsappUrl, "_blank");
    }
    return;
  }
  
  if (href.startsWith("#")) {
    try {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn(`Section ${href} not found`);
      }
    } catch (e) {
      console.error(`Invalid selector: ${href}`, e);
    }
  } else if (href.startsWith("http")) {
    window.open(href, "_blank");
  } else if (href.startsWith("/")) {
    window.location.href = href;
  }
}

export function Header({ nav, config }: Props) {
  const [open, setOpen] = useState(false);
  const wpUrl = buildWhatsAppUrl(config.contact.whatsapp, config.contact.whatsappMessage || "Olá, vim pelo site e gostaria de mais informações.");

  function handleNav(href: string) {
    setOpen(false);
    safeScrollTo(href, wpUrl);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" onClick={(e) => { e.preventDefault(); handleNav("#inicio"); }} className="flex items-center gap-3 group">
          <div className="flex items-center gap-3">
            {config.brand.logo ? (
              <img 
                src={config.brand.logo} 
                alt={config.brand.name} 
                className="h-10 w-auto object-contain" 
                onError={(e) => { if (!handleAssetError(e)) (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
              />
            ) : (
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center font-heading text-xl font-bold text-midnight shadow-lg shadow-gold/20">S</div>
            )}
            {!config.brand.hideName && (
              <div className="flex flex-col -gap-1">
                <span className="font-heading text-lg font-bold text-white leading-tight tracking-[0.05em] uppercase group-hover:text-gold transition-colors">
                  {config.brand.name.split(' ')[0] || "Sleiman"}
                </span>
                <span className="font-body text-[10px] font-bold text-gold/80 leading-tight tracking-[0.2em] uppercase">
                  {config.brand.name.split(' ').slice(1).join(' ') || "Consórcios"}
                </span>
              </div>
            )}
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {nav.map(item => (
            <button key={item.href} onClick={() => handleNav(item.href)} className="text-sm text-white/70 hover:text-gold transition-colors">{item.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => handleNav("#simulacao")} className="hidden sm:inline-flex gap-2 bg-gold hover:bg-gold-light text-midnight font-semibold rounded-md">
            {config.brand.headerCta || "Simular grátis"}
          </Button>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white" aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-midnight border-b border-white/10">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {nav.map(item => (
              <button key={item.href} onClick={() => handleNav(item.href)} className="text-left py-3 px-3 rounded-md text-sm text-white/70 hover:text-gold hover:bg-white/5 transition-colors">{item.label}</button>
            ))}
            <Button onClick={() => { setOpen(false); handleNav("#simulacao"); }} className="mt-2 gap-2 bg-gold hover:bg-gold-light text-midnight font-semibold">
              {config.brand.headerCta || "Simular grátis"}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

