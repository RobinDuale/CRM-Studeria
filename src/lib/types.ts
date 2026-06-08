export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  address?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unit_price: number;
  unit: string;
  is_active: boolean;
}

export type DealStage = "prospect" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface DealLine {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
}

export interface Deal {
  id: string;
  title: string;
  contact: string;
  company: string;
  amount: number;
  stage: DealStage;
  expected_close?: string | null;
  notes?: string | null;
  lines: DealLine[];
}

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
  notes?: string | null;
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
  notes?: string | null;
  lines: QuoteLine[];
}
