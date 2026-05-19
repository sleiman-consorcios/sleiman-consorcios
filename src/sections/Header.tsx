import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import type { NavItem, SiteConfig } from "@/types";

interface Props { nav: NavItem[]; config: SiteConfig }

export function Header({ nav, config }: Props) {
  const [open, setOpen] = useState(false);
  const wpUrl = buildWhatsAppUrl(config.contact.whatsapp, "Olá, vim pelo site e gostaria de mais informações.");

  function scrollTo(href: string) {
    setOpen(false);
    if (href === "whatsapp") { window.open(wpUrl, "_blank"); return; }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" onClick={() => scrollTo("#inicio")} className="flex items-center gap-2.5">
          {config.brand.logo ? (
            <img src={config.brand.logo} alt={config.brand.name} className="h-8" />
          ) : (
            <>
              <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center font-heading text-lg font-bold text-midnight">S</div>
              <span className="font-heading text-xl font-semibold text-white">Sleiman <span className="text-gold">Consórcios</span></span>
            </>
          )}
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {nav.map(item => (
            <button key={item.href} onClick={() => scrollTo(item.href)} className="text-sm text-white/70 hover:text-gold transition-colors">{item.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => scrollTo("#simulacao")} className="hidden sm:inline-flex gap-2 bg-gold hover:bg-gold-light text-midnight font-semibold rounded-md">
            Simular grátis
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
              <button key={item.href} onClick={() => scrollTo(item.href)} className="text-left py-3 px-3 rounded-md text-sm text-white/70 hover:text-gold hover:bg-white/5 transition-colors">{item.label}</button>
            ))}
            <Button onClick={() => { setOpen(false); scrollTo("#simulacao"); }} className="mt-2 gap-2 bg-gold hover:bg-gold-light text-midnight font-semibold">
              Simular grátis
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
