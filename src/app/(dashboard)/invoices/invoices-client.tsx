"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2, FileDown, Plus, X } from "lucide-react";
import {
  type Invoice, type Quote,
  type InvoiceLine, type QuoteLine,
  type InvoiceStatus, type QuoteStatus,
  type Contact, type Product,
} from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Textarea, Select, FormGrid, FormActions } from "@/components/ui/form-fields";
import { INVOICE_STATUS } from "@/lib/mock-data";
import { generateInvoicePDF, generateQuotePDF } from "@/lib/pdf";

const QUOTE_STATUS: Record<QuoteStatus, { label: string; color: string }> = {
  draft:    { label: "Brouillon", color: "bg-zinc-100 text-zinc-600" },
  sent:     { label: "Envoyé",    color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepté",   color: "bg-green-100 text-green-700" },
  declined: { label: "Refusé",    color: "bg-red-100 text-red-700" },
};

function LineEditor({ lines, onChange, withTax, products }: {
  lines: (InvoiceLine | QuoteLine)[];
  onChange: (l: (InvoiceLine | QuoteLine)[]) => void;
  withTax: boolean;
  products: Product[];
}) {
  const activeProducts = useMemo(() => products.filter((p) => p.is_active), [products]);

  const add = () => {
    const base = { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, discount: 0 };
    onChange([...lines, withTax ? { ...base, tax_rate: 20 } : base]);
  };

  const update = (i: number, key: string, val: string | number) =>
    onChange(lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  const fillProduct = (i: number, id: string) => {
    const p = activeProducts.find((p) => p.id === id);
    if (!p) return;
    onChange(lines.map((l, idx) => idx === i ? { ...l, description: p.name, unit_price: p.unit_price } : l));
  };

  const totalHT = lines.reduce((s, l) => s + l.unit_price * l.quantity * (1 - l.discount / 100), 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-700">Lignes de {withTax ? "facture" : "devis"}</span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
          <Plus className="h-3 w-3" /> Ajouter
        </button>
      </div>

      {lines.length === 0 && (
        <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-xs text-zinc-400">
          Aucune ligne — cliquez sur Ajouter
        </div>
      )}

      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={l.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  onChange={(e) => fillProduct(i, e.target.value)}
                  className="mb-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-500 focus:outline-none focus:border-indigo-300"
                >
                  <option value="">Choisir un produit (optionnel)…</option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.unit_price.toLocaleString("fr-FR")} €/{p.unit}</option>
                  ))}
                </select>
                <input
                  value={l.description}
                  onChange={(e) => update(i, "description", e.target.value)}
                  placeholder="Description de la prestation"
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300"
                />
              </div>
              <button type="button" onClick={() => onChange(lines.filter((_, idx) => idx !== i))} className="self-start text-zinc-300 hover:text-red-400 transition-colors pt-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-0.5">Quantité</label>
                <input type="number" min={0} step={0.01} value={l.quantity} onChange={(e) => update(i, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-0.5">P.U. HT (€)</label>
                <input type="number" min={0} step={0.01} value={l.unit_price} onChange={(e) => update(i, "unit_price", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-0.5">Remise (%)</label>
                <input type="number" min={0} max={100} step={1} value={l.discount} onChange={(e) => update(i, "discount", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300" />
              </div>
              {withTax ? (
                <div>
                  <label className="block text-xs text-zinc-400 mb-0.5">TVA (%)</label>
                  <input type="number" min={0} step={0.5} value={(l as InvoiceLine).tax_rate ?? 20} onChange={(e) => update(i, "tax_rate", parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300" />
                </div>
              ) : (
                <div className="flex items-end pb-1.5">
                  <span className="text-xs font-semibold text-indigo-600">
                    = {(l.unit_price * l.quantity * (1 - l.discount / 100)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              )}
            </div>
            {withTax && (
              <div className="text-right text-xs font-semibold text-indigo-600">
                = {(l.unit_price * l.quantity * (1 - l.discount / 100)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € HT
              </div>
            )}
          </div>
        ))}
      </div>

      {lines.length > 0 && (
        <div className="mt-2 flex justify-end">
          <span className="text-sm font-bold text-zinc-800">Total HT : {totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
      )}
    </div>
  );
}

function InvoiceForm({ initial, onSubmit, onCancel, submitLabel, contacts, products }: {
  initial?: Partial<Invoice>;
  onSubmit: (d: Omit<Invoice, "id" | "invoice_number">) => void;
  onCancel: () => void;
  submitLabel?: string;
  contacts: Contact[];
  products: Product[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [contact, setContact] = useState(initial?.contact ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status ?? "draft");
  const [issueDate, setIssueDate] = useState(initial?.issue_date ?? today);
  const [dueDate, setDueDate] = useState(initial?.due_date ?? due30);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [lines, setLines] = useState<InvoiceLine[]>(initial?.lines ?? []);
  const [manualAmount, setManualAmount] = useState(initial?.amount ?? 0);

  const computedAmount = lines.length > 0
    ? lines.reduce((s, l) => s + l.unit_price * l.quantity * (1 - l.discount / 100), 0)
    : manualAmount;

  const handleContact = (name: string) => {
    setContact(name);
    const c = contacts.find((c) => `${c.first_name} ${c.last_name}` === name);
    if (c) setCompany(c.company);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ contact, company, status, issue_date: issueDate, due_date: dueDate, notes: notes || null, lines, amount: computedAmount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGrid cols={2}>
        <Field label="Contact">
          <Select value={contact} onChange={(e) => handleContact(e.target.value)}>
            <option value="">— Choisir —</option>
            {contacts.map((c) => <option key={c.id} value={`${c.first_name} ${c.last_name}`}>{c.first_name} {c.last_name}</option>)}
          </Select>
        </Field>
        <Field label="Entreprise">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Entreprise" />
        </Field>
      </FormGrid>
      <FormGrid cols={2}>
        <Field label="Date d'émission">
          <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </Field>
        <Field label="Échéance">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </FormGrid>
      <Field label="Statut">
        <Select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
          {Object.entries(INVOICE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
      </Field>
      <div className="rounded-lg border border-zinc-200 p-4">
        <LineEditor lines={lines} onChange={(l) => setLines(l as InvoiceLine[])} withTax products={products} />
        {lines.length === 0 && (
          <div className="mt-3">
            <Field label="Montant (€) si pas de lignes">
              <Input type="number" min={0} step={0.01} value={manualAmount} onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)} />
            </Field>
          </div>
        )}
      </div>
      <Field label="Notes / mentions légales">
        <Textarea rows={2} value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} placeholder="Conditions de règlement, mentions légales…" />
      </Field>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}

function QuoteForm({ initial, onSubmit, onCancel, submitLabel, contacts, products }: {
  initial?: Partial<Quote>;
  onSubmit: (d: Omit<Quote, "id" | "quote_number">) => void;
  onCancel: () => void;
  submitLabel?: string;
  contacts: Contact[];
  products: Product[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const valid30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [contact, setContact] = useState(initial?.contact ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [status, setStatus] = useState<QuoteStatus>(initial?.status ?? "draft");
  const [issueDate, setIssueDate] = useState(initial?.issue_date ?? today);
  const [validUntil, setValidUntil] = useState(initial?.valid_until ?? valid30);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [lines, setLines] = useState<QuoteLine[]>(initial?.lines ?? []);
  const [manualAmount, setManualAmount] = useState(initial?.amount ?? 0);

  const computedAmount = lines.length > 0
    ? lines.reduce((s, l) => s + l.unit_price * l.quantity * (1 - l.discount / 100), 0)
    : manualAmount;

  const handleContact = (name: string) => {
    setContact(name);
    const c = contacts.find((c) => `${c.first_name} ${c.last_name}` === name);
    if (c) setCompany(c.company);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ contact, company, status, issue_date: issueDate, valid_until: validUntil, notes: notes || null, lines, amount: computedAmount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGrid cols={2}>
        <Field label="Contact">
          <Select value={contact} onChange={(e) => handleContact(e.target.value)}>
            <option value="">— Choisir —</option>
            {contacts.map((c) => <option key={c.id} value={`${c.first_name} ${c.last_name}`}>{c.first_name} {c.last_name}</option>)}
          </Select>
        </Field>
        <Field label="Entreprise">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Entreprise" />
        </Field>
      </FormGrid>
      <FormGrid cols={2}>
        <Field label="Date d'émission">
          <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </Field>
        <Field label="Valable jusqu'au">
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </Field>
      </FormGrid>
      <Field label="Statut">
        <Select value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
          {Object.entries(QUOTE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
      </Field>
      <div className="rounded-lg border border-zinc-200 p-4">
        <LineEditor lines={lines} onChange={(l) => setLines(l as QuoteLine[])} withTax={false} products={products} />
        {lines.length === 0 && (
          <div className="mt-3">
            <Field label="Montant estimé (€) si pas de lignes">
              <Input type="number" min={0} step={0.01} value={manualAmount} onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)} />
            </Field>
          </div>
        )}
      </div>
      <Field label="Conditions / notes">
        <Textarea rows={2} value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} placeholder="Durée de validité, conditions particulières…" />
      </Field>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

export function InvoicesClient({ initialInvoices, initialQuotes, contacts, products }: {
  initialInvoices: Invoice[];
  initialQuotes: Quote[];
  contacts: Contact[];
  products: Product[];
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [tab, setTab] = useState<"invoices" | "quotes">("invoices");
  const [createOpen, setCreateOpen] = useState(false);
  const [editInv, setEditInv] = useState<Invoice | null>(null);
  const [editQuote, setEditQuote] = useState<Quote | null>(null);
  const [deleteInv, setDeleteInv] = useState<Invoice | null>(null);
  const [deleteQuote, setDeleteQuote] = useState<Quote | null>(null);

  const totalInv = invoices.reduce((s, i) => s + i.amount, 0);
  const paidInv = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  async function handleCreateInvoice(data: Omit<Invoice, "id" | "invoice_number">) {
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const created = await res.json();
    setInvoices((prev) => [created, ...prev]);
    setCreateOpen(false);
  }

  async function handleUpdateInvoice(id: string, data: Omit<Invoice, "id" | "invoice_number">) {
    const res = await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const updated = await res.json();
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
    setEditInv(null);
  }

  async function handleDeleteInvoice(id: string) {
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setDeleteInv(null);
  }

  async function handleCreateQuote(data: Omit<Quote, "id" | "quote_number">) {
    const res = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const created = await res.json();
    setQuotes((prev) => [created, ...prev]);
    setCreateOpen(false);
  }

  async function handleUpdateQuote(id: string, data: Omit<Quote, "id" | "quote_number">) {
    const res = await fetch(`/api/quotes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const updated = await res.json();
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
    setEditQuote(null);
  }

  async function handleDeleteQuote(id: string) {
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setDeleteQuote(null);
  }

  async function handleConvertQuote(quoteId: string) {
    const res = await fetch(`/api/quotes/${quoteId}/convert`, { method: "POST" });
    const invoice = await res.json();
    setInvoices((prev) => [invoice, ...prev]);
    setQuotes((prev) => prev.map((q) => q.id === quoteId ? { ...q, status: "accepted" as QuoteStatus } : q));
    setTab("invoices");
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Facturation</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {invoices.length} factures · {totalInv.toLocaleString("fr-FR")} € total · {paidInv.toLocaleString("fr-FR")} € encaissé
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          + {tab === "invoices" ? "Nouvelle facture" : "Nouveau devis"}
        </button>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 w-fit">
        {(["invoices", "quotes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
            {t === "invoices" ? `Factures (${invoices.length})` : `Devis (${quotes.length})`}
          </button>
        ))}
      </div>

      {tab === "invoices" && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="grid gap-3 border-b border-zinc-100 px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide"
            style={{ gridTemplateColumns: "160px 1fr 120px 100px 100px 100px 90px" }}>
            <span>Numéro</span><span>Client</span><span>Montant</span><span>Émission</span><span>Échéance</span><span>Statut</span><span></span>
          </div>

          {invoices.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-zinc-400">Aucune facture.</div>
          )}

          {invoices.map((inv, i) => {
            const st = INVOICE_STATUS[inv.status as keyof typeof INVOICE_STATUS] ?? INVOICE_STATUS.draft;
            return (
              <div key={inv.id} className={`grid gap-3 items-center px-5 py-3.5 text-sm hover:bg-zinc-50 transition-colors ${i < invoices.length - 1 ? "border-b border-zinc-50" : ""}`}
                style={{ gridTemplateColumns: "160px 1fr 120px 100px 100px 100px 90px" }}>
                <span className="font-mono text-xs font-semibold text-zinc-700">{inv.invoice_number}</span>
                <div>
                  <p className="font-medium text-zinc-800">{inv.company}</p>
                  <p className="text-xs text-zinc-400">{inv.contact}</p>
                </div>
                <span className="font-semibold text-zinc-800">{inv.amount.toLocaleString("fr-FR")} €</span>
                <span className="text-zinc-500 text-xs">{inv.issue_date}</span>
                <span className={`text-xs ${inv.status === "overdue" ? "text-red-500 font-semibold" : "text-zinc-500"}`}>{inv.due_date}</span>
                <StatusBadge label={st.label} color={st.color} />
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => generateInvoicePDF(inv)} title="PDF" className="rounded p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 transition-colors">
                    <FileDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditInv(inv)} className="rounded p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteInv(inv)} className="rounded p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "quotes" && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="grid gap-3 border-b border-zinc-100 px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide"
            style={{ gridTemplateColumns: "160px 1fr 120px 100px 100px 90px 110px" }}>
            <span>Numéro</span><span>Client</span><span>Montant</span><span>Émission</span><span>Validité</span><span>Statut</span><span></span>
          </div>

          {quotes.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-zinc-400">Aucun devis.</div>
          )}

          {quotes.map((q, i) => {
            const st = QUOTE_STATUS[q.status] ?? QUOTE_STATUS.draft;
            return (
              <div key={q.id} className={`grid gap-3 items-center px-5 py-3.5 text-sm hover:bg-zinc-50 transition-colors ${i < quotes.length - 1 ? "border-b border-zinc-50" : ""}`}
                style={{ gridTemplateColumns: "160px 1fr 120px 100px 100px 90px 110px" }}>
                <span className="font-mono text-xs font-semibold text-zinc-700">{q.quote_number}</span>
                <div>
                  <p className="font-medium text-zinc-800">{q.company}</p>
                  <p className="text-xs text-zinc-400">{q.contact}</p>
                </div>
                <span className="font-semibold text-zinc-800">{q.amount.toLocaleString("fr-FR")} €</span>
                <span className="text-zinc-500 text-xs">{q.issue_date}</span>
                <span className="text-zinc-500 text-xs">{q.valid_until}</span>
                <StatusBadge label={st.label} color={st.color} />
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => generateQuotePDF(q)} title="PDF" className="rounded p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 transition-colors">
                    <FileDown className="h-3.5 w-3.5" />
                  </button>
                  {q.status !== "accepted" && (
                    <button onClick={() => handleConvertQuote(q.id)} title="Convertir en facture" className="rounded px-1.5 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors whitespace-nowrap">
                      → FAC
                    </button>
                  )}
                  <button onClick={() => setEditQuote(q)} className="rounded p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteQuote(q)} className="rounded p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={createOpen && tab === "invoices"} onClose={() => setCreateOpen(false)} title="Nouvelle facture" size="lg">
        <InvoiceForm onSubmit={handleCreateInvoice} onCancel={() => setCreateOpen(false)} submitLabel="Créer la facture" contacts={contacts} products={products} />
      </Modal>
      <Modal open={createOpen && tab === "quotes"} onClose={() => setCreateOpen(false)} title="Nouveau devis" size="lg">
        <QuoteForm onSubmit={handleCreateQuote} onCancel={() => setCreateOpen(false)} submitLabel="Créer le devis" contacts={contacts} products={products} />
      </Modal>

      <Modal open={!!editInv} onClose={() => setEditInv(null)} title="Modifier la facture" size="lg">
        {editInv && (
          <InvoiceForm initial={editInv} onSubmit={(d) => handleUpdateInvoice(editInv.id, d)} onCancel={() => setEditInv(null)} submitLabel="Enregistrer" contacts={contacts} products={products} />
        )}
      </Modal>
      <Modal open={!!editQuote} onClose={() => setEditQuote(null)} title="Modifier le devis" size="lg">
        {editQuote && (
          <QuoteForm initial={editQuote} onSubmit={(d) => handleUpdateQuote(editQuote.id, d)} onCancel={() => setEditQuote(null)} submitLabel="Enregistrer" contacts={contacts} products={products} />
        )}
      </Modal>

      <ConfirmDialog open={!!deleteInv} onClose={() => setDeleteInv(null)} onConfirm={() => deleteInv && handleDeleteInvoice(deleteInv.id)} title="Supprimer la facture" message={`Supprimer ${deleteInv?.invoice_number} ?`} confirmLabel="Supprimer" danger />
      <ConfirmDialog open={!!deleteQuote} onClose={() => setDeleteQuote(null)} onConfirm={() => deleteQuote && handleDeleteQuote(deleteQuote.id)} title="Supprimer le devis" message={`Supprimer ${deleteQuote?.quote_number} ?`} confirmLabel="Supprimer" danger />
    </div>
  );
}
