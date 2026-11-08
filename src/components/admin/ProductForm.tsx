"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProductInput = {
  id?: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  categoryId: number | null;
  images: string[];
  flavors: string[];
  stock: number;
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  limited: boolean;
  sort: number;
};

type Category = { id: number; name: string; slug: string };

export function ProductForm({ product }: { product?: ProductInput }) {
  const router = useRouter();
  const editing = Boolean(product?.id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    stock: product?.stock?.toString() ?? "10",
    flavors: (product?.flavors ?? []).join(", "),
    available: product?.available ?? true,
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    limited: product?.limited ?? false,
    sort: product?.sort ?? 0,
    images: (product?.images ?? []) as string[],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories?all=1")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => undefined);
  }, []);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error ?? `Échec de l'upload de ${file.name}`);
        urls.push(d.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" }).catch(
      () => undefined,
    );
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  function makeCover(url: string) {
    setForm((f) => ({
      ...f,
      images: [url, ...f.images.filter((i) => i !== url)],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) {
      setError("Le nom du produit est requis.");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Le prix (en DZD) doit être un nombre positif.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        price,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
        flavors: form.flavors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: form.images,
        available: form.available,
        featured: form.featured,
        bestseller: form.bestseller,
        limited: form.limited,
        sort: form.sort,
      };
      const res = await fetch(editing ? `/api/products/${product!.id}` : "/api/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur lors de l'enregistrement.");
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm focus:border-mauve transition";
  const labelCls = "mb-1.5 block text-xs tracking-wide2 text-ink uppercase";

  return (
    <form onSubmit={submit} className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nom du produit *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex. Coffret Signature — 12 pièces"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Catégorie</label>
              <select
                className={inputCls}
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Prix (DZD) *</label>
              <input
                type="number"
                min={0}
                step={1}
                className={inputCls}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="Ex. 2500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description courte (carte produit)</label>
              <input
                className={inputCls}
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Une phrase qui présente la création."
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description complète</label>
              <textarea
                className={`${inputCls} min-h-32 resize-y`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Composée selon le thème de votre événement, décorations or, ruban de satin…"
              />
            </div>
            <div>
              <label className={labelCls}>Stock</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Ordre d'affichage</label>
              <input
                type="number"
                className={inputCls}
                value={form.sort}
                onChange={(e) => set("sort", Number(e.target.value) || 0)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Saveurs &amp; coloris (séparés par des virgules)</label>
              <input
                className={inputCls}
                value={form.flavors}
                onChange={(e) => set("flavors", e.target.value)}
                placeholder="Fraise, Vanille, Lavande"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-line bg-paper p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl">Photos du produit</h2>
              <p className="mt-1 text-xs text-ink-soft">
                JPG, PNG ou WebP — 5 Mo max. La première photo est la couverture.
              </p>
            </div>
            <label className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-xs tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep">
              {uploading ? "Envoi…" : "+ Ajouter des photos"}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onUpload}
              />
            </label>
          </div>
          {form.images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-cream px-6 py-10 text-center text-sm text-ink-soft">
              Aucune photo pour l'instant — ajoutez au moins une photo de votre création.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {form.images.map((url, i) => (
                <div key={url} className="group relative overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="aspect-[4/5] w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] tracking-wide text-paper uppercase">
                      Couverture
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(url)}
                        className="rounded-full bg-paper/90 px-2.5 py-1 text-[10px] text-ink"
                        title="Rendre couverture"
                      >
                        ★
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="rounded-full bg-paper/90 px-2.5 py-1 text-[10px] text-mauve-deep"
                      title="Retirer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colonne droite */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="mb-4 font-serif text-xl">Mise en avant</h2>
          <div className="space-y-3">
            {(
              [
                ["available", "Disponible à la vente"],
                ["featured", "Mis en vedette (page d'accueil)"],
                ["bestseller", "Coup de cœur (meilleures ventes)"],
                ["limited", "Édition limitée"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 transition hover:border-accent"
              >
                <span className="text-sm">{label}</span>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="h-4 w-4 accent-[#7E505C]"
                />
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-blush-soft px-4 py-3 text-sm text-mauve-deep">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-ink px-6 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer le produit"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-line px-6 py-4 text-sm tracking-wide2 uppercase transition hover:border-ink"
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}
