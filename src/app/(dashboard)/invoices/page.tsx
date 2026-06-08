export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { InvoicesClient } from "./invoices-client";
import type { Invoice, Quote, Contact, Product } from "@/lib/types";

export default async function InvoicesPage() {
  const [invoiceRows, quoteRows, contactRows, productRows] = await Promise.all([
    prisma.invoice.findMany({ orderBy: { created_at: "desc" }, include: { lines: true } }),
    prisma.quote.findMany({ orderBy: { created_at: "desc" }, include: { lines: true } }),
    prisma.contact.findMany({ orderBy: { last_name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  const invoices: Invoice[] = JSON.parse(JSON.stringify(invoiceRows));
  const quotes: Quote[] = JSON.parse(JSON.stringify(quoteRows));
  const contacts: Contact[] = JSON.parse(JSON.stringify(contactRows));
  const products: Product[] = JSON.parse(JSON.stringify(productRows));
  return (
    <InvoicesClient
      initialInvoices={invoices}
      initialQuotes={quotes}
      contacts={contacts}
      products={products}
    />
  );
}
