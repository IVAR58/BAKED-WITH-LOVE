import type { Metadata } from "next";
import { BoutiqueClient } from "@/components/BoutiqueClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nos Macarons",
  description:
    "Nos macarons artisanaux aux coques fines, garnis de crème légère. Assortiments et classiques de l'atelier, à Bordj Bou Arreridj.",
};

export default function MacaronsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs tracking-luxe text-mauve uppercase">La collection</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Nos Macarons</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Des coques fines et croustillantes, une crème légère montée sur le vif :
          nos macarons sont préparés à la commande pour rester au sommet de leur
          fraîcheur.
        </p>
      </header>
      <BoutiqueClient initialCategory="macarons" />
    </div>
  );
}
