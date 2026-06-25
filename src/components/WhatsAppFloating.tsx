import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { handleWhatsAppRedirect } from "@/utils/whatsapp";
import { getTrafficSource } from "@/utils/tracking";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WhatsAppFloating({ phone, message }: { phone: string; message?: string }) {
  const defaultMessage = message || "Olá, vim pelo site e gostaria de mais informações.";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function registerClick(userName: string | null, clickNumber: number) {
    try {
      await supabase.from("whatsapp_clicks").insert({
        name: userName,
        message: defaultMessage,
        traffic_source: getTrafficSource(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        click_number: clickNumber,
      });
    } catch (err) {
      console.warn("[WhatsApp] Falha ao registrar clique:", err);
    }
  }

  function handleClick() {
    // 1) Sempre registra o clique no botão (intenção) — anônimo
    void registerClick(null, 1);
    // Sempre pede o nome antes de redirecionar para o WhatsApp
    setName("");
    setOpen(true);
  }

  function buildPersonalizedMessage(userName: string) {
    return `Olá, meu nome é ${userName}. ${defaultMessage}`;
  }

  function handleSubmitName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // 2) Conclusão: usuário informou o nome e seguiu para o WhatsApp
    void registerClick(trimmed, 2);
    setOpen(false);
    handleWhatsAppRedirect(phone, buildPersonalizedMessage(trimmed));
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-full bg-whatsapp flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.5)] transition-all animate-float-pulse"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Antes de continuar</DialogTitle>
            <DialogDescription>
              Como podemos te chamar? Você será direcionado ao WhatsApp em seguida.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitName} className="space-y-4">
            <Input
              autoFocus
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Ir para o WhatsApp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
