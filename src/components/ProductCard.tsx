"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import type { ProductWithCategory } from "@/lib/store";
import { formatDZD } from "@/lib/utils";

export function ProductCard({ product, index = 0 }: { product: ProductWithCategory; index?: number }) {
  const { add } = useCart();
  const soldOut = !product.available || product.stock <= 0;
  const image = product.images[0] ?? "";

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <div className="relative overflow-hidden rounded-xl bg-cream shadow-card transition-all duration-500 group-hover:shadow-soft">
        <div className="aspect-[4/5]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-soft">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
          )}
        </div>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.limited && !soldOut && (
            <span className="rounded-full bg-paper/90 px-3 py-1 text-[10px] tracking-wide2 text-mauve-deep uppercase backdrop-blur">
              Édition limitée
            </span>
          )}
          {product.bestseller && !soldOut && (
            <span className="rounded-full bg-ink/80 px-3 py-1 text-[10px] tracking-wide2 text-blush uppercase backdrop-blur">
              Coup de cœur
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-ink/30 px-5 py-2 text-xs tracking-luxe text-ink uppercase">
              Épuisé
            </span>
          </div>
        )}

        <button
          disabled={soldOut}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            add({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image,
            });
          }}
          className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-ink text-paper opacity-0 shadow-card transition-all duration-300 hover:bg-mauve-deep group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </div>

      <div className="px-1 pt-4">
        <p className="text-[10px] tracking-luxe text-mauve uppercase">
          {product.categoryName ?? "Atelier"}
        </p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug transition-colors group-hover:text-mauve-deep">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-serif text-lg">{formatDZD(product.price)}</span>
          {!soldOut && (
            <span className="text-[11px] tracking-wide2 text-ink-soft uppercase opacity-0 transition group-hover:opacity-100">
              Voir →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
