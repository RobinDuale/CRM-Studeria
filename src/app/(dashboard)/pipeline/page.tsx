export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { PipelineClient } from "./pipeline-client";
import type { Deal, Contact, Product } from "@/lib/types";

export default async function PipelinePage() {
  const [dealRows, contactRows, productRows] = await Promise.all([
    prisma.deal.findMany({ orderBy: { created_at: "desc" }, include: { lines: true } }),
    prisma.contact.findMany({ orderBy: { last_name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  const deals: Deal[] = JSON.parse(JSON.stringify(dealRows));
  const contacts: Contact[] = JSON.parse(JSON.stringify(contactRows));
  const products: Product[] = JSON.parse(JSON.stringify(productRows));
  return <PipelineClient initialDeals={deals} contacts={contacts} products={products} />;
}
