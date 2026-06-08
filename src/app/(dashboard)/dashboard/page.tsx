"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDealsStore } from "@/stores/deals";
import { useInvoicesStore } from "@/stores/invoices";
import { useContactsStore } from "@/stores/contacts";
import { mockRevenueData } from "@/lib/mock-data";

export default function DashboardPage() {
  const deals = useDealsStore((s) => s.deals);
  const invoices = useInvoicesStore((s) => s.invoices);
  const quotes = useInvoicesStore((s) => s.quotes);
  const contacts = useContactsStore((s) => s.contacts);

  const dealsEnCours = deals.filter((d) => !["won", "lost"].includes(d.stage)).length;
  const facturesEnAttente = invoices.filter((i) => i.status === "sent" || i.status === "overdue").length;
  const devisEnvoyes = quotes.filter((q) => q.status === "sent").length + 3; // +3 seed
  const caDuMois = mockRevenueData[mockRevenueData.length - 1].ca;

  const recentDeals = [...deals].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const recentInvoices = [...invoices].slice(-5).reverse();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-zinc-500">Vue d&apos;ensemble de votre activité commerciale</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "CA du mois", value: `${caDuMois.toLocaleString("fr-FR")} €`, sub: "+8 % vs mai" },
          { label: "Deals en cours", value: dealsEnCours, sub: `${deals.filter(d => d.stage === "negotiation").length} en négociation` },
          { label: "Devis envoyés", value: devisEnvoyes, sub: "ce mois" },
          { label: "Factures en attente", value: facturesEnAttente, sub: `${invoices.filter(i => i.status === "overdue").length} en retard` },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
        <p className="mb-4 text-sm font-medium text-zinc-700">Chiffre d&apos;affaires — 6 derniers mois</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={mockRevenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString("fr-FR")} €`, "CA"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
            <Area type="monotone" dataKey="ca" stroke="#6366f1" strokeWidth={2} fill="url(#caGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-zinc-700">Deals prioritaires</p>
          <div className="space-y-2.5">
            {recentDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-zinc-800">{deal.title}</p>
                  <p className="text-xs text-zinc-400">{deal.company}</p>
                </div>
                <span className="font-semibold text-indigo-600">{deal.amount.toLocaleString("fr-FR")} €</span>
              </div>
            ))}
            {deals.length === 0 && <p className="text-sm text-zinc-400">Aucun deal.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-zinc-700">Factures récentes</p>
          <div className="space-y-2.5">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-zinc-800">{inv.invoice_number}</p>
                  <p className="text-xs text-zinc-400">{inv.company}</p>
                </div>
                <span className="font-semibold text-zinc-700">{inv.amount.toLocaleString("fr-FR")} €</span>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-sm text-zinc-400">Aucune facture.</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Contacts", value: contacts.length, color: "text-blue-600 bg-blue-50" },
          { label: "Deals gagnés", value: deals.filter(d => d.stage === "won").length, color: "text-green-600 bg-green-50" },
          { label: "Pipeline total", value: `${deals.filter(d => !["won","lost"].includes(d.stage)).reduce((s,d) => s+d.amount,0).toLocaleString("fr-FR")} €`, color: "text-indigo-600 bg-indigo-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color.split(" ")[1]}`}>
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className={`mt-1 text-xl font-semibold ${s.color.split(" ")[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
