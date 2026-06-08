import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const deals = await prisma.deal.findMany({
    orderBy: { created_at: "desc" },
    include: { lines: true },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const { lines, ...data } = await req.json();
  const deal = await prisma.deal.create({
    data: {
      ...data,
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  });
  return NextResponse.json(deal, { status: 201 });
}
