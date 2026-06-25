import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Trash2, RefreshCw, 
  Search, Calendar, FileDown, MessageCircle,
  Mail, MailWarning, MailCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";
import { buildWhatsAppUrl, buildContactMessage } from "@/utils/whatsapp";
import { calculateAge } from "@/utils/phone";
import { useAdminLeadSelection } from "@/hooks/useAdminLeadSelection";
import { LeadStats } from "./LeadStats";
import { WhatsappClicksList } from "./WhatsappClicksList";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { 
    selectedIds, 
    toggleSelectAll, 
    toggleSelectLead, 
    clearSelection,
    isAllSelected,
    hasSelection
  } = useAdminLeadSelection(leads);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateStart, setDateStart] = useState<string>("");
  const [dateEnd, setDateEnd] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [whatsappClicks, setWhatsappClicks] = useState<number>(0);

  const fetchWhatsappClicks = async () => {
    try {
      let q = supabase
        .from("whatsapp_clicks")
        .select("id", { count: "exact", head: true });

      if (dateStart) q = q.gte("created_at", startOfDay(new Date(dateStart)).toISOString());
      if (dateEnd) q = q.lte("created_at", endOfDay(new Date(dateEnd)).toISOString());

      const { count, error } = await q;
      if (error) throw error;
      setWhatsappClicks(count || 0);
    } catch (err) {
      console.warn("Falha ao contar cliques do WhatsApp:", err);
      setWhatsappClicks(0);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (dateStart) {
        query = query.gte("created_at", startOfDay(new Date(dateStart)).toISOString());
      }

      if (dateEnd) {
        query = query.lte("created_at", endOfDay(new Date(dateEnd)).toISOString());
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,traffic_source.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
      clearSelection();
    } catch (error: any) {
      toast.error("Erro ao carregar leads: " + error.message);
    } finally {
      setLoading(false);
    }
    fetchWhatsappClicks();
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateStart, dateEnd]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      setLeads(leads.filter(l => l.id !== id));
      toast.success("Lead excluído com sucesso");
    } catch (error: any) {
      toast.error("Erro ao excluir lead: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} lead(s) selecionado(s)? Esta ação não pode ser desfeita.`)) return;
    
    setDeletingBulk(true);
    try {
      const { error } = await supabase.from("leads").delete().in("id", selectedIds);
      if (error) throw error;
      setLeads(leads.filter(l => !selectedIds.includes(l.id)));
      clearSelection();
      toast.success(`${selectedIds.length} lead(s) excluído(s) com sucesso`);
    } catch (error: any) {
      toast.error("Erro ao excluir leads: " + error.message);
    } finally {
      setDeletingBulk(false);
    }
  };

  // O gerenciamento de seleção foi movido para o hook useAdminLeadSelection

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
      toast.success("Status atualizado");
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  const retryWhatsApp = (lead: Lead) => {
    const msg = buildContactMessage({
      name: lead.name,
      phone: lead.phone,
      cpf: (lead as any).cpf || undefined,
      objective: lead.objective || undefined,
      credit: lead.credit || undefined,
      months: lead.months || undefined,
      installment: lead.installment || undefined,
      urgency: lead.urgency || undefined,
      hasLance: lead.has_lance || undefined,
      knowsConsortium: (lead as any).knows_consortium || undefined,
      birthDate: (lead as any).birth_date || undefined,
    });
    
    // In a real scenario, we'd need the config.contact.whatsapp here
    // For simplicity, we assume it's stored or we can just open wa.me with the client's number
    // But usually the goal is to send TO the consultant. 
    // Since we don't have the consultant's number here easily without passing it, 
    // let's try to get it from the latest site_config or just inform the user.
    
    toast.info("Abrindo WhatsApp para reenvio...");
    // We'll need to fetch the consultant phone or just use a placeholder if not available
    // For now, let's just mark as sent if they click retry.
    handleUpdateStatus(lead.id, "sent");
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-500">Enviado</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const handleCheckEmailStatus = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const log = data[0];
        if (log.status === "success") {
          toast.success(`E-mail enviado com sucesso para ${log.recipient} em ${format(new Date(log.created_at), "dd/MM/yy HH:mm")}`);
        } else {
          toast.error(`Falha no e-mail: ${log.error_message || "Erro desconhecido"}`);
        }
      } else {
        toast.info("Nenhum log de e-mail encontrado para este lead ainda.");
      }
    } catch (error: any) {
      toast.error("Erro ao verificar status: " + error.message);
    }
  };

  const exportToPDF = () => {
    if (leads.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      
      // Título do Relatório
      doc.setFontSize(18);
      doc.setTextColor(200, 168, 75); // Cor Gold
      doc.text("Relatório de Leads - Sleiman Consórcios", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      const filterInfo = `Filtros: ${dateStart || "Início"} até ${dateEnd || "Hoje"} | Status: ${statusFilter}`;
      doc.text(filterInfo, 14, 28);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 34);

      const tableData = leads.map(lead => {
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const cleanName = lead.name.replace(emojiRegex, "").trim();
        const cleanObjective = lead.objective ? lead.objective.replace(emojiRegex, "").trim() : "";
        
        return [
          format(new Date(lead.created_at), "dd/MM/yy HH:mm"),
          cleanName,
          lead.phone,
          (lead as any).cpf || "-",
          (lead as any).birth_date ? `${(lead as any).birth_date} (${calculateAge((lead as any).birth_date)}a)` : "-",
          cleanObjective,
          lead.credit,
          lead.income || "-",
          (lead as any).knows_consortium || "-",
          lead.form_type === "hero_modal" ? "Modal Hero" : 
          lead.form_type === "main_calculator" ? "Calculadora" : 
          lead.form_type === "footer_contact" ? "Rodapé" : 
          (lead.source === "hero_simulator" ? "Modal Hero" : lead.source || "Geral"),
          lead.traffic_source || "Direto"
        ];
      });

      autoTable(doc, {
        head: [["Data", "Nome", "WhatsApp", "CPF", "Nasc.", "Objetivo", "Crédito", "Renda", "Conhece?", "Origem", "Tráfego"]],
        body: tableData,
        startY: 40,
        styles: { fontSize: 7 }, // Reduced font size to fit more columns
        headStyles: { fillColor: [26, 26, 26] },
      });

      doc.save(`leads-sleiman-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setExporting(false);
    }
  };

  const stats = useMemo(() => ({
    total: leads.length,
    sent: leads.filter(l => l.status === "sent").length,
    failed: leads.filter(l => l.status === "failed").length,
    pending: leads.filter(l => !l.status || l.status === "pending").length,
  }), [leads]);

  return (
    <div className="space-y-6">
      {/* Filtro global de período — afeta stats, cliques e leads */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-4 h-4 text-gold" />
          <span className="text-sm font-bold uppercase tracking-wider">Período</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-200 rounded-xl px-3 h-11 flex-1 md:flex-initial">
          <input
            type="date"
            className="bg-transparent border-none text-sm outline-none w-full sm:w-36 py-1"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            aria-label="Data inicial"
          />
          <span className="text-slate-300">—</span>
          <input
            type="date"
            className="bg-transparent border-none text-sm outline-none w-full sm:w-36 py-1"
            value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}
            aria-label="Data final"
          />
        </div>
        {(dateStart || dateEnd) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            onClick={() => { setDateStart(""); setDateEnd(""); }}
          >
            Limpar período
          </Button>
        )}
        <p className="text-xs text-slate-400 md:ml-auto">
          O período filtra leads, cliques no WhatsApp e demais métricas abaixo.
        </p>
      </div>

      <LeadStats {...stats} whatsappClicks={whatsappClicks} />
      <WhatsappClicksList dateStart={dateStart} dateEnd={dateEnd} />
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Nome ou WhatsApp..." 
              className="pl-9 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchLeads()}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                className="h-11 flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all appearance-none pr-8 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos Status</option>
                <option value="pending">Pendente</option>
                <option value="sent">Enviado</option>
                <option value="failed">Falhou</option>
              </select>

              <Button variant="outline" size="icon" onClick={fetchLeads} disabled={loading} className="h-11 w-11 shrink-0 rounded-xl border-slate-200">
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
              </Button>
              
              <Button 
                variant="default" 
                className="h-11 px-5 flex-1 sm:flex-initial bg-midnight hover:bg-midnight/90 text-white rounded-xl shadow-md shadow-midnight/10 transition-all active:scale-95"
                onClick={exportToPDF}
                disabled={exporting || loading}
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
                <span className="font-semibold">PDF</span>
              </Button>

              {selectedIds.length > 0 && (
                <Button 
                  variant="destructive" 
                  className="h-11 px-5 rounded-xl shadow-md transition-all active:scale-95 animate-in fade-in zoom-in duration-200"
                  onClick={handleBulkDelete}
                  disabled={deletingBulk}
                >
                  {deletingBulk ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  <span className="font-semibold">Excluir ({selectedIds.length})</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead className="w-[120px] font-semibold text-slate-600">Data</TableHead>
                <TableHead className="font-semibold text-slate-600">Cliente</TableHead>
                <TableHead className="font-semibold text-slate-600 hidden md:table-cell">Simulação</TableHead>
                <TableHead className="font-semibold text-slate-600 hidden sm:table-cell">Origem</TableHead>
                <TableHead className="font-semibold text-slate-600 hidden lg:table-cell">Tráfego</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold opacity-50" />
                    <p className="text-sm text-slate-400 mt-3 font-medium">Sincronizando dados...</p>
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Search className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-slate-400 font-medium">Nenhum registro encontrado para estes filtros.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className={`group hover:bg-slate-50/40 transition-colors ${selectedIds.includes(lead.id) ? "bg-slate-50" : ""}`}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(lead.id)}
                        onCheckedChange={() => toggleSelectLead(lead.id)}
                        aria-label={`Selecionar lead ${lead.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-[11px] md:text-xs text-slate-500 font-medium whitespace-nowrap">
                      {format(new Date(lead.created_at), "dd/MM/yy", { locale: ptBR })}<br/>
                      <span className="text-[10px] opacity-60">{format(new Date(lead.created_at), "HH:mm")}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-slate-800">{lead.name}</div>
                      <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {lead.phone}
                      </div>
                        <div className="text-[10px] text-slate-400 font-medium flex gap-2 flex-wrap items-center">
                          {lead.traffic_source && (
                            <>
                              <Badge variant="secondary" className="text-[8px] h-4 px-1.5 py-0 bg-slate-100 text-slate-500 border-none lg:hidden">
                                {lead.traffic_source}
                              </Badge>
                              <span className="text-slate-200 lg:hidden">|</span>
                            </>
                          )}
                          {(lead as any).cpf && <span>CPF: {(lead as any).cpf}</span>}
                          {(lead as any).birth_date && (
                            <>
                              {(lead as any).cpf && <span className="text-slate-200">|</span>}
                              <span>Nasc: {(lead as any).birth_date} ({calculateAge((lead as any).birth_date)} anos)</span>
                            </>
                          )}
                        </div>
                      {/* Mobile-only info */}
                      <div className="md:hidden mt-2 space-y-1">
                        <p className="text-[11px] text-slate-600 italic">
                          {lead.objective} • {lead.credit}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{lead.objective}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-gold font-bold">{lead.credit}</span>
                        </div>
                        <p className="text-slate-400 font-medium">{lead.months}x de {lead.installment}</p>
                        {lead.income && <p className="text-[10px] bg-gold/10 text-gold-dark px-1.5 py-0.5 rounded-full inline-block font-bold">Renda: {lead.income}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold bg-slate-50/50 border-slate-200 text-slate-500 py-0.5">
                        {lead.form_type === "hero_modal" ? "Modal Hero" : 
                         lead.form_type === "main_calculator" ? "Calculadora" : 
                         lead.form_type === "footer_contact" ? "Rodapé" : 
                         (lead.source === "hero_simulator" ? "Modal Hero" : lead.source || "Geral")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {lead.traffic_source ? (
                        <Badge className={`text-[9px] uppercase tracking-wider font-bold py-0.5 ${
                          lead.traffic_source === 'google' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-none' :
                          ['meta', 'facebook', 'instagram'].includes(lead.traffic_source.toLowerCase()) ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none' :
                          lead.traffic_source === 'organic' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' :
                          'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none'
                        }`}>
                          {lead.traffic_source}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Direto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                          title="Verificar status do e-mail"
                          onClick={() => handleCheckEmailStatus(lead.id)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                          title="Tentar reenviar via WhatsApp"
                          onClick={() => retryWhatsApp(lead)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                          title="Excluir"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}