import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/store";
import { waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'atelier Baked with Love : infos et commandes en DM, Instagram @bakedwithl_ove, à Bordj Bou Arreridj.",
};

const STEPS = [
  {
    t: "Nom & prénom",
    d: "Le nom de la personne destinataire de la commande.",
  },
  {
    t: "Numéro de téléphone",
    d: "Pour vous joindre et confirmer les détails.",
  },
  {
    t: "Le modèle souhaité",
    d: "Coffret, pyramide, centre de table… choisissez votre création.",
  },
  {
    t: "La date souhaitée",
    d: "Récupération à l'atelier ou livraison.",
  },
  {
    t: "Adresse complète",
    d: "Uniquement pour la livraison.",
  },
  {
    t: "Les détails de personnalisation",
    d: "Texte, couleurs, thème de votre événement.",
  },
];

export default async function ContactPage() {
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="max-w-2xl">
        <p className="font-script text-3xl text-mauve">Écrivons-nous</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Contact</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          {s.tagline} — {s.city}. Commandes &amp; livraison. Nous vous répondrons
          avec plaisir pour composer votre création.
        </p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <a
          href={`https://instagram.com/${s.instagram}`}
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl border border-line bg-cream p-8 transition hover:shadow-soft lg:col-span-2"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper transition group-hover:bg-mauve-deep">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div>
              <h2 className="font-serif text-2xl">Instagram — @{s.instagram}</h2>
              <p className="mt-1 text-sm text-ink-soft">Infos &amp; commandes en DM</p>
            </div>
          </div>
          <p className="mt-6 leading-relaxed text-ink-soft">
            Notre canal principal d'échange : envoyez-nous votre projet en
            message privé — modèle, date, thème — et nous vous confirmerons la
            disponibilité ainsi que les modalités de votre commande.
          </p>
          <span className="mt-6 inline-block rounded-full bg-ink px-7 py-3.5 text-sm tracking-wide2 text-paper uppercase transition group-hover:bg-mauve-deep">
            Ouvrir Instagram
          </span>
        </a>

        <Link
          href="/boutique"
          className="group flex flex-col justify-between rounded-2xl bg-ink-deep p-8 text-paper transition hover:shadow-soft"
        >
          <div>
            <p className="font-script text-3xl text-blush">Ou simplement</p>
            <h2 className="mt-2 font-serif text-2xl">Commander sur le site</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/75">
              Parcourez la boutique, composez votre panier et validez votre
              commande en quelques minutes.
            </p>
          </div>
          <span className="mt-8 inline-block w-fit rounded-full bg-blush px-7 py-3.5 text-sm tracking-wide2 text-ink uppercase transition group-hover:bg-paper">
            Voir la boutique →
          </span>
        </Link>
      </div>

      {s.whatsapp && (
        <a
          href={waLink(s.whatsapp, "Bonjour, je souhaite des informations sur vos macarons.")}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-cream px-8 py-6 transition hover:shadow-soft"
        >
          <div>
            <h2 className="font-serif text-xl">WhatsApp</h2>
            <p className="mt-1 text-sm text-ink-soft">{s.whatsapp}</p>
          </div>
          <span className="text-sm tracking-wide2 text-mauve-deep uppercase group-hover:underline">
            Écrire →
          </span>
        </a>
      )}

      {/* Comment commander */}
      <section className="mt-24">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-luxe text-mauve uppercase">La commande pas à pas</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Comment commander ?</h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((st, i) => (
            <div key={st.t} className="bg-paper p-8">
              <span className="font-serif text-3xl text-accent">0{i + 1}</span>
              <h3 className="mt-3 font-medium tracking-wide2 uppercase text-ink">{st.t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{st.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-cream px-7 py-6 text-sm leading-relaxed text-ink-soft">
            <span className="mr-2 text-mauve">♥</span>
            Nous vous confirmerons la disponibilité et les modalités de votre
            commande. Merci pour votre confiance !
          </div>
          <div className="rounded-2xl border border-line px-7 py-6 text-sm leading-relaxed text-ink-soft">
            <span className="mr-2 text-mauve">◆</span>
            Pensez à commander à l'avance pour garantir la disponibilité de votre
            modèle.
          </div>
        </div>
      </section>
    </div>
  );
}
