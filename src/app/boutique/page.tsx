import type { Metadata } from "next";
import { BoutiqueClient } from "@/components/BoutiqueClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Toute la boutique",
  description:
    "Macarons artisanaux, coffrets, centres de table et collections spéciales — l'ensemble des créations de l'atelier Baked with Love.",
};

export default function BoutiquePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs tracking-luxe text-mauve uppercase">L'atelier</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Toute la boutique</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Macarons classiques, coffrets, centres de table et collections spéciales :
          l'ensemble de nos créations, préparées à la commande.
        </p>
      </header>
      <BoutiqueClient />
    </div>
  );
}
