"use client";

import { useCallback, useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort: number;
  active: boolean;
  productCount: number;
};

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [edit, setEdit] = useState({ name: "", description: "", sort: 0, active: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/categories?all=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d) => setCats(d.categories ?? []))
      .catch(() => setError("Impossible de charger les catégories."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setNewName("");
      setNewDesc("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(c: Category) {
    setEditId(c.id);
    setEdit({
      name: c.name,
      description: c.description ?? "",
      sort: c.sort,
      active: c.active,
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...edit }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setEditId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    if (!confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm focus:border-mauve transition";

  return (
    <div className="max-w-4xl">
      <p className="text-xs tracking-luxe text-mauve uppercase">Catalogue</p>
      <h1 className="mb-8 mt-1 font-serif text-3xl">Catégories</h1>

      {error && (
        <p className="mb-4 rounded-xl bg-blush-soft px-4 py-3 text-sm text-mauve-deep">{error}</p>
      )}

      <form onSubmit={add} className="mb-8 grid gap-4 rounded-2xl border border-line bg-paper p-6 sm:grid-cols-[1fr_1fr_auto]">
        <input
          className={inputCls}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom de la nouvelle catégorie"
          required
          minLength={2}
        />
        <input
          className={inputCls}
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description (facultatif)"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-full bg-ink px-6 py-3 text-xs tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep disabled:opacity-60"
        >
          {adding ? "Ajout…" : "+ Ajouter"}
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-cream-deep/50" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {cats.map((c) =>
            editId === c.id ? (
              <li key={c.id} className="rounded-2xl border border-mauve/40 bg-paper p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className={inputCls}
                    value={edit.name}
                    onChange={(e) => setEdit((x) => ({ ...x, name: e.target.value }))}
                    aria-label="Nom"
                  />
                  <input
                    className={inputCls}
                    value={edit.description}
                    onChange={(e) => setEdit((x) => ({ ...x, description: e.target.value }))}
                    aria-label="Description"
                    placeholder="Description"
                  />
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="number"
                      value={edit.sort}
                      onChange={(e) => setEdit((x) => ({ ...x, sort: Number(e.target.value) || 0 }))}
                      className="w-24 rounded-xl border border-line px-3 py-2.5 focus:border-mauve"
                    />
                    Ordre d'affichage
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={edit.active}
                      onChange={(e) => setEdit((x) => ({ ...x, active: e.target.checked }))}
                      className="h-4 w-4 accent-[#7E505C]"
                    />
                    Visible dans la boutique
                  </label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => saveEdit(c.id)}
                    disabled={saving}
                    className="rounded-full bg-ink px-6 py-2.5 text-xs tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep disabled:opacity-60"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="rounded-full border border-line px-6 py-2.5 text-xs tracking-wide2 uppercase transition hover:border-ink"
                  >
                    Annuler
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-paper px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {c.name}
                    {!c.active && (
                      <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[10px] tracking-wide text-ink-soft uppercase">
                        Masquée
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {c.description || "Sans description"} · {c.productCount} produit(s) ·
                    ordre {c.sort}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="rounded-full border border-line px-4 py-1.5 text-xs tracking-wide uppercase transition hover:border-mauve hover:text-mauve"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="rounded-full border border-line px-4 py-1.5 text-xs tracking-wide uppercase text-mauve-deep transition hover:border-mauve-deep hover:bg-mauve-deep hover:text-paper"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
