"use client";

import { useEffect, useRef, useState } from "react";

type Settings = {
  storeName: string;
  storeSubtitle: string;
  tagline: string;
  city: string;
  instagram: string;
  whatsapp: string;
  phone: string;
  deliveryFeeBbr: number;
  deliveryFeeNational: number;
  deliveryZones: string;
  announcement: string;
  heroHeadline: string;
  logoUrl: string;
  webhookUrl: string;
};

export default function AdminParametresPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Settings) => {
        setS(d);
        setLogoUrl(d.logoUrl);
        setForm({
          store_name: d.storeName,
          store_subtitle: d.storeSubtitle,
          tagline: d.tagline,
          city: d.city,
          instagram: d.instagram,
          whatsapp: d.whatsapp,
          phone: d.phone,
          delivery_fee_bbr: String(d.deliveryFeeBbr),
          delivery_fee_national: String(d.deliveryFeeNational),
          delivery_zones: d.deliveryZones,
          announcement: d.announcement,
          hero_headline: d.heroHeadline,
          webhook_url: d.webhookUrl,
        });
      })
      .catch(() => setMessage({ ok: false, text: "Impossible de charger les paramètres." }));
  }, []);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Échec de l'upload");
      setLogoUrl(d.url);
      setMessage({ ok: true, text: "Logo téléversé avec succès." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeLogo() {
    if (logoUrl) {
      fetch(`/api/upload?url=${encodeURIComponent(logoUrl)}`, { method: "DELETE" }).catch(
        () => undefined,
      );
    }
    setLogoUrl("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const values = { ...form, logo_url: logoUrl };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values,
          credentials:
            newUsername || newPassword
              ? { newUsername: newUsername || undefined, newPassword: newPassword || undefined }
              : undefined,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Erreur lors de l'enregistrement");
      setNewUsername("");
      setNewPassword("");
      setMessage({ ok: true, text: "Paramètres enregistrés — visibles immédiatement sur la boutique." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  }

  if (!s) {
    return (
      <div className="py-20 text-center">
        <p className="animate-pulse text-ink-soft">Chargement des paramètres…</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm focus:border-mauve transition";
  const labelCls = "mb-1.5 block text-xs tracking-wide2 text-ink uppercase";

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div>
        <p className="text-xs tracking-luxe text-mauve uppercase">Boutique</p>
        <h1 className="mb-8 mt-1 font-serif text-3xl">Paramètres</h1>
      </div>

      {message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            message.ok ? "bg-[#E1EFE9] text-[#3E7A63]" : "bg-blush-soft text-mauve-deep"
          }`}
        >
          {message.text}
        </p>
      )}

      <Section title="Identité de la marque">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nom de la boutique</label>
            <input className={inputCls} value={form.store_name ?? ""} onChange={(e) => set("store_name", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Sous-titre</label>
            <input className={inputCls} value={form.store_subtitle ?? ""} onChange={(e) => set("store_subtitle", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Ville</label>
            <input className={inputCls} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input className={inputCls} value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Logo (PNG ou JPG — remplacera l'écrit dans l'en-tête)</label>
          <div className="flex flex-wrap items-center gap-3">
            {logoUrl && (
              <span className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo actuel" className="h-10 w-10 rounded-full object-cover" />
                <button type="button" onClick={removeLogo} className="text-xs tracking-wide text-mauve-deep uppercase hover:underline">
                  Retirer
                </button>
              </span>
            )}
            <label className="cursor-pointer rounded-full border border-line px-5 py-2.5 text-xs tracking-wide2 uppercase transition hover:border-mauve">
              {uploading ? "Envoi…" : "Téléverser un logo"}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onLogo} />
            </label>
          </div>
        </div>
      </Section>

      <Section title="Contenu de la page d'accueil">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Bandeau d'annonce (en haut du site)</label>
            <input className={inputCls} value={form.announcement ?? ""} onChange={(e) => set("announcement", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Titre principal du héro</label>
            <input className={inputCls} value={form.hero_headline ?? ""} onChange={(e) => set("hero_headline", e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Contact & réseaux">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Instagram (sans @)</label>
            <input className={inputCls} value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="bakedwithl_ove" />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input className={inputCls} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="05 XX XX XX XX" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="05 XX XX XX XX" />
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Laissez vide pour masquer le canal correspondant sur le site.
        </p>
      </Section>

      <Section title="Livraison">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Frais — Bordj Bou Arreridj (DZD)</label>
            <input type="number" min={0} className={inputCls} value={form.delivery_fee_bbr ?? ""} onChange={(e) => set("delivery_fee_bbr", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Frais — autres wilayas (DZD)</label>
            <input type="number" min={0} className={inputCls} value={form.delivery_fee_national ?? ""} onChange={(e) => set("delivery_fee_national", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Zones & modalités de livraison (texte affiché sur le site)</label>
          <textarea className={`${inputCls} min-h-24 resize-y`} value={form.delivery_zones ?? ""} onChange={(e) => set("delivery_zones", e.target.value)} />
        </div>
      </Section>

      <Section title="Notification des commandes">
        <div>
          <label className={labelCls}>Webhook (optionnel) — Telegram, Zapier, n8n…</label>
          <input
            className={inputCls}
            value={form.webhook_url ?? ""}
            onChange={(e) => set("webhook_url", e.target.value)}
            placeholder="https://api.telegram.org/bot…/sendMessage  ou  https://zapier.com/hooks/catch/…"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          À chaque nouvelle commande, l'atelier envoie une notification JSON à cette
          adresse (référence, client, téléphone, articles, total). Les commandes
          restent toujours enregistrées dans le tableau de bord, que le webhook
          soit configuré ou non.
        </p>
      </Section>

      <Section title="Sécurité — compte administrateur">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nouveau nom d'utilisateur (facultatif)</label>
            <input className={inputCls} value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Nouveau mot de passe — 8 caractères min. (facultatif)</label>
            <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
      </Section>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-ink px-6 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-6">
      <h2 className="mb-5 font-serif text-xl">{title}</h2>
      {children}
    </section>
  );
}
