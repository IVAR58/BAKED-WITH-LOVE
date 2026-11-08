import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-28 text-center">
      <p className="font-script text-5xl text-mauve">Oups…</p>
      <h1 className="mt-4 font-serif text-4xl">Cette page s'est envolée</h1>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
        Comme un macaron bien gardé, la page que vous cherchez a trouvé preneur.
        Retournez vers la boutique pour continuer votre parcours.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-ink px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/boutique"
          className="rounded-full border border-ink px-8 py-4 text-sm tracking-wide2 uppercase transition hover:bg-ink hover:text-paper"
        >
          Voir la boutique
        </Link>
      </div>
    </div>
  );
}
