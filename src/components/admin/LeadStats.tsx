import { Users, Send, AlertCircle, Clock } from "lucide-react";

interface LeadStatsProps {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export function LeadStats({ total, sent, failed, pending }: LeadStatsProps) {
  const stats = [
    { label: "Total de Leads", value: total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Enviados", value: sent, icon: Send, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pendentes", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Falhas", value: failed, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className={`p-2 rounded-lg ${stat.bg}`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-heading font-bold text-slate-900 leading-none">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
