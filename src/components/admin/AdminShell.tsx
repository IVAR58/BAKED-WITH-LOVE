"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  {
    href: "/admin",
    label: "Vue d'ensemble",
    exact: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/commandes",
    label: "Commandes",
    exact: false,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7h16l-1.3 12a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 7Z" />
        <path d="M8.5 10V5.5a3.5 3.5 0 0 1 7 0V10" />
      </svg>
    ),
  },
  {
    href: "/admin/produits",
    label: "Produits",
    exact: false,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
        <path d="M4 7l8 4 8-4M12 11v10" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Catégories",
    exact: false,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.6 13.4 11 3.8A2 2 0 0 0 9.6 3H5a2 2 0 0 0-2 2v4.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8Z" />
        <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/admin/parametres",
    label: "Paramètres",
    exact: false,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
        <path d="M1.5 14h5M9.5 8h5M17.5 16h5" />
      </svg>
    ),
  },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOrders, setNewOrders] = useState(0);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/stats", { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (!stopped) setNewOrders(d.newOrders ?? 0);
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 30000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, []);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/connexion");
    router.refresh();
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
            isActive(n.href, n.exact)
              ? "bg-white/12 text-blush"
              : "text-white/70 hover:bg-white/8 hover:text-white"
          }`}
        >
          {n.icon}
          {n.label}
          {n.href === "/admin/commandes" && newOrders > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blush px-1.5 text-[11px] font-medium text-ink-deep">
              {newOrders}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  const bell = (
    <Link
      href="/admin/commandes"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
      aria-label={`Commandes (${newOrders} nouvelle${newOrders > 1 ? "s" : ""})`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z" />
        <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
      </svg>
      {newOrders > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blush px-1 text-[10px] font-semibold text-ink-deep">
          {newOrders > 9 ? "9+" : newOrders}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-deep px-5 py-8 lg:flex">
        <Link href="/admin" className="mb-10 block px-3">
          <span className="font-script text-3xl text-paper">Baked with love</span>
          <span className="mt-1 block text-[9px] tracking-luxe text-blush uppercase">
            Espace de l'atelier
          </span>
        </Link>
        {nav}
        <div className="mt-auto space-y-1 border-t border-white/10 pt-5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
            </svg>
            Voir la boutique
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
            Se déconnecter
          </button>
          <p className="px-4 pt-2 text-[11px] text-white/40">Connecté : {username}</p>
        </div>
      </aside>

      {/* Barre mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-ink-deep px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 5.5h14M3 10h14M3 14.5h14" />}
            </svg>
          </button>
          <span className="font-script text-2xl text-paper">Baked with love</span>
        </div>
        {bell}
      </header>

      {mobileOpen && (
        <div className="border-b border-white/10 bg-ink-deep px-4 py-4 lg:hidden animate-fade-in">
          {nav}
          <div className="mt-3 border-t border-white/10 pt-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/8"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Contenu desktop */}
      <div className="lg:pl-64">
        <div className="hidden items-center justify-between border-b border-line bg-paper px-8 py-4 lg:flex">
          <p className="text-xs tracking-luxe text-ink-soft uppercase">
            Espace d'administration — Baked with Love
          </p>
          {bell}
        </div>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
