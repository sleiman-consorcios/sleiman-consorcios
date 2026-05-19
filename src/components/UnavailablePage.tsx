import { Shield } from "lucide-react";

interface Props { title: string; message: string; brandName: string }

export function UnavailablePage({ title, message, brandName }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-medium text-foreground">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">{message}</p>
        <p className="text-xs text-muted-foreground/60">{brandName}</p>
      </div>
    </div>
  );
}
