import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}

export function NumberField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</Label>
      <Input type="number" step={step || 1} value={value} onChange={e => onChange(Number(e.target.value))} className="text-sm" />
    </div>
  );
}

export function TextareaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</Label>
      <Textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className="text-sm" />
    </div>
  );
}
