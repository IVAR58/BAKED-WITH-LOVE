import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/store";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeInactive = url.searchParams.get("all") === "1";
  const cats = await getCategories({ includeInactive });
  return NextResponse.json({ categories: cats });
}

async function uniqueSlug(base: string, ignoreId?: number) {
  let slug = base || "categorie";
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (!rows[0] || (ignoreId !== undefined && rows[0].id === ignoreId)) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function POST(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const b = await req.json().catch(() => null);
    const name = typeof b?.name === "string" ? b.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json({ error: "Nom de catégorie requis." }, { status: 400 });
    }
    const slug = await uniqueSlug(slugify(name));
    const [row] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description: typeof b?.description === "string" ? b.description : null,
        sort: Math.floor(Number(b?.sort) || 0),
      })
      .returning();
    return NextResponse.json({ ok: true, category: row }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const b = await req.json().catch(() => null);
    const id = Number(b?.id);
    if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

    const set: Record<string, unknown> = {};
    if (typeof b?.name === "string" && b.name.trim().length >= 2) {
      set.name = b.name.trim();
    }
    if (typeof b?.slug === "string" && b.slug.trim()) {
      set.slug = await uniqueSlug(slugify(b.slug.trim()), id);
    }
    if (b?.description !== undefined) set.description = b.description ? String(b.description) : null;
    if (b?.sort !== undefined) set.sort = Math.floor(Number(b.sort) || 0);
    if (typeof b?.active === "boolean") set.active = b.active;

    const [row] = await db
      .update(categories)
      .set(set)
      .where(eq(categories.id, id))
      .returning();
    if (!row) return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, category: row });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const b = await req.json().catch(() => null);
    const id = Number(b?.id);
    if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });
    const [count] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, id));
    if (count.n > 0) {
      return NextResponse.json(
        { error: `Impossible : ${count.n} produit(s) utilisent cette catégorie. Réattribuez-les d'abord.` },
        { status: 409 },
      );
    }
    await db.delete(categories).where(eq(categories.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
