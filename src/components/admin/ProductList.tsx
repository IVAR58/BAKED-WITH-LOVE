"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDZD } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  limited: boolean;
  images: string[];
  categoryName: string | null;
};

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/products", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setError("Impossible de charger les produits."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function patch(id: number, patch: Record<string, unknown>) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...d.product } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Supprimer définitivement « ${p.name} » ?`)) return;
    setBusyId(p.id);
    setError("");
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Erreur");
      }
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-luxe text-mauve uppercase">Catalogue</p>
          <h1 className="mt-1 font-serif text-3xl">Produits</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-48 rounded-full border border-line bg-paper px-4 py-2.5 text-sm focus:border-mauve sm:w-64"
          />
          <Link
            href="/admin/produits/nouveau"
            className="rounded-full bg-ink px-5 py-2.5 text-xs tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
          >
            + Nouveau
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-blush-soft px-4 py-3 text-sm text-mauve-deep">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-cream-deep/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper px-8 py-14 text-center">
          <p className="font-serif text-xl">Aucun produit</p>
          <p className="mt-2 text-sm text-ink-soft">
            Créez votre premier produit pour alimenter la boutique.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] tracking-wide2 text-ink-soft uppercase">
                  <th className="px-5 py-4">Produit</th>
                  <th className="px-5 py-4">Catégorie</th>
                  <th className="px-5 py-4">Prix</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4 text-center">Disponible</th>
                  <th className="px-5 py-4 text-center">Vedette</th>
                  <th className="px-5 py-4 text-center">Cœur</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-cream/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="h-14 w-12 rounded-lg object-cover" />
                        ) : (
                          <span className="h-14 w-12 rounded-lg bg-cream" />
                        )}
                        <div className="min-w-0">
                          <p className="max-w-64 truncate font-medium">{p.name}</p>
                          <p className="text-xs text-ink-soft">
                            {p.limited && <span className="mr-2 text-mauve">Édition limitée</span>}
                            {p.images.length} photo(s)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{p.categoryName ?? "—"}</td>
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                      {formatDZD(p.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={p.stock <= 3 ? "font-medium text-mauve-deep" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Toggle
                        on={p.available}
                        busy={busyId === p.id}
                        onChange={() => patch(p.id, { available: !p.available })}
                        label="Disponible"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <Toggle
                        on={p.featured}
                        busy={busyId === p.id}
                        onChange={() => patch(p.id, { featured: !p.featured })}
                        label="En vedette"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <Toggle
                        on={p.bestseller}
                        busy={busyId === p.id}
                        onChange={() => patch(p.id, { bestseller: !p.bestseller })}
                        label="Coup de cœur"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/produits/${p.id}/edit`}
                          className="rounded-full border border-line px-4 py-1.5 text-xs tracking-wide uppercase transition hover:border-mauve hover:text-mauve"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => remove(p)}
                          disabled={busyId === p.id}
                          className="rounded-full border border-line px-4 py-1.5 text-xs tracking-wide uppercase text-mauve-deep transition hover:border-mauve-deep hover:bg-mauve-deep hover:text-paper disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  on,
  onChange,
  busy,
  label,
}: {
  on: boolean;
  onChange: () => void;
  busy: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onChange}
      disabled={busy}
      aria-label={label}
      className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${
        on ? "bg-mauve" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
