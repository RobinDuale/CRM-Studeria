export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-bold text-zinc-300">404</p>
        <p className="mt-2 text-sm text-zinc-500">Page introuvable</p>
        <a href="/dashboard" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          Retour au tableau de bord
        </a>
      </div>
    </div>
  );
}
