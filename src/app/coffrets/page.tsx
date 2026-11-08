import type { Metadata } from "next";
import { BoutiqueClient } from "@/components/BoutiqueClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nos Coffrets",
  description:
    "Coffrets de macarons, coffrets cadeau rubanés et coffrets mariage aux décorations or — des créations prêtes à offrir, faites à la commande.",
};

export default function CoffretsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs tracking-luxe text-mauve uppercase">Prêts à offrir</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Nos Coffrets</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          De la boîte signature au coffret mariage orné d'anneaux dorés, chaque
          coffret est dressé avec soin et accompagne une carte signée de l'atelier.
        </p>
      </header>
      <BoutiqueClient initialCategory="coffrets" />
    </div>
  );
}
