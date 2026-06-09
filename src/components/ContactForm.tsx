import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPhone, isValidPhone, isWhatsApp } from "@/utils/phone";
import { buildWhatsAppUrl, buildContactMessage, handleWhatsAppRedirect } from "@/utils/whatsapp";
import { MessageCircle, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getTrafficSource } from "@/utils/tracking";
import { toast } from "sonner";

interface Props {
  whatsapp: string;
  objectives: string[];
  creditRanges: string[];
  ctaWhatsapp?: string;
  ctaForm?: string;
}

export function ContactForm({ whatsapp, objectives, creditRanges, ctaWhatsapp = "Enviar via WhatsApp", ctaForm }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", objective: "", creditRange: "", message: "", knowsConsortium: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingWhatsApp, setCheckingWhatsApp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Informe seu nome";
    if (!isValidPhone(form.phone)) e.phone = "Informe um WhatsApp válido";
    if (!form.objective) e.objective = "Selecione um objetivo";
    if (!form.creditRange) e.creditRange = "Selecione a faixa de crédito";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    
    setCheckingWhatsApp(true);
    const validWA = await isWhatsApp(form.phone);
    setCheckingWhatsApp(false);

    if (!validWA) {
      setErrors(prev => ({ ...prev, phone: "WhatsApp não encontrado ou inválido" }));
      return;
    }

    setIsVerified(true);
    setLoading(true);

    try {
      // Save lead to database
      const { data: lead, error } = await supabase.from("leads").insert([{
        name: form.name,
        phone: form.phone,
        objective: form.objective,
        credit: form.creditRange,
        message: form.message,
        knows_consortium: form.knowsConsortium,
        form_type: "footer_contact",
        traffic_source: getTrafficSource(),
        status: "sent"
      }]);

      if (error) {
        console.error("Erro ao salvar lead no banco:", error);
        // Mesmo com erro no banco, tentamos seguir com o WhatsApp
      } else {
        console.log("Lead registrado");
        // Trigger notification edge function manually
        try {
          await supabase.functions.invoke("send-lead-notification", {
            body: { 
              record: { 
                name: form.name,
                phone: form.phone,
                objective: form.objective,
                credit: form.creditRange,
                installment: "",
                message: form.message,
                knowsConsortium: form.knowsConsortium
              } 
            }
          });
        } catch (fnError) {
          console.error("Erro ao chamar função de notificação:", fnError);
        }
      }

      const msg = buildContactMessage({ 
        name: form.name, 
        phone: form.phone, 
        objective: form.objective, 
        creditRange: form.creditRange, 
        message: form.message,
        knowsConsortium: form.knowsConsortium
      });
      
      handleWhatsAppRedirect(whatsapp, msg);
      setSent(true);
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) return (
    <div className="text-center py-8 space-y-2">
      <div className="w-12 h-12 rounded-full bg-whatsapp/10 flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="w-6 h-6 text-whatsapp" />
      </div>
      <p className="font-heading text-xl">Mensagem enviada!</p>
      <p className="text-sm text-muted-foreground">O Farid retornará em breve.</p>
      <Button variant="outline" size="sm" onClick={() => setSent(false)} className="mt-4">Enviar outra</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <Input placeholder="Seu nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} aria-label="Nome" className={errors.name ? "border-destructive" : ""} />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>
      <div>
        <div className="relative">
          <Input 
            placeholder="(11) 99999-9999" 
            value={form.phone} 
            onChange={e => {
              setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
              setIsVerified(false);
            }} 
            aria-label="WhatsApp" 
            className={errors.phone ? "border-destructive pr-10" : "pr-10"} 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : isVerified ? <CheckCircle2 className="w-4 h-4 text-whatsapp" /> : null}
          </div>
        </div>
        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
      </div>
      <div>
        <Select value={form.objective} onValueChange={v => setForm(f => ({ ...f, objective: v }))}>
          <SelectTrigger className={errors.objective ? "border-destructive" : ""} aria-label="Objetivo"><SelectValue placeholder="Qual seu objetivo?" /></SelectTrigger>
          <SelectContent>{objectives.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
        {errors.objective && <p className="text-xs text-destructive mt-1">{errors.objective}</p>}
      </div>
      <div>
        <Select value={form.creditRange} onValueChange={v => setForm(f => ({ ...f, creditRange: v }))}>
          <SelectTrigger className={errors.creditRange ? "border-destructive" : ""} aria-label="Faixa de crédito"><SelectValue placeholder="Faixa de crédito desejada" /></SelectTrigger>
          <SelectContent>{creditRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        {errors.creditRange && <p className="text-xs text-destructive mt-1">{errors.creditRange}</p>}
      </div>
      <div>
        <Select value={form.knowsConsortium} onValueChange={v => setForm(f => ({ ...f, knowsConsortium: v }))}>
          <SelectTrigger aria-label="Conhece consórcio?"><SelectValue placeholder="Conhece consórcio?" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Sim">Sim, conheço</SelectItem>
            <SelectItem value="Não">Não, gostaria de entender</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea placeholder="Mensagem (opcional)" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} aria-label="Mensagem" />
      <Button onClick={submit} disabled={loading || checkingWhatsApp} className="w-full gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white">
        {loading || checkingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {checkingWhatsApp ? "Verificando WhatsApp..." : ctaWhatsapp}
      </Button>
    </div>
  );
}
