"use client";

import { Modal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirmer", danger = false }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-zinc-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          Annuler
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`rounded-md px-3.5 py-2 text-sm font-medium text-white transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
