import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/utils/whatsapp";

export function WhatsAppFloating({ phone }: { phone: string }) {
  return (
    <a
      href={buildWhatsAppUrl(phone, "Olá, vim pelo site e gostaria de mais informações.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-full bg-whatsapp flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.5)] transition-all animate-float-pulse"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}
