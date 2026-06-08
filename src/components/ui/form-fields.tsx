import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-zinc-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn("w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition", className)}
      {...props}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn("w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition resize-none", className)}
      {...props}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn("w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition bg-white", className)}
      {...props}
    >
      {children}
    </select>
  );
}

interface FormGridProps { children: React.ReactNode; cols?: 1 | 2; }
export function FormGrid({ children, cols = 2 }: FormGridProps) {
  return (
    <div className={cn("grid gap-4", cols === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {children}
    </div>
  );
}

interface FormActionsProps { onCancel: () => void; submitLabel?: string; }
export function FormActions({ onCancel, submitLabel = "Enregistrer" }: FormActionsProps) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-md border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
        Annuler
      </button>
      <button type="submit" className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
        {submitLabel}
      </button>
    </div>
  );
}
