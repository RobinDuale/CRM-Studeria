"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { useDealsStore } from "@/stores/deals";
import { useContactsStore } from "@/stores/contacts";
import { useInvoicesStore } from "@/stores/invoices";
import { mockRevenueData, DEAL_STAGES } from "@/lib/mock-data";

export default function AnalyticsPage() {
  const deals = useDealsStore((s) => s.deals);
  const contacts = useContactsStore((s) => s.contacts);
  const invoices = useInvoicesStore((s) => s.invoices);
  const quotes = useInvoicesStore((s) => s.quotes);

  const activDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
  const totalPipeline = activDeals.reduce((s, d) => s + d.amount, 0);
  const wonDeals = deals.filter((d) => d.stage === "won");
  const convRate = deals.length ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const avgDeal = deals.length ? Math.round(deals.reduce((s, d) => s + d.amount, 0) / deals.length) : 0;
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  const stageData = DEAL_STAGES.slice(0, 4).map((s) => ({
    name: s.label,
    count: deals.filter((d) => d.stage === s.key).length,
    amount: deals.filter((d) => d.stage === s.key).reduce((sum, d) => sum + d.amount, 0),
  }));

  const wonLost = [
    { name: "Gagnés", value: wonDeals.length, color: "#22c55e" },
    { name: "Perdus", value: deals.filter((d) => d.stage === "lost").length, color: "#f87171" },
    { name: "En cours", value: activDeals.length, color: "#6366f1" },
  ];

  const invoiceStatusData = [
    { name: "Payées",     value: invoices.filter((i) => i.status === "paid").length,    color: "#22c55e" },
    { name: "Envoyées",   value: invoices.filter((i) => i.status === "sent").length,    color: "#60a5fa" },
    { name: "En retard",  value: invoices.filter((i) => i.status === "overdue").length, color: "#f87171" },
    { name: "Brouillon",  value: invoices.filter((i) => i.status === "draft").length,   color: "#d4d4d8" },
  ].filter((d) => d.value > 0);

  const kpis = [
    { label: "Pipeline total",      value: `${totalPipeline.toLocaleString("fr-FR")} €` },
    { label: "Taux de conversion",  value: `${convRate} %` },
    { label: "Deal moyen",          value: `${avgDeal.toLocaleString("fr-FR")} €` },
    { label: "Contacts",            value: contacts.length },
    { label: "CA facturé",          value: `${totalInvoiced.toLocaleString("fr-FR")} €` },
    { label: "CA encaissé",         value: `${totalPaid.toLocaleString("fr-FR")} €` },
    { label: "Devis en cours",      value: quotes.filter((q) => q.status === "draft" || q.status === "sent").length },
    { label: "Deals perdus",        value: deals.filter((d) => d.stage === "lost").length },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Pilotage</h1>
        <p className="mt-1 text-sm text-zinc-500">Indicateurs de performance commerciale</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">{k.label}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-4 text-sm font-medium text-zinc-700">CA mensuel (6 mois)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockRevenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString("fr-FR")} €`, "CA"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="ca" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-4 text-sm font-medium text-zinc-700">Répartition des deals</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={wonLost} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => value > 0 ? `${name} (${value})` : ""} labelLine={false} fontSize={11}>
                {wonLost.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-4 text-sm font-medium text-zinc-700">Pipeline par étape (€)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stageData} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString("fr-FR")} €`, "Montant"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="amount" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-4 text-sm font-medium text-zinc-700">Statut des factures</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={11}>
                {invoiceStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
