import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { QuoteLine } from "@/lib/types";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({ where: { id }, include: { lines: true } });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoice_number: { startsWith: `FAC-${year}-` } },
  });
  const invoice_number = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;

  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const invoice = await prisma.invoice.create({
    data: {
      invoice_number,
      contact: quote.contact,
      company: quote.company,
      amount: quote.amount,
      status: "draft",
      issue_date: today,
      due_date: due,
      notes: quote.notes,
      lines: {
        create: quote.lines.map((l: QuoteLine) => ({
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
          discount: l.discount,
          tax_rate: 20,
        })),
      },
    },
    include: { lines: true },
  });

  await prisma.quote.update({ where: { id }, data: { status: "accepted" } });

  return NextResponse.json(invoice, { status: 201 });
}
