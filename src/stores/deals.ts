import { create } from "zustand";
import { mockDeals } from "@/lib/mock-data";

export type DealStage = "prospect" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface DealLine {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
}

export interface Deal {
  id: string;
  title: string;
  contact: string;
  company: string;
  amount: number;
  stage: DealStage;
  expected_close: string;
  notes?: string;
  lines?: DealLine[];
}

interface DealsStore {
  deals: Deal[];
  add: (data: Omit<Deal, "id">) => void;
  update: (id: string, data: Partial<Omit<Deal, "id">>) => void;
  move: (id: string, stage: DealStage) => void;
  remove: (id: string) => void;
}

export const useDealsStore = create<DealsStore>((set) => ({
  deals: mockDeals as Deal[],
  add: (data) =>
    set((s) => ({ deals: [...s.deals, { ...data, id: crypto.randomUUID() }] })),
  update: (id, data) =>
    set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
  move: (id, stage) =>
    set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, stage } : d)) })),
  remove: (id) =>
    set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),
}));
