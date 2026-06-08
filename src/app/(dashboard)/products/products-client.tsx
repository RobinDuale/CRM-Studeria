"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { type Product } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Textarea, Select, FormGrid, FormActions } from "@/components/ui/form-fields";

function ProductForm({ initial, onSubmit, onCancel, submitLabel }: {
  initial?: Partial<Product>;
  onSubmit: (d: Omit<Product, "id">) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    unit_price: initial?.unit_price ?? 0,
    unit: initial?.unit ?? "jour",
    is_active: initial?.is_active ?? true,
  });
  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onSubmit(form); }} className="space-y-4">
      <Field label="Nom du produit / service" required>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Développement web" required />
      </Field>
      <Field label="Description">
        <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description courte…" />
      </Field>
      <FormGrid cols={2}>
        <Field label="Prix unitaire (€)" required>
          <Input type="number" min={0} step={0.01} value={form.unit_price} onChange={(e) => set("unit_price", parseFloat(e.target.value) || 0)} required />
        </Field>
        <Field label="Unité">
          <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
            {["jour", "heure", "mois", "an", "pièce", "mission", "forfait"].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </Select>
        </Field>
      </FormGrid>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
        <span className="text-sm text-zinc-700">Produit actif</span>
      </label>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [products, search]);

  async function handleCreate(data: Omit<Product, "id">) {
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const created = await res.json();
    setProducts((prev) => [...prev, created]);
    setCreateOpen(false);
  }

  async function handleUpdate(id: string, data: Partial<Product>) {
    const current = products.find((p) => p.id === id)!;
    const res = await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...current, ...data }) });
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Produits</h1>
          <p className="mt-1 text-sm text-zinc-500">{products.length} produit{products.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          + Nouveau produit
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit…"
          className="w-full max-w-sm rounded-md border border-zinc-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[2fr_3fr_1fr_1fr_80px_80px] gap-4 border-b border-zinc-100 px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
          <span>Nom</span><span>Description</span><span>Prix</span><span>Unité</span><span>Statut</span><span></span>
        </div>
        {filtered.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-400">Aucun produit trouvé.</div>
        )}
        {filtered.map((p, i) => (
          <div key={p.id} className={`grid grid-cols-[2fr_3fr_1fr_1fr_80px_80px] gap-4 items-center px-5 py-3.5 text-sm ${i < filtered.length - 1 ? "border-b border-zinc-50" : ""} hover:bg-zinc-50 transition-colors`}>
            <span className="font-medium text-zinc-800">{p.name}</span>
            <span className="text-zinc-500 truncate">{p.description}</span>
            <span className="font-medium text-zinc-700">{p.unit_price.toLocaleString("fr-FR")} €</span>
            <span className="text-zinc-500">{p.unit}</span>
            <button onClick={() => handleUpdate(p.id, { is_active: !p.is_active })} className="flex items-center gap-1 text-xs transition-colors">
              {p.is_active
                ? <><ToggleRight className="h-5 w-5 text-green-500" /><span className="text-green-600">Actif</span></>
                : <><ToggleLeft className="h-5 w-5 text-zinc-400" /><span className="text-zinc-400">Inactif</span></>}
            </button>
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => setEditTarget(p)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(p)} className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau produit">
        <ProductForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="Créer le produit" />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier le produit">
        {editTarget && (
          <ProductForm initial={editTarget} onSubmit={(d) => handleUpdate(editTarget.id, d)} onCancel={() => setEditTarget(null)} submitLabel="Enregistrer" />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Supprimer le produit"
        message={`Supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer" danger
      />
    </div>
  );
}
