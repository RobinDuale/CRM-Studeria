import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contacts = await prisma.contact.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const data = await req.json();
  const contact = await prisma.contact.create({ data });
  return NextResponse.json(contact, { status: 201 });
}
