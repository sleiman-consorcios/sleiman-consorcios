import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

export function ImageUploadField({ label, value, onChange, hint }: Props) {
  const [mode, setMode] = useState<"upload" | "url">(value && !value.startsWith("data:") && value.length > 0 ? "url" : "upload");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo: 20MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground block">{label}</Label>
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}

      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${mode === "upload" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
        >
          <Upload className="w-3 h-3 inline mr-1" />Enviar arquivo
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${mode === "url" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
        >
          <LinkIcon className="w-3 h-3 inline mr-1" />Colar link
        </button>
      </div>

      {mode === "upload" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }} />
          <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileRef.current?.click(); }} className="w-full gap-2 border-dashed h-10">
            <Upload className="w-4 h-4" />
            Escolher imagem
          </Button>
        </div>
      ) : (
        <Input
          placeholder="https://exemplo.com/imagem.jpg"
          value={value.startsWith("data:") ? "" : value}
          onChange={e => onChange(e.target.value)}
          className="text-sm"
        />
      )}

      {value && (
        <div className="relative inline-block mt-2">
          <img
            src={value}
            alt="Preview"
            className="h-16 w-auto rounded-lg border border-border object-contain bg-muted"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!value && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
          <ImageIcon className="w-3.5 h-3.5" />
          Nenhuma imagem selecionada
        </div>
      )}
    </div>
  );
}
