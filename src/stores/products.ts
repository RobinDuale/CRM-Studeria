import { create } from "zustand";
import { mockProducts } from "@/lib/mock-data";

export interface Product {
  id: string;
  name: string;
  description: string;
  unit_price: number;
  unit: string;
  is_active: boolean;
}

interface ProductsStore {
  products: Product[];
  add: (data: Omit<Product, "id">) => void;
  update: (id: string, data: Partial<Omit<Product, "id">>) => void;
  remove: (id: string) => void;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  products: mockProducts,
  add: (data) =>
    set((s) => ({ products: [...s.products, { ...data, id: crypto.randomUUID() }] })),
  update: (id, data) =>
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
  remove: (id) =>
    set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
}));
