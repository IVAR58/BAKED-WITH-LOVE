"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatDZD, isAlgerianPhone, WILAYAS } from "@/lib/utils";

type Settings = {
  deliveryFeeBbr: number;
  deliveryFeeNational: number;
  deliveryZones: string;
};

export default function CommandePage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    pickupDate: "",
    deliveryMethod: "atelier" as "atelier" | "livraison",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) =>
        setSettings({
          deliveryFeeBbr: d.deliveryFeeBbr,
          deliveryFeeNational: d.deliveryFeeNational,
          deliveryZones: d.deliveryZones,
        }),
      )
      .catch(() => undefined);
  }, []);

  const fee = useMemo(() => {
    if (!settings) return 0;
    if (form.deliveryMethod !== "livraison") return 0;
    return form.wilaya === "Bordj Bou Arreridj"
      ? settings.deliveryFeeBbr
      : settings.deliveryFeeNational;
  }, [settings, form.deliveryMethod, form.wilaya]);

  const total = subtotal + fee;

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      router.push("/panier");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      clear();
      router.push(`/confirmation/${data.ref}`);
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-script text-4xl text-mauve">Votre sélection</p>
        <h1 className="mt-3 font-serif text-4xl">Votre panier est vide</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Ajoutez d'abord quelques douceurs à votre panier avant de passer
          commande.
        </p>
        <Link
          href="/boutique"
          className="mt-9 inline-block rounded-full bg-ink px-9 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-sm placeholder:text-ink-soft/60 focus:border-mauve transition";
  const labelCls = "mb-2 block text-xs tracking-wide2 text-ink uppercase";

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <p className="font-script text-3xl text-mauve">Presque terminé</p>
        <h1 className="mt-2 font-serif text-4xl">Valider ma commande</h1>
        <p className="mt-4 text-ink-soft">
          Aucun compte nécessaire : renseignez simplement vos coordonnées,
          nous vous recontacterons pour confirmer les détails.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-5 font-serif text-2xl">Vos coordonnées</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nom et prénom *</label>
                <input
                  className={inputCls}
                  required
                  minLength={3}
                  value={form.customerName}
                  onChange={(e) => set("customerName")(e.target.value)}
                  placeholder="Ex. Amel Benali"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Numéro de téléphone *</label>
                <input
                  className={inputCls}
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="Ex. 05 50 12 34 56"
                  pattern="(\+213|00213|0)(5|6|7)(\d{8})"
                  title="Numéro algérien (05/06/07 + 8 chiffres)"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-5 font-serif text-2xl">Livraison &amp; date</h2>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "atelier", t: "Récupération à l'atelier", d: `Gratuit — ${""}Bordj Bou Arreridj` },
                  { v: "livraison", t: "Livraison à domicile", d: "Tarif selon votre wilaya" },
                ] as const
              ).map((m) => (
                <label
                  key={m.v}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-5 py-4 transition ${
                    form.deliveryMethod === m.v
                      ? "border-mauve bg-blush-soft/60"
                      : "border-line hover:border-accent"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={form.deliveryMethod === m.v}
                    onChange={() => set("deliveryMethod")(m.v)}
                    className="mt-1 accent-[#7E505C]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{m.t}</span>
                    <span className="block text-xs text-ink-soft">{m.d}</span>
                  </span>
                </label>
              ))}
            </div>
            {settings && (
              <p className="mb-5 rounded-xl bg-cream px-5 py-4 text-xs leading-relaxed text-ink-soft">
                {settings.deliveryZones}
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Wilaya *</label>
                <select
                  className={inputCls}
                  required
                  value={form.wilaya}
                  onChange={(e) => set("wilaya")(e.target.value)}
                >
                  <option value="">Sélectionner…</option>
                  {WILAYAS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Commune *</label>
                <input
                  className={inputCls}
                  required
                  minLength={2}
                  value={form.commune}
                  onChange={(e) => set("commune")(e.target.value)}
                  placeholder="Ex. Oued El Alleug"
                />
              </div>
              {form.deliveryMethod === "livraison" && (
                <div className="sm:col-span-2">
                  <label className={labelCls}>Adresse de livraison *</label>
                  <input
                    className={inputCls}
                    required
                    minLength={5}
                    value={form.address}
                    onChange={(e) => set("address")(e.target.value)}
                    placeholder="Rue, numéro, quartier, repère…"
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className={labelCls}>Date souhaitée (récupération ou livraison)</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.pickupDate}
                  onChange={(e) => set("pickupDate")(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Notes supplémentaires</label>
                <textarea
                  className={`${inputCls} min-h-24 resize-y`}
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  placeholder="Coloris, thème, texte, allergies, détails de personnalisation…"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl bg-cream p-7">
          <h2 className="font-serif text-2xl">Votre commande</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="block h-14 w-12 shrink-0 overflow-hidden rounded-md bg-paper">
                  {i.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {i.name} <span className="text-ink-soft">× {i.quantity}</span>
                </span>
                <span className="text-sm font-medium">{formatDZD(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Sous-total</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">
                {form.deliveryMethod === "livraison" ? "Livraison estimée" : "Récupération"}
              </span>
              <span>{form.deliveryMethod === "livraison" ? formatDZD(fee) : "Gratuit"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-xs tracking-wide2 uppercase">Total</span>
              <span className="font-serif text-2xl">{formatDZD(total)}</span>
            </div>
          </div>
          {form.deliveryMethod === "livraison" && !form.wilaya && (
            <p className="mt-3 text-xs text-ink-soft">
              Sélectionnez votre wilaya pour connaître le tarif de livraison.
            </p>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-mauve/40 bg-blush-soft px-4 py-3 text-sm text-mauve-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-ink px-6 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Envoi en cours…" : "Confirmer ma commande"}
          </button>
          <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
            En confirmant, vous acceptez que l'atelier vous recontacte au numéro
            indiqué pour valider votre commande.
          </p>
        </aside>
      </form>
    </div>
  );
}
