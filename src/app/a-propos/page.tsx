import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Baked with Love, pâtisserie artisanale à Bordj Bou Arreridj : un atelier spécialisé en macarons, où chaque création est réalisée avec amour et selon vos envies.",
};

export default async function AProposPage() {
  const s = await getSettings();

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="font-script text-3xl text-mauve">Notre maison</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            L'atelier {s.store_name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            {s.tagline} — {s.city}. Qualité, précision et élégance.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl leading-snug">
            Spécialistes du macaron,
            <br />
            à {s.city}
          </h2>
          <p className="mt-6 leading-relaxed text-ink-soft">
            Baked with Love est un atelier spécialisé en macarons artisanaux.
            Ici, pas de production en série : chaque création est préparée à la
            commande, avec des coques travaillées à la main et des garnitures
            légères.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Chaque création est réalisée avec <em className="font-serif">amour</em> et
            selon vos envies — du simple assortiment au centre de table, en
            passant par la pyramide de macarons. Coloris, décorations, texte :
            tout se compose avec vous pour épouser le thème de votre événement.
          </p>
          <div className="mt-8 rounded-xl border border-line bg-cream px-6 py-5">
            <p className="font-serif text-lg">« Nous vous confirmerons la disponibilité et les modalités de votre commande. »</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-4 -top-4 h-full w-full rounded-2xl border border-accent/50" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pyramide.jpg"
            alt="Pyramide de macarons de l'atelier"
            className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                t: "Qualité",
                d: "Des macarons artisanaux, préparés à la commande pour une fraîcheur absolue.",
              },
              {
                t: "Précision",
                d: "Coques fines, décorations et détails travaillés à la main, à chaque fois.",
              },
              {
                t: "Élégance",
                d: "Des présentations et des palettes dignes des plus belles tables.",
              },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl bg-paper p-8 text-center shadow-card">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blush-soft font-serif text-lg text-mauve-deep">
                  {v.t.charAt(0)}
                </span>
                <h3 className="text-xs tracking-luxe text-mauve-deep uppercase">{v.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{v.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs tracking-luxe text-mauve uppercase">Comment nous travaillons</p>
              <h3 className="mt-3 font-serif text-3xl">Une commande, une pièce unique</h3>
              <ul className="mt-7 space-y-4 text-sm">
                {[
                  "Vous nous écrivez votre projet : modèle, date, couleurs, thème.",
                  "Nous vous confirmons la disponibilité et les modalités.",
                  "Nous réalisons votre création, pièce par pièce.",
                  "Récupération à l'atelier ou livraison — selon votre wilaya.",
                ].map((t, i) => (
                  <li key={t} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-sm text-paper">
                      {i + 1}
                    </span>
                    <span className="pt-1.5 text-ink-soft">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-paper p-10 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/atelier.jpg" alt="L'atelier" className="h-52 w-44 rounded-xl object-cover" />
              <p className="text-sm text-ink-soft">
                Pensez à commander à l'avance pour garantir la disponibilité de
                votre modèle.
              </p>
              <Link
                href="/contact"
                className="rounded-full bg-ink px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
              >
                Écrire à l'atelier
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
