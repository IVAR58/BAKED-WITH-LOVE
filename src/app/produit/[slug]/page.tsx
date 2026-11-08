import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getSettings, listProducts } from "@/lib/store";
import { ProductGallery } from "@/components/ProductGallery";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { formatDZD, waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Produit introuvable" };
  return {
    title: p.name,
    description: p.shortDescription || "Macaron artisanal de l'atelier Baked with Love.",
    openGraph: p.images[0] ? { images: [{ url: p.images[0] }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const settings = await getSettings();
  const related = product.categorySlug
    ? (await listProducts({ category: product.categorySlug, limit: 8 }))
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  const soldOut = !product.available || product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Fil d'Ariane */}
      <nav className="mb-10 flex flex-wrap items-center gap-2 text-xs tracking-wide2 text-ink-soft uppercase">
        <Link href="/" className="transition hover:text-mauve">Accueil</Link>
        <span>/</span>
        <Link href="/boutique" className="transition hover:text-mauve">Boutique</Link>
        {product.categorySlug && (
          <>
            <span>/</span>
            <Link
              href={`/${product.categorySlug === "macarons" ? "macarons" : product.categorySlug === "coffrets" ? "coffrets" : "boutique"}`}
              className="transition hover:text-mauve"
            >
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="text-xs tracking-luxe text-mauve uppercase">
            {product.categoryName ?? "Atelier"}
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-serif text-3xl">{formatDZD(product.price)}</span>
            {product.limited && (
              <span className="rounded-full bg-blush-soft px-3 py-1 text-[10px] tracking-wide2 text-mauve-deep uppercase">
                Édition limitée
              </span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-ink px-3 py-1 text-[10px] tracking-wide2 text-blush uppercase">
                Coup de cœur
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-soft">
            {product.shortDescription}
          </p>
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          {product.flavors.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-xs tracking-luxe text-ink uppercase">
                Saveurs &amp; coloris
              </p>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-line bg-cream px-4 py-1.5 text-xs text-ink-soft"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="my-8 h-px bg-line" />

          {!soldOut && <AddToCart product={product} />}

          <div className="mt-8 space-y-3 rounded-xl bg-cream px-5 py-5 text-sm text-ink-soft">
            <p className="flex items-start gap-2.5">
              <span className="mt-0.5 text-mauve">◆</span>
              {settings.deliveryZones}
            </p>
            <p className="flex items-start gap-2.5">
              <span className="mt-0.5 text-mauve">◆</span>
              Chaque création est réalisée avec amour et selon vos envies —
              pensez à commander à l'avance.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {settings.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-ink px-6 py-3 text-xs tracking-wide2 uppercase transition hover:bg-ink hover:text-paper"
              >
                Infos en DM — Instagram
              </a>
            )}
            {settings.whatsapp && (
              <a
                href={waLink(settings.whatsapp, `Bonjour, je souhaite des informations sur « ${product.name} ».`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-ink px-6 py-3 text-xs tracking-wide2 uppercase transition hover:bg-ink hover:text-paper"
              >
                Écrire sur WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl">Vous aimerez aussi</h2>
            <Link href="/boutique" className="text-sm tracking-wide2 text-mauve-deep uppercase hover:underline">
              Tout voir →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
