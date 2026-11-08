"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatDZD } from "@/lib/utils";

export default function PanierPage() {
  const { items, subtotal, setQty, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-script text-4xl text-mauve">Votre panier</p>
        <h1 className="mt-3 font-serif text-4xl">Il est encore vide</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Laissez-vous tenter par nos macarons et nos coffrets, préparés à la
          commande.
        </p>
        <Link
          href="/boutique"
          className="mt-9 inline-block rounded-full bg-ink px-9 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="font-script text-3xl text-mauve">Votre sélection</p>
          <h1 className="mt-2 font-serif text-4xl">Le panier</h1>
        </div>
        <button
          onClick={clear}
          className="text-xs tracking-wide2 text-ink-soft uppercase underline-offset-4 transition hover:text-mauve-deep hover:underline"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap sm:p-6">
              <Link
                href={`/produit/${i.slug}`}
                className="block h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream"
              >
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/produit/${i.slug}`} className="font-serif text-lg leading-snug hover:text-mauve-deep">
                  {i.name}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">{formatDZD(i.price)} l'unité</p>
              </div>
              <div className="flex items-center rounded-full border border-line">
                <button
                  className="flex h-10 w-10 items-center justify-center text-ink-soft transition hover:text-mauve"
                  onClick={() => setQty(i.id, i.quantity - 1)}
                  aria-label="Diminuer"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">{i.quantity}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center text-ink-soft transition hover:text-mauve"
                  onClick={() => setQty(i.id, i.quantity + 1)}
                  aria-label="Augmenter"
                >
                  +
                </button>
              </div>
              <span className="w-24 text-right font-medium">{formatDZD(i.price * i.quantity)}</span>
              <button
                onClick={() => remove(i.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream hover:text-mauve-deep"
                aria-label={`Retirer ${i.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl bg-cream p-7">
          <h2 className="font-serif text-2xl">Résumé</h2>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="tracking-wide2 text-ink-soft uppercase">Sous-total</span>
            <span className="font-serif text-xl">{formatDZD(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            Les frais de livraison ou de récupération seront précisés lors de la
            validation de la commande.
          </p>
          <Link
            href="/commande"
            className="mt-6 block rounded-full bg-ink px-6 py-4 text-center text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
          >
            Passer commande
          </Link>
          <Link
            href="/boutique"
            className="mt-3 block rounded-full border border-ink px-6 py-4 text-center text-sm tracking-wide2 uppercase transition hover:bg-ink hover:text-paper"
          >
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
}
