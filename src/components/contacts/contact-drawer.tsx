"use client";

import { useState } from "react";
import { X, Pencil, Mail, Phone, Building2, MapPin, StickyNote, Calendar } from "lucide-react";
import type { Contact } from "@/lib/types";
import { ContactForm } from "./contact-form";

interface ContactDrawerProps {
  contact: Contact | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Omit<Contact, "id" | "created_at">>) => void;
}

export function ContactDrawer({ contact, onClose, onUpdate }: ContactDrawerProps) {
  const [editing, setEditing] = useState(false);

  if (!contact) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
            <div>
              <p className="font-semibold text-zinc-900">{contact.first_name} {contact.last_name}</p>
              <p className="text-xs text-zinc-400">{contact.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!editing && (
              <button onClick={() => setEditing(true)} className="rounded-md p-1.5 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {editing ? (
            <ContactForm
              initial={contact}
              onSubmit={(data) => {
                onUpdate(contact.id, data);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              submitLabel="Enregistrer"
            />
          ) : (
            <div className="space-y-5">
              {/* Coordonnées */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Coordonnées</h3>
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                      <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:underline">{contact.email}</a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-zinc-400" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-zinc-700">{contact.phone}</a>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="text-sm text-zinc-700">{contact.company}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
                      <span className="text-sm text-zinc-700 whitespace-pre-line">{contact.address}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Infos */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Informations</h3>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span className="text-sm text-zinc-500">Ajouté le {contact.created_at}</span>
                </div>
              </section>

              {/* Notes */}
              {contact.notes && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Notes</h3>
                  <div className="flex gap-3">
                    <StickyNote className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
                    <p className="text-sm text-zinc-700 whitespace-pre-line">{contact.notes}</p>
                  </div>
                </section>
              )}

              {/* Champs vides */}
              {(!contact.email || !contact.phone || !contact.address || !contact.notes) && (
                <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-center">
                  <p className="text-xs text-zinc-400">Certains champs sont vides.</p>
                  <button onClick={() => setEditing(true)} className="mt-1 text-xs text-indigo-500 hover:underline">
                    Compléter la fiche →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
