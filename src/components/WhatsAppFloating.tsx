import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/utils/whatsapp";

export function WhatsAppFloating({ phone, message }: { phone: string; message?: string }) {
  // Garantimos que a mensagem padrão venha do admin se disponível, 
  // caso contrário usamos um texto genérico amigável.
  const defaultMessage = message || "Olá, vim pelo site e gostaria de mais informações.";
  
  const whatsappUrl = buildWhatsAppUrl(phone, defaultMessage, true);

  return (
    <a
      href={whatsappUrl}
      target={whatsappUrl.startsWith("javascript:") ? "_self" : "_blank"}
      rel="noopener noreferrer"
      className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-full bg-whatsapp flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.5)] transition-all animate-float-pulse"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}
