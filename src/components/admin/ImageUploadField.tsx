import { useState, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { useAdminContext } from "./AdminContext";
import { resizeImageFile, getImageConstraints } from "@/utils/image";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  previewHeight?: string;
  /** contexto da imagem: hero | about | logos | partners | testimonials | banners | cardapio | videos | brand | upload */
  folder?: string;
  /** Se true, permite selecionar vários arquivos */
  multiple?: boolean;
  onUploadMultiple?: (paths: string[]) => void;
}

export function ImageUploadField({ 
  label, value, onChange, hint, previewHeight = "h-16", 
  folder = "upload", multiple = false, onUploadMultiple 
}: Props) {
  const ctx = useAdminContext();
  const isLegacyBase64 = value.startsWith("data:");
  const initialMode: "upload" | "url" = value && !isLegacyBase64 && value.length > 0 ? "url" : "upload";
  const [mode, setMode] = useState<"upload" | "url">(initialMode);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<{ original: number; optimized: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setProcessing(true);
    setStats(null);
    
    try {
      const uploadedPaths: string[] = [];
      const constraints = getImageConstraints(folder);
      
      for (const file of files) {
        const isVideo = file.type.startsWith("video/mp4") || file.name.toLowerCase().endsWith(".mp4");
        const isImage = file.type.startsWith("image/");
        
        if (!isImage && !isVideo) continue;
        if (file.size > 25 * 1024 * 1024) continue;

        if (isVideo) {
          // Video upload without resizing
          const result = await ctx.uploadAsset(file, folder);
          uploadedPaths.push(result.publicUrl || result.path);
          continue;
        }

        // Resize and optimize image
        const optimizedDataUrl = await resizeImageFile(file, constraints);
        
        // Prepare for real upload
        const dataRes = await fetch(optimizedDataUrl);
        const blob = await dataRes.blob();
        
        // Ensure matching extension
        const typeMapping: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
          'image/svg+xml': 'svg'
        };
        const extension = typeMapping[blob.type] || 'jpg';
        const safeName = file.name.split(".")[0].replace(/[^a-z0-9]/gi, "-") + "." + extension;
        const optimizedFile = new File([blob], safeName, { type: blob.type });

        // Upload
        const result = await ctx.uploadAsset(optimizedFile, folder);
        uploadedPaths.push(result.publicUrl || result.path);
      }

      if (uploadedPaths.length > 0) {
        if (multiple && onUploadMultiple) {
          onUploadMultiple(uploadedPaths);
        } else {
          onChange(uploadedPaths[0]);
          setMode("url");
        }
        toast.success(uploadedPaths.length > 1 ? `${uploadedPaths.length} imagens enviadas` : "Imagem enviada");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar imagem.";
      toast.error("Falha no upload", { description: msg });
      console.error(err);
    } finally {
      setProcessing(false);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{label}</Label>
      {hint && <p className="text-[11px] text-slate-400 mb-2">{hint}</p>}

      {isLegacyBase64 && (
        <div className="flex items-start gap-2 p-2 rounded-md border border-accent/30 bg-accent/10 text-[11px] text-foreground">
          <AlertTriangle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <p>
            Esta imagem está armazenada de forma antiga (embutida no JSON). Reenvie o arquivo para
            convertê-la em um upload real e tornar a página mais leve.
          </p>
        </div>
      )}

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
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,video/mp4"
            onChange={handleFile}
            multiple={multiple}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || processing}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileRef.current?.click(); }}
            className="w-full gap-2 border-dashed h-10"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Otimizando...
              </>
            ) : uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {multiple ? "Escolher arquivos" : "Escolher arquivo"}
              </>
            )}
          </Button>
          
          {stats && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
              <Info className="w-3 h-3" />
              <span>Original: {formatSize(stats.original)}</span>
              <span className="text-primary font-medium">→ Otimizada: {formatSize(stats.optimized)}</span>
            </div>
          )}
        </div>
      ) : (
        <Input
          placeholder="/upload/... ou https://exemplo.com/imagem.jpg"
          value={isLegacyBase64 ? "" : value}
          onChange={e => {
            const val = e.target.value;
            if (val === "" || val.startsWith("http") || val.startsWith("/") || val.startsWith("data:image")) {
              onChange(val);
            }
          }}
          className="text-sm"
        />
      )}

      {value && !multiple && (
        <div className="relative inline-block mt-2">
          {value.toLowerCase().endsWith(".mp4") ? (
            <video
              src={value}
              className={`${previewHeight} w-auto rounded-lg border border-border object-contain bg-muted [image-rendering:auto] [transform:translateZ(0)]`}
              controls
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className={`${previewHeight} w-auto rounded-lg border border-border object-contain bg-muted`}
              onError={e => { 
                (e.target as HTMLImageElement).src = "/placeholder.svg";
                toast.error("Erro ao carregar preview", { description: "A URL pode estar incorreta ou o arquivo não é suportado." });
              }}
            />
          )}
          <button
            type="button"
            onClick={() => {
              onChange("");
              setStats(null);
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!value && !uploading && !processing && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
          <ImageIcon className="w-3.5 h-3.5" />
          Nenhuma imagem selecionada
        </div>
      )}
    </div>
  );
}
