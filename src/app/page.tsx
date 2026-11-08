import Link from "next/link";
import { getSettings, listProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const PALETTE = [
  { name: "Rouge intense", color: "#A92B45" },
  { name: "Ivoire", color: "#F1E5D3" },
  { name: "Rose poudré", color: "#E3B7C4" },
  { name: "Lavande", color: "#A296C6" },
  { name: "Bleu ciel", color: "#A9C6D8" },
  { name: "Pistache", color: "#9DBE9D" },
  { name: "Cacao", color: "#7A5C4E" },
  { name: "Vanille dorée", color: "#E2C288" },
];

export default async function HomePage() {
  const settings = await getSettings();
  const bestsellers = await listProducts({ bestsellers: true, limit: 4 });
  const fallback = bestsellers.length
    ? bestsellers
    : await listProducts({ featuredOnly: true, limit: 4 });

  const heroHeadline = settings.hero_headline || "Des macarons d'exception, faits avec amour";
  const instagram = settings.instagram;

  return (
    <div>
      {/* ————— Héro ————— */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-macarons.jpg"
          alt="Macarons artisanaux rouges et ivoires sur assiette dorée"
          className="absolute inset-0 h-full w-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/70 via-ink-deep/25 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-36">
          <p className="font-script text-3xl text-blush animate-fade-up sm:text-4xl">
            L'art du macaron
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] text-paper animate-fade-up delay-1 sm:text-5xl lg:text-6xl">
            {heroHeadline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/85 animate-fade-up delay-2 sm:text-lg">
            Atelier artisanal à {settings.city}. Macarons, coffrets, pyramides et
            centres de table composés selon vos envies.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up delay-3">
            <Link
              href="/coffrets"
              className="rounded-full bg-paper px-8 py-4 text-sm tracking-wide2 text-ink uppercase transition hover:bg-blush"
            >
              Découvrir nos coffrets
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-paper/70 px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-paper/10"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ————— Valeurs ————— */}
      <section className="border-b border-line bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Qualité", "Des macarons artisanaux, préparés à la commande."],
            ["Précision", "Coques fines, décors et détails soignés à la main."],
            ["Élégance", "Des présentations dignes des plus belles tables."],
          ].map(([t, d]) => (
            <div key={t} className="px-2 py-8 text-center sm:px-6">
              <p className="text-xs tracking-luxe text-mauve-deep uppercase">{t}</p>
              <p className="mt-2 text-sm text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ————— Coups de cœur ————— */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-luxe text-mauve uppercase">Les incontournables</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Les coups de cœur de l'atelier
            </h2>
          </div>
          <Link
            href="/boutique"
            className="group text-sm tracking-wide2 uppercase"
          >
            <span className="text-mauve-deep underline-offset-4 group-hover:underline">
              Toute la boutique
            </span>
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {fallback.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ————— Collections ————— */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/macarons" className="group relative block overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-macarons.jpg"
              alt="Nos macarons"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="font-script text-2xl text-blush">La collection</p>
              <h3 className="mt-1 font-serif text-3xl text-paper">Nos Macarons</h3>
              <p className="mt-2 max-w-xs text-sm text-paper/80">
                Des macarons classiques aux coques fines, prêts à savourer.
              </p>
              <span className="mt-4 inline-block rounded-full border border-paper/70 px-5 py-2 text-xs tracking-wide2 text-paper uppercase transition group-hover:bg-paper group-hover:text-ink">
                Découvrir →
              </span>
            </div>
          </Link>
          <Link href="/coffrets" className="group relative block overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/coffret-ruban.jpg"
              alt="Nos coffrets"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="font-script text-2xl text-blush">Prêts à offrir</p>
              <h3 className="mt-1 font-serif text-3xl text-paper">Nos Coffrets</h3>
              <p className="mt-2 max-w-xs text-sm text-paper/80">
                Boîtes rubanées et coffrets mariage aux décorations or.
              </p>
              <span className="mt-4 inline-block rounded-full border border-paper/70 px-5 py-2 text-xs tracking-wide2 text-paper uppercase transition group-hover:bg-paper group-hover:text-ink">
                Découvrir →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ————— L'atelier ————— */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-2xl border border-accent/50" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/atelier.jpg"
              alt="La réalisation d'un macaron à l'atelier"
              className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-soft"
            />
          </div>
          <div>
            <p className="font-script text-3xl text-mauve">L'atelier</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              Faits main, avec amour,
              <br />
              et selon vos envies
            </h2>
            <p className="mt-6 leading-relaxed text-ink-soft">
              Baked with Love est un atelier spécialisé en macarons artisanaux, à{" "}
              {settings.city}. Chaque création est réalisée avec amour : coques
              travaillées, garnitures légères, coloris choisis avec vous pour
              épouser le thème de votre événement.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Macarons préparés à la commande, pour une fraîcheur absolue",
                "Créations personnalisées — coloris, décorations, texte",
                "Pyramides, boîtes et centres de table sur mesure",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush text-[10px] text-ink">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-xl border border-line bg-paper px-5 py-4 text-sm text-ink-soft">
              Pensez à commander à l'avance pour garantir la disponibilité de votre
              modèle.
            </p>
            <Link
              href="/a-propos"
              className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
            >
              Notre histoire
            </Link>
          </div>
        </div>
      </section>

      {/* ————— Palette ————— */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="text-xs tracking-luxe text-mauve uppercase">La palette de l'atelier</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
          Une harmonie douce et précieuse
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Composée avec vous, pour épouser le thème de votre événement — du plus
          délicat au plus intense.
        </p>
        <div className="mt-12 grid grid-cols-4 gap-6 sm:grid-cols-8">
          {PALETTE.map((c) => (
            <div key={c.name} className="group flex flex-col items-center gap-3">
              <span
                className="h-14 w-14 rounded-full border border-ink/10 shadow-card transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-center text-[11px] leading-tight text-ink-soft">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ————— Occasions ————— */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-luxe text-mauve uppercase">Coffrets &amp; occasions</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
            Pour vos plus beaux moments
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              img: "/images/coffret-mariage-or.jpg",
              tag: "Mariage & fiançailles",
              text: "Coffrets ornés d'anneaux dorés, centres de table et pyramides pour vos plus belles tables.",
              href: "/coffrets",
              cta: "Voir les coffrets",
            },
            {
              img: "/images/coffret-ruban.jpg",
              tag: "Cadeaux gourmands",
              text: "Des boîtes nouées de ruban et signées de l'atelier, prêtes à offrir sans mot dire.",
              href: "/coffrets",
              cta: "Choisir un coffret",
            },
            {
              img: "/images/pyramide.jpg",
              tag: "Événements sur mesure",
              text: "Pyramides et centres de table composés selon votre thème, vos couleurs, vos envies.",
              href: "/contact",
              cta: "Parler de votre projet",
            },
          ].map((c) => (
            <Link
              key={c.tag}
              href={c.href}
              className="group overflow-hidden rounded-2xl border border-line bg-paper shadow-card transition hover:shadow-soft"
            >
              <div className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.tag}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-[11px] tracking-luxe text-mauve uppercase">{c.tag}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                <span className="mt-4 inline-block text-xs tracking-wide2 text-ink uppercase group-hover:text-mauve-deep">
                  {c.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ————— Bandeau CTA ————— */}
      <section className="bg-ink-deep">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-script text-3xl text-blush">Une occasion à célébrer ?</p>
          <h2 className="mt-3 font-serif text-3xl leading-snug text-paper sm:text-4xl">
            Commandez à l'avance pour garantir
            <br className="hidden sm:block" /> la disponibilité de votre modèle
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-paper/70">
            Nous vous confirmerons la disponibilité et les modalités de votre
            commande.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/boutique"
              className="rounded-full bg-blush px-8 py-4 text-sm tracking-wide2 text-ink uppercase transition hover:bg-paper"
            >
              Voir la boutique
            </Link>
            {instagram && (
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-paper/50 px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-paper/10"
              >
                Suivre l'atelier
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
