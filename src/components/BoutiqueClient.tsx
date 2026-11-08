"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductWithCategory } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

type Category = { id: number; name: string; slug: string };
type Sort = "newest" | "price_asc" | "price_desc" | "name";

export function BoutiqueClient({
  initialCategory,
  pageSize = 24,
}: {
  initialCategory?: string;
  pageSize?: number;
}) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(initialCategory ?? "");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search.trim()) params.set("search", search.trim());
    params.set("sort", sort);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  useEffect(() => {
    const t = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      if (p.categorySlug) m.set(p.categorySlug, (m.get(p.categorySlug) ?? 0) + 1);
    }
    return m;
  }, [products]);

  return (
    <div>
      {/* Filtres */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full px-4 py-2 text-xs tracking-wide2 uppercase transition ${
              category === ""
                ? "bg-ink text-paper"
                : "border border-line text-ink-soft hover:border-mauve hover:text-mauve"
            }`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug === category ? "" : c.slug)}
              className={`rounded-full px-4 py-2 text-xs tracking-wide2 uppercase transition ${
                category === c.slug
                  ? "bg-ink text-paper"
                  : "border border-line text-ink-soft hover:border-mauve hover:text-mauve"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="relative flex-1 lg:w-64">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.8-3.8" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full rounded-full border border-line bg-paper py-3 pl-11 pr-4 text-sm placeholder:text-ink-soft/70 focus:border-mauve"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-line bg-paper px-4 py-3 text-sm text-ink-soft focus:border-mauve"
            aria-label="Trier les produits"
          >
            <option value="newest">Nouveautés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="name">Nom A → Z</option>
          </select>
        </div>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] rounded-xl bg-cream-deep/60" />
              <div className="mt-4 h-3 w-1/3 rounded bg-cream-deep/60" />
              <div className="mt-2 h-5 w-4/5 rounded bg-cream-deep/60" />
              <div className="mt-2 h-4 w-1/4 rounded bg-cream-deep/60" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-line bg-cream px-8 py-14 text-center">
          <p className="font-serif text-xl">Une difficulté s'est présentée.</p>
          <button
            onClick={load}
            className="mt-5 rounded-full bg-ink px-7 py-3 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
          >
            Réessayer
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-line bg-cream px-8 py-14 text-center">
          <p className="font-serif text-xl">Aucun produit ne correspond à votre recherche.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Essayez un autre mot-clé ou parcourez l'ensemble de la boutique.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
            className="mt-5 rounded-full border border-ink px-7 py-3 text-sm tracking-wide2 uppercase transition hover:bg-ink hover:text-paper"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-xs tracking-wide2 text-ink-soft uppercase">
            {products.length} création{products.length > 1 ? "s" : ""}
            {counts.get(category) !== undefined && category ? " dans cette collection" : ""}
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, pageSize * 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
