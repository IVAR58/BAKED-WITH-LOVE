"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/macarons", label: "Nos Macarons" },
  { href: "/coffrets", label: "Nos Coffrets" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

function Logotype({
  storeName,
  storeSubtitle,
  logoUrl,
  light = false,
}: {
  storeName: string;
  storeSubtitle: string;
  logoUrl: string;
  light?: boolean;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={storeName} className="h-11 w-auto" />
    );
  }
  return (
    <span className="flex flex-col items-center leading-none">
      <span className={`font-script text-[26px] leading-none ${light ? "text-paper" : "text-ink"}`}>
        {storeName}
      </span>
      <span
        className={`mt-1 text-[9px] tracking-luxe uppercase ${light ? "text-blush" : "text-mauve"}`}
      >
        {storeSubtitle}
      </span>
    </span>
  );
}

export function Header({
  storeName,
  storeSubtitle,
  announcement,
  logoUrl,
}: {
  storeName: string;
  storeSubtitle: string;
  announcement: string;
  logoUrl: string;
}) {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50">
      {/* Bandeau annonce */}
      <div className="bg-ink-deep text-center">
        <p className="mx-auto max-w-6xl px-4 py-2.5 text-[10px] tracking-luxe text-blush uppercase">
          {announcement}
        </p>
      </div>

      <header
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-line bg-paper/95 shadow-card backdrop-blur-md"
            : "border-transparent bg-paper/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition hover:border-mauve lg:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
              {menu ? (
                <path d="M3 3l12 12M15 3L3 15" />
              ) : (
                <path d="M2 4.5h14M2 9h14M2 13.5h14" />
              )}
            </svg>
          </button>

          <Link href="/" className="shrink-0" aria-label="Accueil">
            <Logotype storeName={storeName} storeSubtitle={storeSubtitle} logoUrl={logoUrl} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative text-[13px] tracking-wide2 uppercase transition ${
                    active ? "text-mauve-deep" : "text-ink hover:text-mauve"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-1/2 h-px -translate-x-1/2 bg-mauve transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/boutique"
              className="hidden rounded-full border border-ink px-5 py-2.5 text-[12px] tracking-wide2 text-ink uppercase transition hover:bg-ink hover:text-paper md:block"
            >
              Boutique
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper transition hover:bg-mauve-deep"
              aria-label="Ouvrir le panier"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 8h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8Z" />
                <path d="M9 10V6a3 3 0 0 1 6 0v4" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-mauve px-1 text-[10px] font-medium text-paper">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menu && (
          <nav className="border-t border-line bg-paper px-6 py-4 lg:hidden animate-fade-in">
            <ul className="space-y-1">
              {LINKS.map((l) => {
                const active =
                  l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`block rounded-lg px-3 py-3 text-sm tracking-wide2 uppercase transition ${
                        active ? "bg-blush-soft text-mauve-deep" : "text-ink hover:bg-cream"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/boutique"
                  className="mt-2 block rounded-full bg-ink px-3 py-3 text-center text-sm tracking-wide2 text-paper uppercase"
                >
                  Toute la boutique
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </div>
  );
}
