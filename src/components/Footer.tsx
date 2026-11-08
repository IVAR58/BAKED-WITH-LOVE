import Link from "next/link";
import { waLink } from "@/lib/utils";

export function Footer({
  storeName,
  storeSubtitle,
  tagline,
  city,
  instagram,
  whatsapp,
  phone,
  logoUrl,
}: {
  storeName: string;
  storeSubtitle: string;
  tagline: string;
  city: string;
  instagram: string;
  whatsapp: string;
  phone: string;
  logoUrl: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} className="mb-4 h-14 w-auto" />
          ) : (
            <span className="mb-3 block">
              <span className="font-script text-3xl leading-none">{storeName}</span>
              <span className="mt-1 block text-[9px] tracking-luxe text-mauve uppercase">
                {storeSubtitle}
              </span>
            </span>
          )}
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            {tagline} — {city}. Commandes &amp; livraison.
          </p>
          <p className="mt-4 text-[11px] tracking-luxe text-mauve uppercase">
            Qualité • Précision • Élégance
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-xs tracking-luxe text-ink uppercase">Navigation</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/", label: "Accueil" },
              { href: "/macarons", label: "Nos Macarons" },
              { href: "/coffrets", label: "Nos Coffrets" },
              { href: "/boutique", label: "Toute la boutique" },
              { href: "/a-propos", label: "À propos" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-soft transition hover:text-mauve-deep">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs tracking-luxe text-ink uppercase">Nos univers</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/macarons" className="text-ink-soft transition hover:text-mauve-deep">Macarons classiques</Link></li>
            <li><Link href="/coffrets" className="text-ink-soft transition hover:text-mauve-deep">Coffrets de macarons</Link></li>
            <li><Link href="/boutique" className="text-ink-soft transition hover:text-mauve-deep">Centres de table</Link></li>
            <li><Link href="/boutique" className="text-ink-soft transition hover:text-mauve-deep">Collections spéciales</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs tracking-luxe text-ink uppercase">Contact</h3>
          <ul className="space-y-3 text-sm text-ink-soft">
            <li className="flex items-center gap-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-mauve">
                <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6.6 5.5 5.5 0 0 1 21.5 12c-2.5 4.4-9.5 9-9.5 9Z" />
              </svg>
              Infos &amp; commandes en DM
            </li>
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition hover:text-mauve-deep">
                  {phone}
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={waLink(whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-mauve-deep"
                >
                  WhatsApp — {whatsapp}
                </a>
              </li>
            )}
          </ul>
          {instagram && (
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-xs tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
              @{instagram}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-ink-soft sm:flex-row">
          <p>
            © {year} {storeName} {storeSubtitle} — Tous droits réservés.
          </p>
          <p className="tracking-wide2">
            {city} · Commandes sur mesure
          </p>
        </div>
      </div>
    </footer>
  );
}
