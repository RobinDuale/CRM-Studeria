"use client";

import { useState } from "react";
import { Field, Input, Textarea, FormGrid, FormActions } from "@/components/ui/form-fields";
import type { Contact } from "@/lib/types";

type ContactFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
};

interface ContactFormProps {
  initial?: Partial<Contact>;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function ContactForm({ initial, onSubmit, onCancel, submitLabel }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    company: initial?.company ?? "",
    address: initial?.address ?? "",
    notes: initial?.notes ?? "",
  });

  const set = (k: keyof ContactFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGrid cols={2}>
        <Field label="Prénom" required>
          <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Sophie" required />
        </Field>
        <Field label="Nom" required>
          <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Martin" required />
        </Field>
      </FormGrid>
      <FormGrid cols={2}>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="s.martin@entreprise.fr" />
        </Field>
        <Field label="Téléphone">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="06 12 34 56 78" />
        </Field>
      </FormGrid>
      <Field label="Entreprise">
        <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Nom de l'entreprise" />
      </Field>
      <Field label="Adresse">
        <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Adresse" />
      </Field>
      <Field label="Notes">
        <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notes libres…" />
      </Field>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
