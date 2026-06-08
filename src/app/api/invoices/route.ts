import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { created_at: "desc" },
    include: { lines: true },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const { lines, invoice_number, ...data } = await req.json();

  let number = invoice_number;
  if (!number) {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: { invoice_number: { startsWith: `FAC-${year}-` } },
    });
    number = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
      invoice_number: number,
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  });
  return NextResponse.json(invoice, { status: 201 });
}
