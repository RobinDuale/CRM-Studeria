import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lines, ...data } = await req.json();
  await prisma.quoteLine.deleteMany({ where: { quote_id: id } });
  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...data,
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  });
  return NextResponse.json(quote);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.quote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
