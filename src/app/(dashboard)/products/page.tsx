export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return <ProductsClient initialProducts={products} />;
}
