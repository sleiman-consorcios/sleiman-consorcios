import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPhone, isValidPhone } from "@/utils/phone";
import { buildWhatsAppUrl, buildContactMessage } from "@/utils/whatsapp";
import { MessageCircle, Loader2 } from "lucide-react";
import type { SimulatorContent } from "@/types";

interface Props { content: SimulatorContent; whatsapp: string }

export function SimulatorForm({ content, whatsapp }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", objective: "", creditRange: "", installmentRange: "", hasLance: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Informe seu nome";
    if (!isValidPhone(form.phone)) e.phone = "Informe um WhatsApp válido";
    if (!form.objective) e.objective = "Selecione um objetivo";
    if (!form.creditRange) e.creditRange = "Selecione a faixa";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    setLoading(true);
    const msg = buildContactMessage({ name: form.name, phone: form.phone, objective: form.objective, creditRange: form.creditRange, installmentRange: form.installmentRange, hasLance: form.hasLance });
    window.open(buildWhatsAppUrl(whatsapp, msg), "_blank");
    setTimeout(() => { setLoading(false); setSent(true); }, 500);
  }

  if (sent) return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-whatsapp/10 flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-6 h-6 text-whatsapp" /></div>
      <p className="font-heading text-xl mb-1">Simulação enviada!</p>
      <p className="text-sm text-muted-foreground">O Farid retornará em breve com sua simulação personalizada.</p>
      <Button variant="outline" size="sm" onClick={() => setSent(false)} className="mt-4">Nova simulação</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input placeholder="Seu nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={errors.name ? "border-destructive" : ""} aria-label="Nome" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div>
          <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))} className={errors.phone ? "border-destructive" : ""} aria-label="WhatsApp" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
      </div>
      <Select value={form.objective} onValueChange={v => setForm(f => ({ ...f, objective: v }))}>
        <SelectTrigger className={errors.objective ? "border-destructive" : ""} aria-label="Objetivo"><SelectValue placeholder="Qual seu objetivo?" /></SelectTrigger>
        <SelectContent>{content.objectives.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
      {errors.objective && <p className="text-xs text-destructive mt-1">{errors.objective}</p>}
      <Select value={form.creditRange} onValueChange={v => setForm(f => ({ ...f, creditRange: v }))}>
        <SelectTrigger className={errors.creditRange ? "border-destructive" : ""} aria-label="Faixa de crédito"><SelectValue placeholder="Faixa de crédito" /></SelectTrigger>
        <SelectContent>{content.creditRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
      </Select>
      {errors.creditRange && <p className="text-xs text-destructive mt-1">{errors.creditRange}</p>}
      <Select value={form.installmentRange} onValueChange={v => setForm(f => ({ ...f, installmentRange: v }))}>
        <SelectTrigger aria-label="Parcela desejada"><SelectValue placeholder="Parcela desejada (opcional)" /></SelectTrigger>
        <SelectContent>{content.installmentRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={form.hasLance} onValueChange={v => setForm(f => ({ ...f, hasLance: v }))}>
        <SelectTrigger aria-label="Possui lance"><SelectValue placeholder="Possui valor para lance?" /></SelectTrigger>
        <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem><SelectItem value="Talvez">Talvez</SelectItem></SelectContent>
      </Select>
      <Button onClick={submit} disabled={loading} className="w-full gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        Enviar simulação via WhatsApp
      </Button>
    </div>
  );
}
