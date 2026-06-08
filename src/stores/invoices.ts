import { create } from "zustand";
import { mockInvoices } from "@/lib/mock-data";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  company: string;
  contact: string;
  amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  notes?: string;
  lines: InvoiceLine[];
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  company: string;
  contact: string;
  amount: number;
  status: QuoteStatus;
  issue_date: string;
  valid_until: string;
  notes?: string;
  lines: QuoteLine[];
}

let invoiceCounter = mockInvoices.length + 1;
let quoteCounter = 1;

function nextInvoiceNumber() {
  const yr = new Date().getFullYear();
  return `FAC-${yr}-${String(invoiceCounter++).padStart(4, "0")}`;
}

function nextQuoteNumber() {
  const yr = new Date().getFullYear();
  return `DEV-${yr}-${String(quoteCounter++).padStart(4, "0")}`;
}

const seedInvoices: Invoice[] = mockInvoices.map((inv) => ({ ...inv, status: inv.status as InvoiceStatus, lines: [], notes: "" }));

interface InvoicesStore {
  invoices: Invoice[];
  quotes: Quote[];
  addInvoice: (data: Omit<Invoice, "id" | "invoice_number">) => Invoice;
  updateInvoice: (id: string, data: Partial<Omit<Invoice, "id">>) => void;
  removeInvoice: (id: string) => void;
  addQuote: (data: Omit<Quote, "id" | "quote_number">) => Quote;
  updateQuote: (id: string, data: Partial<Omit<Quote, "id">>) => void;
  removeQuote: (id: string) => void;
  quoteToInvoice: (quoteId: string) => Invoice;
}

export const useInvoicesStore = create<InvoicesStore>((set, get) => ({
  invoices: seedInvoices,
  quotes: [],

  addInvoice: (data) => {
    const inv: Invoice = { ...data, id: crypto.randomUUID(), invoice_number: nextInvoiceNumber() };
    set((s) => ({ invoices: [...s.invoices, inv] }));
    return inv;
  },

  updateInvoice: (id, data) =>
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...data } : i)) })),

  removeInvoice: (id) =>
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

  addQuote: (data) => {
    const q: Quote = { ...data, id: crypto.randomUUID(), quote_number: nextQuoteNumber() };
    set((s) => ({ quotes: [...s.quotes, q] }));
    return q;
  },

  updateQuote: (id, data) =>
    set((s) => ({ quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...data } : q)) })),

  removeQuote: (id) =>
    set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) })),

  quoteToInvoice: (quoteId) => {
    const q = get().quotes.find((q) => q.id === quoteId)!;
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const inv = get().addInvoice({
      company: q.company,
      contact: q.contact,
      amount: q.amount,
      status: "draft",
      issue_date: today,
      due_date: due,
      notes: q.notes,
      lines: q.lines.map((l) => ({ ...l, tax_rate: 20 })),
    });
    get().updateQuote(quoteId, { status: "accepted" });
    return inv;
  },
}));
