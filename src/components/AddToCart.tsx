"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { ProductWithCategory } from "@/lib/store";

export function AddToCart({ product }: { product: ProductWithCategory }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const soldOut = !product.available || product.stock <= 0;

  if (soldOut) {
    return (
      <div className="rounded-xl border border-line bg-cream px-5 py-4 text-center text-sm tracking-wide2 text-ink-soft uppercase">
        Actuellement épuisé — revenez bientôt
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-line">
          <button
            className="flex h-12 w-12 items-center justify-center text-lg text-ink-soft transition hover:text-mauve"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
          >
            −
          </button>
          <span className="w-10 text-center font-medium">{qty}</span>
          <button
            className="flex h-12 w-12 items-center justify-center text-lg text-ink-soft transition hover:text-mauve"
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            aria-label="Augmenter la quantité"
          >
            +
          </button>
        </div>
        <button
          onClick={() =>
            add({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: product.images[0],
            }, qty)
          }
          className="flex-1 rounded-full bg-ink px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
        >
          Ajouter au panier
        </button>
      </div>
      {product.stock <= 5 && (
        <p className="mt-3 text-xs text-mauve-deep">
          Plus que {product.stock} en stock — pensez à commander à l'avance.
        </p>
      )}
    </div>
  );
}
