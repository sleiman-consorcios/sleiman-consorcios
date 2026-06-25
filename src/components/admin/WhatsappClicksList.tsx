import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";

type Click = {
  id: string;
  name: string | null;
  message: string | null;
  traffic_source: string | null;
  created_at: string;
  click_number: number;
};

interface Props {
  dateStart?: string;
  dateEnd?: string;
}

export function WhatsappClicksList({ dateStart, dateEnd }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clicks, setClicks] = useState<Click[]>([]);

  const fetchClicks = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("whatsapp_clicks")
        .select("id, name, message, traffic_source, created_at, click_number")
        .order("created_at", { ascending: false })
        .limit(500);

      if (dateStart) q = q.gte("created_at", startOfDay(new Date(dateStart)).toISOString());
      if (dateEnd) q = q.lte("created_at", endOfDay(new Date(dateEnd)).toISOString());

      const { data, error } = await q;
      if (error) throw error;
      setClicks((data || []) as Click[]);
    } catch (err: any) {
      toast.error("Erro ao carregar cliques: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleClearAll = async () => {
    if (!confirm("Apagar TODOS os registros de cliques do WhatsApp? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("whatsapp_clicks")
        .delete()
        .not("id", "is", null);
      if (error) throw error;
      setClicks([]);
      toast.success("Registros de cliques apagados.");
    } catch (err: any) {
      toast.error("Erro ao apagar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Apagar este registro de clique?")) return;
    try {
      const { error } = await supabase.from("whatsapp_clicks").delete().eq("id", id);
      if (error) throw error;
      setClicks((prev) => prev.filter((c) => c.id !== id));
      toast.success("Registro apagado.");
    } catch (err: any) {
      toast.error("Erro ao apagar: " + err.message);
    }
  };

  useEffect(() => {
    if (open) fetchClicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateStart, dateEnd]);

  const buttonClicks = clicks.filter((c) => c.click_number === 1).length;
  const nameSubmitted = clicks.filter((c) => c.click_number >= 2).length;
  const abandonRate =
    buttonClicks > 0 ? Math.round(((buttonClicks - nameSubmitted) / buttonClicks) * 100) : 0;

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-bold text-slate-900">Cliques no botão WhatsApp</h3>
          <p className="text-xs text-slate-500 mt-1">
            Clicaram no botão: <strong>{buttonClicks}</strong> · Informaram o nome e seguiram:{" "}
            <strong>{nameSubmitted}</strong> · Abandono (objeção):{" "}
            <strong>{abandonRate}%</strong>
          </p>
        </div>
        <div className="flex gap-2">
          {open && (
            <>
              <Button size="sm" variant="outline" onClick={fetchClicks} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={handleClearAll}
                disabled={loading || clicks.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {open ? "Ocultar" : "Ver detalhes"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : clicks.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              Nenhum clique registrado no período.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Clique</TableHead>
                  <TableHead>Tráfego</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clicks.map((c) => {
                  const d = new Date(c.created_at);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>{format(d, "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {format(d, "HH:mm:ss")}
                      </TableCell>
                      <TableCell>{c.name || <span className="text-slate-400">—</span>}</TableCell>
                      <TableCell>
                        <Badge variant={c.click_number === 1 ? "secondary" : "default"}>
                          {c.click_number === 1 ? "Clicou no botão" : "Informou nome"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {c.traffic_source || "direct"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => handleDeleteOne(c.id)}
                          title="Apagar este registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
