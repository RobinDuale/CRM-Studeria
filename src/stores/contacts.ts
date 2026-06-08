import { create } from "zustand";
import { mockContacts } from "@/lib/mock-data";

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
  notes?: string;
  created_at: string;
}

interface ContactsStore {
  contacts: Contact[];
  add: (data: Omit<Contact, "id" | "created_at">) => void;
  update: (id: string, data: Partial<Omit<Contact, "id" | "created_at">>) => void;
  remove: (id: string) => void;
}

export const useContactsStore = create<ContactsStore>((set) => ({
  contacts: mockContacts,
  add: (data) =>
    set((s) => ({
      contacts: [
        ...s.contacts,
        { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString().slice(0, 10) },
      ],
    })),
  update: (id, data) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  remove: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
}));
