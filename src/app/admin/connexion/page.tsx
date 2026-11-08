"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminConnexionPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Identifiants incorrects.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-script text-5xl text-ink">Baked with love</span>
          <span className="mt-2 block text-[10px] tracking-luxe text-mauve uppercase">
            Espace de l'atelier
          </span>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-line bg-paper p-8 shadow-card"
        >
          <h1 className="font-serif text-2xl">Connexion</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Réservé à l'équipe de la pâtisserie.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs tracking-wide2 text-ink uppercase">
                Nom d'utilisateur
              </label>
              <input
                className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-sm focus:border-mauve"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs tracking-wide2 text-ink uppercase">
                Mot de passe
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-sm focus:border-mauve"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-blush-soft px-4 py-3 text-sm text-mauve-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-ink px-6 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-mauve-deep underline underline-offset-4">
            ← Retour à la boutique
          </Link>
        </p>
      </div>
    </div>
  );
}
