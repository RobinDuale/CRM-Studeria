import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lines, ...data } = await req.json();
  await prisma.invoiceLine.deleteMany({ where: { invoice_id: id } });
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...data,
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  });
  return NextResponse.json(invoice);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
