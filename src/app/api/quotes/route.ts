import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const quotes = await prisma.quote.findMany({
    orderBy: { created_at: "desc" },
    include: { lines: true },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: Request) {
  const { lines, quote_number, ...data } = await req.json();

  let number = quote_number;
  if (!number) {
    const year = new Date().getFullYear();
    const count = await prisma.quote.count({
      where: { quote_number: { startsWith: `DEV-${year}-` } },
    });
    number = `DEV-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  const quote = await prisma.quote.create({
    data: {
      ...data,
      quote_number: number,
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  });
  return NextResponse.json(quote, { status: 201 });
}
