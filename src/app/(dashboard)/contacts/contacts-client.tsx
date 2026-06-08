"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2, Search, ChevronRight } from "lucide-react";
import { type Contact } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactDrawer } from "@/components/contacts/contact-drawer";

function initials(f: string, l: string) {
  return (f[0] + l[0]).toUpperCase();
}

export function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const drawerContact = viewContact ? contacts.find((c) => c.id === viewContact.id) ?? null : null;

  async function handleCreate(data: Omit<Contact, "id" | "created_at">) {
    const res = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const created = await res.json();
    setContacts((prev) => [created, ...prev]);
    setCreateOpen(false);
  }

  async function handleUpdate(id: string, data: Partial<Contact>) {
    const res = await fetch(`/api/contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const updated = await res.json();
    setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Contacts</h1>
          <p className="mt-1 text-sm text-zinc-500">{contacts.length} contact{contacts.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + Nouveau contact
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, entreprise…"
          className="w-full max-w-sm rounded-md border border-zinc-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div
          className="grid gap-4 border-b border-zinc-100 px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide"
          style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 24px 80px" }}
        >
          <span>Nom</span>
          <span>Email</span>
          <span>Entreprise</span>
          <span>Téléphone</span>
          <span></span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-400">Aucun contact trouvé.</div>
        )}

        {filtered.map((c, i) => (
          <div
            key={c.id}
            className={`grid gap-4 items-center px-5 py-3.5 text-sm cursor-pointer hover:bg-zinc-50 transition-colors ${i < filtered.length - 1 ? "border-b border-zinc-50" : ""}`}
            style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 24px 80px" }}
            onClick={() => setViewContact(c)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {initials(c.first_name, c.last_name)}
              </div>
              <span className="font-medium text-zinc-800">{c.first_name} {c.last_name}</span>
            </div>
            <span className="text-zinc-500 truncate">{c.email || <span className="text-zinc-300 italic">—</span>}</span>
            <span className="text-zinc-600">{c.company || <span className="text-zinc-300 italic">—</span>}</span>
            <span className="text-zinc-500">{c.phone || <span className="text-zinc-300 italic">—</span>}</span>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
            <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setEditTarget(c)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(c)} className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau contact">
        <ContactForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Créer le contact"
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier le contact">
        {editTarget && (
          <ContactForm
            initial={editTarget}
            onSubmit={(data) => handleUpdate(editTarget.id, data)}
            onCancel={() => setEditTarget(null)}
            submitLabel="Enregistrer"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Supprimer le contact"
        message={`Supprimer ${deleteTarget?.first_name} ${deleteTarget?.last_name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
      />

      <ContactDrawer
        contact={drawerContact}
        onClose={() => setViewContact(null)}
        onUpdate={(id, data) => handleUpdate(id, data)}
      />
    </div>
  );
}
