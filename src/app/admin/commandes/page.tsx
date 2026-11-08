"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatDZD,
  formatDateTimeFr,
  waLink,
  ORDER_STATUSES,
} from "@/lib/utils";
import { StatusPill } from "@/components/admin/StatusPill";

type OrderItem = {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: number;
  ref: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string;
  deliveryMethod: string;
  pickupDate: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<string>("toutes");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setError("Impossible de charger les commandes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { toutes: orders.length };
    for (const s of ORDER_STATUSES) {
      m[s.value] = orders.filter((o) => o.status === s.value).length;
    }
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "toutes" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o.ref.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      );
    });
  }, [orders, tab, search]);

  async function changeStatus(id: number, status: string) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-luxe text-mauve uppercase">Suivi des ventes</p>
          <h1 className="mt-1 font-serif text-3xl">Commandes</h1>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Référence, client, téléphone…"
          className="w-56 rounded-full border border-line bg-paper px-4 py-2.5 text-sm focus:border-mauve sm:w-72"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton active={tab === "toutes"} onClick={() => setTab("toutes")}>
          Toutes <Count n={counts.toutes} />
        </TabButton>
        {ORDER_STATUSES.map((s) => (
          <TabButton key={s.value} active={tab === s.value} onClick={() => setTab(s.value)}>
            {s.label} <Count n={counts[s.value] ?? 0} />
          </TabButton>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-blush-soft px-4 py-3 text-sm text-mauve-deep">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-cream-deep/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper px-8 py-16 text-center">
          <p className="font-serif text-2xl">
            {tab === "toutes" && !search
              ? "Aucune commande pour le moment"
              : "Aucune commande ne correspond"}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {tab === "toutes" && !search
              ? "Dès qu'un client passera commande sur le site, elle apparaîtra ici immédiatement."
              : "Modifiez le filtre ou la recherche."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o) => (
            <li key={o.id} className="overflow-hidden rounded-2xl border border-line bg-paper">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="grid w-full grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition hover:bg-cream/40 sm:grid-cols-[110px_1fr_150px_110px_170px_30px]"
              >
                <span className="text-sm font-medium">{o.ref}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{o.customerName}</span>
                  <span className="block truncate text-xs text-ink-soft">
                    {[o.commune, o.wilaya].filter(Boolean).join(" — ")}
                  </span>
                </span>
                <span className="hidden text-xs text-ink-soft sm:block">
                  {formatDateTimeFr(o.createdAt)}
                </span>
                <span className="text-sm font-medium">{formatDZD(o.total)}</span>
                <span>
                  {busy === o.id ? (
                    <span className="text-xs text-ink-soft">Mise à jour…</span>
                  ) : (
                    <StatusPill status={o.status} />
                  )}
                </span>
                <span className="hidden text-ink-soft sm:block">
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${expanded === o.id ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>

              {expanded === o.id && (
                <div className="border-t border-line bg-cream/50 px-5 py-5 animate-fade-in">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-xs tracking-luxe text-ink uppercase">Articles</h3>
                      <ul className="space-y-2">
                        {o.items.map((i) => (
                          <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                            <span>
                              {i.productName}{" "}
                              <span className="text-ink-soft">× {i.quantity}</span>
                            </span>
                            <span className="font-medium">{formatDZD(i.lineTotal)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                        <div className="flex justify-between text-ink-soft">
                          <span>Sous-total</span>
                          <span>{formatDZD(o.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-ink-soft">
                          <span>
                            {o.deliveryMethod === "livraison" ? "Livraison" : "Récupération"}
                          </span>
                          <span>{o.deliveryFee > 0 ? formatDZD(o.deliveryFee) : "Gratuit"}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatDZD(o.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-xs tracking-luxe text-ink uppercase">Client &amp; livraison</h3>
                      <dl className="space-y-2 text-sm">
                        <Row k="Téléphone" v={o.phone} />
                        <Row k="Wilaya / Commune" v={[o.wilaya, o.commune].filter(Boolean).join(" — ")} />
                        <Row
                          k="Mode"
                          v={
                            o.deliveryMethod === "livraison"
                              ? "Livraison à domicile"
                              : "Récupération à l'atelier"
                          }
                        />
                        {o.deliveryMethod === "livraison" && o.address && (
                          <Row k="Adresse" v={o.address} />
                        )}
                        {o.pickupDate && <Row k="Date souhaitée" v={o.pickupDate} />}
                        {o.notes && <Row k="Notes" v={o.notes} />}
                      </dl>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`tel:${o.phone.replace(/\s/g, "")}`}
                          className="rounded-full border border-line bg-paper px-4 py-2 text-xs tracking-wide uppercase transition hover:border-mauve hover:text-mauve"
                        >
                          Appeler
                        </a>
                        <a
                          href={waLink(
                            o.phone,
                            `Bonjour ${o.customerName}, votre commande ${o.ref} de Baked with Love — un message de la part de l'atelier.`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-line bg-paper px-4 py-2 text-xs tracking-wide uppercase transition hover:border-mauve hover:text-mauve"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                    <span className="text-xs tracking-wide2 text-ink-soft uppercase">
                      Changer le statut :
                    </span>
                    <select
                      value={o.status}
                      disabled={busy === o.id}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className="rounded-full border border-line bg-paper px-4 py-2 text-sm focus:border-mauve disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-1 rounded-full bg-cream px-2 py-0.5 text-[11px] text-ink-soft">{n}</span>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-full px-4 py-2 text-xs tracking-wide uppercase transition ${
        active ? "bg-ink text-paper" : "border border-line text-ink-soft hover:border-mauve"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="min-w-0 break-words">{v || "—"}</dd>
    </div>
  );
}
