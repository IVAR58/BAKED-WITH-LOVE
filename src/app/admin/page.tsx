import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/store";
import { formatDZD, formatDateTimeFr, statusLabel } from "@/lib/utils";
import { StatusPill } from "@/components/admin/StatusPill";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/connexion");

  const stats = await getDashboardStats();

  const cards = [
    { label: "Commandes totales", value: String(stats.total), href: "/admin/commandes" },
    { label: "Chiffre d'affaires", value: formatDZD(stats.revenue), href: "/admin/commandes" },
    { label: "Nouvelles commandes", value: String(stats.newOrders), href: "/admin/commandes" },
    { label: "En cours de traitement", value: String(stats.pending), href: "/admin/commandes" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-luxe text-mauve uppercase">Tableau de bord</p>
          <h1 className="mt-1 font-serif text-3xl">Bonjour, {admin.username}</h1>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="rounded-full bg-ink px-6 py-3 text-xs tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
        >
          + Nouveau produit
        </Link>
      </div>

      {/* Cartes */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-line bg-paper p-6 transition hover:shadow-card"
          >
            <p className="text-xs tracking-wide2 text-ink-soft uppercase">{c.label}</p>
            <p className="mt-2 font-serif text-3xl">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Commandes récentes */}
        <section className="rounded-2xl border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-serif text-xl">Dernières commandes</h2>
            <Link
              href="/admin/commandes"
              className="text-xs tracking-wide2 text-mauve-deep uppercase hover:underline"
            >
              Tout voir →
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-serif text-lg">Aucune commande pour le moment</p>
              <p className="mt-2 text-sm text-ink-soft">
                Les commandes passées sur la boutique apparaîtront ici instantanément.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {stats.recent.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
                  <div className="min-w-32">
                    <p className="text-sm font-medium">{o.ref}</p>
                    <p className="text-xs text-ink-soft">{formatDateTimeFr(o.createdAt)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{o.customerName}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {[o.commune, o.wilaya].filter(Boolean).join(" — ")}
                      {" · "}
                      {o.items.reduce((a: number, i) => a + i.quantity, 0)} article(s)
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatDZD(o.total)}</span>
                  <StatusPill status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          {/* Meilleures ventes */}
          <section className="rounded-2xl border border-line bg-paper">
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-serif text-xl">Meilleures ventes</h2>
            </div>
            {stats.bestSellers.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-soft">
                Les ventes apparaîtront ici après vos premières commandes.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {stats.bestSellers.map((b, i) => (
                  <li key={b.name} className="flex items-center gap-4 px-6 py-3.5">
                    <span className="w-5 font-serif text-lg text-accent">{i + 1}</span>
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt="" className="h-11 w-10 rounded-md object-cover" />
                    ) : (
                      <span className="h-11 w-10 rounded-md bg-cream" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">{b.name}</span>
                    <span className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink-soft">
                      × {b.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Répartition statuts */}
          <section className="rounded-2xl border border-line bg-paper">
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-serif text-xl">Répartition des commandes</h2>
            </div>
            <ul className="space-y-3 px-6 py-5">
              {(["nouvelle", "confirmee", "en_preparation", "en_livraison", "livree", "annulee"] as const)
                .map((s) => ({
                  s,
                  n: stats.byStatus.find((b) => b.status === s)?.count ?? 0,
                }))
                .map(({ s, n }) => (
                  <li key={s} className="flex items-center justify-between text-sm">
                    <StatusPill status={s} />
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft">
        Statut des commandes : {statusLabel("nouvelle").toLowerCase()}, confirmée, en préparation,
        en livraison, livrée, annulée — modifiables depuis{" "}
        <Link href="/admin/commandes" className="underline">la liste des commandes</Link>.
      </p>
    </div>
  );
}
