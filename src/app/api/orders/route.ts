import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { getSessionAdmin } from "@/lib/auth";
import { getSettings, ORDER_STATUS_LIST } from "@/lib/store";
import { isAlgerianPhone, WILAYAS } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CartItem = { productId: number; quantity: number };

function generateRef() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `BWL-${s}`;
}

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    if (!b) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

    const customerName = typeof b.customerName === "string" ? b.customerName.trim() : "";
    const phone = typeof b.phone === "string" ? b.phone.trim() : "";
    const wilaya = typeof b.wilaya === "string" ? b.wilaya.trim() : "";
    const commune = typeof b.commune === "string" ? b.commune.trim() : "";
    const address = typeof b.address === "string" ? b.address.trim() : "";
    const notes = typeof b.notes === "string" ? b.notes.trim().slice(0, 1000) : "";
    const deliveryMethod = b.deliveryMethod === "livraison" ? "livraison" : "atelier";
    const pickupDate = typeof b.pickupDate === "string" ? b.pickupDate.slice(0, 20) : "";

    if (customerName.length < 3) {
      return NextResponse.json({ error: "Merci d'indiquer votre nom et prénom." }, { status: 400 });
    }
    if (!isAlgerianPhone(phone)) {
      return NextResponse.json(
        { error: "Merci d'indiquer un numéro de téléphone algérien valide (ex. 05 XX XX XX XX)." },
        { status: 400 },
      );
    }
    if (!WILAYAS.includes(wilaya)) {
      return NextResponse.json({ error: "Merci de sélectionner votre wilaya." }, { status: 400 });
    }
    if (commune.length < 2) {
      return NextResponse.json({ error: "Merci d'indiquer votre commune." }, { status: 400 });
    }
    if (deliveryMethod === "livraison" && address.length < 5) {
      return NextResponse.json(
        { error: "Merci d'indiquer votre adresse de livraison complète." },
        { status: 400 },
      );
    }

    const items: CartItem[] = Array.isArray(b.items)
      ? (b.items as Array<Record<string, unknown>>)
          .map((i) => ({
            productId: Number(i?.productId),
            quantity: Math.min(20, Math.max(1, Math.floor(Number(i?.quantity) || 1))),
          }))
          .filter((i) => Number.isFinite(i.productId) && i.productId > 0)
      : [];
    if (!items.length) {
      return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 });
    }

    const settings = await getSettings();
    const feeBbr = Number(settings.delivery_fee_bbr) || 0;
    const feeNational = Number(settings.delivery_fee_national) || 0;
    const deliveryFee =
      deliveryMethod === "livraison"
        ? wilaya === "Bordj Bou Arreridj"
          ? feeBbr
          : feeNational
        : 0;

    const ids = [...new Set(items.map((i) => i.productId))];
    const prodRows = await db.select().from(products).where(inArray(products.id, ids));
    const prodMap = new Map<number, (typeof prodRows)[number]>();
    for (const p of prodRows) prodMap.set(p.id, p);

    const lines = items.map((item) => ({ item, product: prodMap.get(item.productId) }));
    for (const { item, product } of lines) {
      if (!product) {
        return NextResponse.json({ error: "Un produit de votre panier n'est plus disponible." }, { status: 400 });
      }
      if (!product.available || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `« ${product.name} » n'est plus disponible en cette quantité.` },
          { status: 400 },
        );
      }
    }

    const subtotal = lines.reduce(
      (acc: number, l) => acc + (l.product?.price ?? 0) * l.item.quantity,
      0,
    );
    const total = subtotal + deliveryFee;

    let ref = "";
    for (let i = 0; i < 5; i++) {
      const candidate = generateRef();
      const existing = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.ref, candidate))
        .limit(1);
      if (!existing[0]) {
        ref = candidate;
        break;
      }
    }
    if (!ref) return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });

    const order = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          ref,
          customerName,
          phone,
          wilaya,
          commune,
          address: deliveryMethod === "livraison" ? address : "",
          notes,
          deliveryMethod,
          pickupDate,
          subtotal,
          deliveryFee,
          total,
          status: "nouvelle",
        })
        .returning();
      const o = inserted[0];

      await tx.insert(orderItems).values(
        lines.map((l) => ({
          orderId: o.id,
          productId: l.item.productId,
          productName: l.product?.name ?? "",
          unitPrice: l.product?.price ?? 0,
          quantity: l.item.quantity,
          lineTotal: (l.product?.price ?? 0) * l.item.quantity,
        })),
      );

      for (const { item } of lines) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
      return o;
    });

    // Notification optionnelle (webhook configuré dans l'admin : Telegram, Zapier…)
    const webhook = settings.webhook_url;
    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: order.ref,
          customer: order.customerName,
          phone: order.phone,
          wilaya: order.wilaya,
          commune: order.commune,
          address: order.address,
          notes: order.notes,
          deliveryMethod: order.deliveryMethod,
          pickupDate: order.pickupDate,
          total: order.total,
          items: lines.map((l) => ({
            name: l.product?.name,
            quantity: l.item.quantity,
            lineTotal: (l.product?.price ?? 0) * l.item.quantity,
          })),
        }),
        signal: AbortSignal.timeout(6000),
      }).catch(() => undefined);
    }

    return NextResponse.json(
      { ok: true, ref: order.ref, subtotal, deliveryFee, total },
      { status: 201 },
    );
  } catch (e) {
    console.error("POST /api/orders", e);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search")?.trim() || "";

  const conditions = [];
  if (status && ORDER_STATUS_LIST.some((s) => s.value === status)) {
    conditions.push(eq(orders.status, status as never));
  }
  if (search) {
    const s = `%${search}%`;
    conditions.push(
      or(like(orders.ref, s), like(orders.customerName, s), like(orders.phone, s)),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const base = db.select().from(orders);
  const rows = await (where ? base.where(where) : base)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : [];

  return NextResponse.json({
    orders: rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })),
  });
}
