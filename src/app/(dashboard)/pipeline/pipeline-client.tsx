"use client";

import { useState, useMemo } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { type Deal, type DealStage, type DealLine, type Contact, type Product } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Textarea, Select, FormGrid, FormActions } from "@/components/ui/form-fields";
import { DEAL_STAGES } from "@/lib/mock-data";

function DealLinesEditor({ lines, onChange, products }: {
  lines: DealLine[];
  onChange: (lines: DealLine[]) => void;
  products: Product[];
}) {
  const activeProducts = useMemo(() => products.filter((p) => p.is_active), [products]);

  const addLine = () => onChange([
    ...lines,
    { id: crypto.randomUUID(), product_id: "", product_name: "", unit: "jour", quantity: 1, unit_price: 0 },
  ]);

  const selectProduct = (i: number, productId: string) => {
    const p = activeProducts.find((p) => p.id === productId);
    onChange(lines.map((l, idx) => idx === i
      ? { ...l, product_id: productId, product_name: p?.name ?? "", unit: p?.unit ?? l.unit, unit_price: p?.unit_price ?? l.unit_price }
      : l
    ));
  };

  const setField = (i: number, key: keyof DealLine, val: string | number) =>
    onChange(lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const total = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-700">Produits / prestations</span>
        <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
          <Plus className="h-3 w-3" /> Ajouter
        </button>
      </div>

      {lines.length === 0 && (
        <div className="flex h-10 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-xs text-zinc-400">
          Optionnel — cliquez sur Ajouter pour lier des produits
        </div>
      )}

      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={l.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
            <div className="mb-2">
              <select
                value={l.product_id}
                onChange={(e) => selectProduct(i, e.target.value)}
                className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300"
              >
                <option value="">— Choisir un produit —</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.unit_price.toLocaleString("fr-FR")} €/{p.unit}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-zinc-400 mb-0.5">Quantité ({l.unit || "unité"})</label>
                <input type="number" min={0.01} step={0.01} value={l.quantity}
                  onChange={(e) => setField(i, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-zinc-400 mb-0.5">P.U. (€)</label>
                <input type="number" min={0} step={0.01} value={l.unit_price}
                  onChange={(e) => setField(i, "unit_price", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-300" />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">
                  = {(l.unit_price * l.quantity).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                </span>
                <button type="button" onClick={() => remove(i)} className="text-zinc-300 hover:text-red-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lines.length > 0 && (
        <div className="mt-2 flex justify-end">
          <span className="text-sm font-bold text-zinc-800">Total : {total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
      )}
    </div>
  );
}

function DealForm({ initial, onSubmit, onCancel, submitLabel, contacts, products }: {
  initial?: Partial<Deal>;
  onSubmit: (d: Omit<Deal, "id">) => void;
  onCancel: () => void;
  submitLabel?: string;
  contacts: Contact[];
  products: Product[];
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [stage, setStage] = useState<DealStage>(initial?.stage ?? "prospect");
  const [expectedClose, setExpectedClose] = useState(initial?.expected_close ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [lines, setLines] = useState<DealLine[]>(initial?.lines ?? []);
  const [manualAmount, setManualAmount] = useState(initial?.amount ?? 0);

  const computedAmount = lines.length > 0
    ? lines.reduce((s, l) => s + l.unit_price * l.quantity, 0)
    : manualAmount;

  const handleContact = (name: string) => {
    setContact(name);
    const c = contacts.find((c) => `${c.first_name} ${c.last_name}` === name);
    if (c) setCompany(c.company);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, contact, company, stage, expected_close: expectedClose || null, notes: notes || null, lines, amount: computedAmount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Titre du deal" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Refonte ERP, Mission conseil…" required />
      </Field>
      <FormGrid cols={2}>
        <Field label="Contact">
          <Select value={contact} onChange={(e) => handleContact(e.target.value)}>
            <option value="">— Choisir —</option>
            {contacts.map((c) => (
              <option key={c.id} value={`${c.first_name} ${c.last_name}`}>{c.first_name} {c.last_name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Entreprise">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Entreprise" />
        </Field>
      </FormGrid>
      <FormGrid cols={2}>
        <Field label="Étape">
          <Select value={stage} onChange={(e) => setStage(e.target.value as DealStage)}>
            {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </Select>
        </Field>
        <Field label="Clôture prévue">
          <Input type="date" value={expectedClose ?? ""} onChange={(e) => setExpectedClose(e.target.value)} />
        </Field>
      </FormGrid>

      <div className="rounded-lg border border-zinc-200 p-4">
        <DealLinesEditor lines={lines} onChange={setLines} products={products} />
        {lines.length === 0 && (
          <div className="mt-3">
            <Field label="Montant (€) si pas de lignes produit">
              <Input type="number" min={0} step={0.01} value={manualAmount}
                onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)} placeholder="0" />
            </Field>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-indigo-700">Montant calculé</span>
          <span className="text-base font-bold text-indigo-700">{computedAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
      )}

      <Field label="Notes">
        <Textarea rows={2} value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} placeholder="Contexte, prochaines étapes…" />
      </Field>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}

function DealCard({ deal, onEdit, onDelete, overlay = false }: {
  deal: Deal; onEdit: () => void; onDelete: () => void; overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-lg border bg-white p-3 shadow-sm transition-all select-none ${
        isDragging ? "opacity-30 scale-95" : "hover:border-indigo-200 hover:shadow-md"
      } ${overlay ? "rotate-1 shadow-xl" : ""} cursor-grab active:cursor-grabbing`}
    >
      <p className="text-xs font-semibold text-zinc-800 leading-snug">{deal.title}</p>
      <p className="mt-0.5 text-xs text-zinc-400">{deal.company}</p>
      {deal.lines && deal.lines.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {deal.lines.slice(0, 2).map((l) => (
            <p key={l.id} className="text-xs text-zinc-400">{l.product_name} × {l.quantity} {l.unit}</p>
          ))}
          {deal.lines.length > 2 && <p className="text-xs text-zinc-300">+{deal.lines.length - 2} ligne(s)</p>}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-600">{deal.amount.toLocaleString("fr-FR")} €</span>
        {!overlay && (
          <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={onEdit} className="rounded p-1 text-zinc-300 hover:text-indigo-500 transition-colors">
              <Pencil className="h-3 w-3" />
            </button>
            <button onClick={onDelete} className="rounded p-1 text-zinc-300 hover:text-red-400 transition-colors">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      {deal.expected_close && (
        <p className="mt-1 text-xs text-zinc-400">{deal.expected_close}</p>
      )}
    </div>
  );
}

function KanbanColumn({ stage, deals, onEdit, onDelete }: {
  stage: typeof DEAL_STAGES[0];
  deals: Deal[];
  onEdit: (d: Deal) => void;
  onDelete: (d: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  const total = deals.reduce((s, d) => s + d.amount, 0);

  return (
    <div
      ref={setNodeRef}
      className={`w-56 shrink-0 rounded-xl border p-3 transition-colors ${
        isOver ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-700">{stage.label}</span>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">{deals.length}</span>
      </div>
      {total > 0 && <p className="mb-2 text-xs text-zinc-400">{total.toLocaleString("fr-FR")} €</p>}
      <div className="min-h-[48px] space-y-2">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} onEdit={() => onEdit(d)} onDelete={() => onDelete(d)} />
        ))}
        {deals.length === 0 && (
          <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-zinc-200">
            <p className="text-xs text-zinc-300">Déposer ici</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineClient({ initialDeals, contacts, products }: {
  initialDeals: Deal[];
  contacts: Contact[];
  products: Product[];
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Deal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string);

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const newStage = over.id as DealStage;
    setDeals((prev) => prev.map((d) => d.id === active.id ? { ...d, stage: newStage } : d));
    const deal = deals.find((d) => d.id === active.id)!;
    await fetch(`/api/deals/${active.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...deal, stage: newStage }),
    });
  };

  async function handleCreate(data: Omit<Deal, "id">) {
    const res = await fetch("/api/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const created = await res.json();
    setDeals((prev) => [created, ...prev]);
    setCreateOpen(false);
  }

  async function handleUpdate(id: string, data: Omit<Deal, "id">) {
    const res = await fetch(`/api/deals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const updated = await res.json();
    setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    setDeals((prev) => prev.filter((d) => d.id !== id));
    setDeleteTarget(null);
  }

  const activeDeal = deals.find((d) => d.id === activeId);
  const activeDealsCount = deals.filter((d) => !["won", "lost"].includes(d.stage)).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Pipeline</h1>
          <p className="mt-1 text-sm text-zinc-500">{activeDealsCount} deal{activeDealsCount > 1 ? "s" : ""} en cours</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          + Nouveau deal
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.key}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage.key)}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDeal && (
            <div className="w-56">
              <DealCard deal={activeDeal} onEdit={() => {}} onDelete={() => {}} overlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau deal" size="md">
        <DealForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Créer le deal"
          contacts={contacts}
          products={products}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier le deal" size="md">
        {editTarget && (
          <DealForm
            initial={editTarget}
            onSubmit={(d) => handleUpdate(editTarget.id, d)}
            onCancel={() => setEditTarget(null)}
            submitLabel="Enregistrer"
            contacts={contacts}
            products={products}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Supprimer le deal"
        message={`Supprimer "${deleteTarget?.title}" ?`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
