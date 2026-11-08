import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionAdmin } from "@/lib/auth";
import { ORDER_STATUS_LIST } from "@/lib/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(id)))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, rows[0].id));
  return NextResponse.json({ order: { ...rows[0], items } });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => null);
  const status = typeof b?.status === "string" ? b.status : "";
  if (!ORDER_STATUS_LIST.some((s) => s.value === status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }
  const [row] = await db
    .update(orders)
    .set({ status: status as never })
    .where(eq(orders.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true, order: row });
}
