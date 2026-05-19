import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Field({ 
  label, 
  value, 
  onChange, 
  className, 
  hint 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  className?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help hover:text-gold transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs bg-midnight text-white border-none shadow-xl">
                <p>{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-gold/20 focus:border-gold transition-all h-10 rounded-lg" 
      />
    </div>
  );
}

const formatCurrency = (v: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
};

export function NumberField({ 
  label, 
  value, 
  onChange, 
  step, 
  isCurrency,
  hint
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
  step?: number; 
  isCurrency?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-semibold text-midnight/70 uppercase tracking-wider">{label}</Label>
          {hint && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-gold transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs bg-midnight text-white border-none shadow-xl">
                  <p>{hint}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {isCurrency && (
          <span className="text-[10px] sm:text-xs font-bold text-gold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/20 shadow-sm truncate max-w-[140px] sm:max-w-none">
            {formatCurrency(value)}
          </span>
        )}
      </div>
      <Input 
        type="number" 
        step={step || 1} 
        value={value} 
        onChange={e => onChange(Number(e.target.value))} 
        className={`text-sm bg-white border-[#EDE8DC] focus-visible:ring-gold focus-visible:border-gold transition-all ${isCurrency ? "border-gold/30" : ""}`} 
      />
    </div>
  );
}

export function TextareaField({ 
  label, 
  value, 
  onChange, 
  rows = 3,
  hint 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Label className="text-xs font-semibold text-midnight/70 uppercase tracking-wider">{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-gold transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs bg-midnight text-white border-none shadow-xl">
                <p>{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Textarea 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        rows={rows} 
        className="text-sm sm:text-base bg-white border-[#EDE8DC] focus-visible:ring-gold focus-visible:border-gold transition-all py-2" 
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Label className="text-xs font-semibold text-midnight/70 uppercase tracking-wider">{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-gold transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs bg-midnight text-white border-none shadow-xl">
                <p>{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-[#EDE8DC] bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateTimeField({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const dateValue = value ? value.split(' ')[0] : "";
  const timeValue = value ? value.split(' ')[1] || "" : "";

  const updateDate = (newDate: string) => {
    if (!newDate) {
      onChange("");
      return;
    }
    onChange(`${newDate} ${timeValue || "00:00"}`);
  };

  const updateTime = (newTime: string) => {
    if (!dateValue) return;
    onChange(`${dateValue} ${newTime}`);
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Label className="text-xs font-semibold text-midnight/70 uppercase tracking-wider">{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-gold transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs bg-midnight text-white border-none shadow-xl">
                <p>{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          type="date"
          value={dateValue}
          onChange={e => updateDate(e.target.value)}
          className="flex-[2] text-sm bg-white border-[#EDE8DC] focus-visible:ring-gold focus-visible:border-gold transition-all"
        />
        <Input
          type="time"
          value={timeValue}
          onChange={e => updateTime(e.target.value)}
          disabled={!dateValue}
          className="flex-1 text-sm bg-white border-[#EDE8DC] focus-visible:ring-gold focus-visible:border-gold transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export function CheckboxField({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={value}
          onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 text-gold border-[#EDE8DC] rounded focus:ring-gold focus:ring-offset-0 cursor-pointer"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-semibold text-midnight/70 uppercase tracking-wider cursor-pointer select-none" onClick={() => onChange(!value)}>
            {label}
          </Label>
          {hint && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-gold transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs bg-midnight text-white border-none shadow-xl">
                  <p>{hint}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
