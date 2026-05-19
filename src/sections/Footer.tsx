import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import type { FooterContent, SiteConfig } from "@/types";

interface Props { content: FooterContent; config: SiteConfig }

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12z"/></svg>
);

export function Footer({ content, config }: Props) {
  const social = config.social || {};
  const socials = [
    { url: social.instagram, Icon: Instagram, label: "Instagram" },
    { url: social.facebook, Icon: Facebook, label: "Facebook" },
    { url: social.tiktok, Icon: TikTokIcon, label: "TikTok" },
    { url: social.youtube, Icon: Youtube, label: "YouTube" },
    { url: social.linkedin, Icon: Linkedin, label: "LinkedIn" },
  ].filter(s => s.url && s.url.trim() !== "");
  return (
    <footer className="bg-[#080F18] pt-14 pb-8 px-4 sm:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center font-heading text-lg font-bold text-midnight">S</div>
              <span className="font-heading text-lg font-semibold text-white">{config.brand.name}</span>
            </div>
            <p className="text-[14px] text-white/40 leading-[1.7] max-w-[260px]">{content.description}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {socials.map(({ url, Icon, label }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-gold hover:text-midnight text-white/60 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-gold mb-4">Navegação</p>
            <ul className="space-y-2.5">
              {(content.navLinks || ["Como funciona", "Vantagens", "Produtos", "FAQ"]).map((link, i) => (
                <li key={i}><a href="#" className="text-[14px] text-white/45 hover:text-gold transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-gold mb-4">Produtos</p>
            <ul className="space-y-2.5">
              {(content.productLinks || ["Consórcio de Imóvel", "Consórcio de Veículo"]).map((link, i) => (
                <li key={i}><a href="#" className="text-[14px] text-white/45 hover:text-gold transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-gold mb-4">Contato</p>
            <ul className="space-y-2.5">
              <li className="text-[14px] text-white/45">📱 {config.contact.whatsappDisplay}</li>
              <li className="text-[14px] text-white/45">✉️ {config.contact.email}</li>
              <li className="text-[14px] text-white/45">📍 {config.contact.region}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-white/25 gap-2">
          <span>© {new Date().getFullYear()} {config.brand.name}</span>
          <span>Política de Privacidade · Regulamentado pelo Banco Central</span>
        </div>
      </div>
    </footer>
  );
}
