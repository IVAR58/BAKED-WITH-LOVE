import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDZD, formatDateTimeFr, firstName, waLink } from "@/lib/utils";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ ref: string }> };

export const metadata: Metadata = { title: "Commande confirmée" };

export default async function ConfirmationPage({ params }: Props) {
  const { ref } = await params;
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.ref, ref.toUpperCase()))
    .limit(1);
  const order = rows[0];
  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush-soft">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7E505C" strokeWidth="1.6">
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
        </span>
        <p className="mt-6 font-script text-4xl text-mauve">Merci {firstName(order.customerName)} !</p>
        <h1 className="mt-2 font-serif text-4xl">Votre commande est bien enregistrée</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
          Référence <span className="font-medium text-ink">{order.ref}</span> —
          nous vous contacterons pour confirmer la disponibilité et les
          modalités de votre commande.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream px-7 py-5">
          <div>
            <p className="text-xs tracking-luxe text-mauve uppercase">Référence</p>
            <p className="mt-1 font-serif text-xl">{order.ref}</p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-luxe text-mauve uppercase">Le</p>
            <p className="mt-1 text-sm">{formatDateTimeFr(order.createdAt)}</p>
          </div>
        </div>

        <ul className="divide-y divide-line px-7">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 py-4 text-sm">
              <span>
                {i.productName} <span className="text-ink-soft">× {i.quantity}</span>
              </span>
              <span className="font-medium">{formatDZD(i.lineTotal)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between py-4 text-sm text-ink-soft">
            <span>
              {order.deliveryMethod === "livraison"
                ? `Livraison — ${order.wilaya}${order.commune ? `, ${order.commune}` : ""}`
                : "Récupération à l'atelier"}
            </span>
            <span>{order.deliveryFee > 0 ? formatDZD(order.deliveryFee) : "Gratuit"}</span>
          </li>
        </ul>

        <div className="flex items-center justify-between border-t border-line bg-cream px-7 py-5">
          <span className="text-xs tracking-wide2 uppercase">Total</span>
          <span className="font-serif text-2xl">{formatDZD(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-cream px-7 py-6 text-sm leading-relaxed text-ink-soft">
        <span className="mr-2 text-mauve">♥</span>
        Merci pour votre confiance ! Pour toute question sur votre commande,{" "}
        {s.instagram && (
          <>
            <a
              href={`https://instagram.com/${s.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="text-mauve-deep underline underline-offset-4"
            >
              écrivez-nous en DM
            </a>
            {" ou "}
          </>
        )}
        signalez simplement votre référence <span className="font-medium text-ink">{order.ref}</span>.
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/boutique"
          className="rounded-full bg-ink px-8 py-4 text-sm tracking-wide2 text-paper uppercase transition hover:bg-mauve-deep"
        >
          Retour à la boutique
        </Link>
        {s.whatsapp && (
          <a
            href={waLink(s.whatsapp, `Bonjour, je viens de passer la commande ${order.ref}.`)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink px-8 py-4 text-sm tracking-wide2 uppercase transition hover:bg-ink hover:text-paper"
          >
            Écrire sur WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
