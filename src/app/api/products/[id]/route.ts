import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);
  if (!rows[0]) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }
  return NextResponse.json({ product: rows[0] });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const pid = Number(id);

  try {
    const b = await req.json().catch(() => null);
    if (!b) throw new Error("body");

    const set: Record<string, unknown> = {};
    if (typeof b.name === "string" && b.name.trim().length >= 2) {
      set.name = b.name.trim();
    }
    if (typeof b.slug === "string" && b.slug.trim()) {
      set.slug = slugify(b.slug.trim());
    }
    if (typeof b.shortDescription === "string") set.shortDescription = b.shortDescription;
    if (typeof b.description === "string") set.description = b.description;
    if (b.price !== undefined) {
      const p = Number(b.price);
      if (!Number.isFinite(p) || p < 0) {
        return NextResponse.json(
          { error: "Prix invalide." },
          { status: 400 },
        );
      }
      set.price = Math.round(p);
    }
    if (b.categoryId !== undefined) {
      set.categoryId = b.categoryId ? Number(b.categoryId) : null;
    }
    if (Array.isArray(b.images)) {
      set.images = b.images.filter((x: unknown) => typeof x === "string");
    }
    if (Array.isArray(b.flavors)) {
      set.flavors = b.flavors.map((x: unknown) => String(x).trim()).filter(Boolean);
    }
    if (b.stock !== undefined) {
      const s = Math.floor(Number(b.stock));
      set.stock = Number.isFinite(s) ? Math.max(0, s) : 0;
    }
    for (const k of ["available", "featured", "bestseller", "limited"] as const) {
      if (typeof b[k] === "boolean") set[k] = b[k];
    }
    if (b.sort !== undefined) set.sort = Math.floor(Number(b.sort) || 0);
    set.updatedAt = new Date();

    const [row] = await db
      .update(products)
      .set(set)
      .where(eq(products.id, pid))
      .returning();
    if (!row) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, product: row });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const rows = await db
    .delete(products)
    .where(eq(products.id, Number(id)))
    .returning({ id: products.id });
  if (!rows.length) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
