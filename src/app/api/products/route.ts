import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/store";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("search")?.trim() || undefined;
  const sortRaw = url.searchParams.get("sort");
  const sort =
    sortRaw === "price_asc" ||
    sortRaw === "price_desc" ||
    sortRaw === "name" ||
    sortRaw === "newest"
      ? sortRaw
      : undefined;

  const all = await listProducts({ category, search, sort });
  return NextResponse.json({ products: all });
}

async function uniqueSlug(base: string, ignoreId?: number) {
  let slug = base || "produit";
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!rows[0] || (ignoreId !== undefined && rows[0].id === ignoreId)) {
      return slug;
    }
    slug = `${base}-${i++}`;
  }
}

export async function POST(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const b = await req.json().catch(() => null);
    const name = typeof b?.name === "string" ? b.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json(
        { error: "Le nom du produit est requis." },
        { status: 400 },
      );
    }
    const price = Number(b?.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Le prix doit être un nombre positif." },
        { status: 400 },
      );
    }
    const stock = Math.max(0, Math.floor(Number(b?.stock) || 0));
    const images = Array.isArray(b?.images)
      ? b.images.filter((x: unknown) => typeof x === "string")
      : [];
    const flavors = Array.isArray(b?.flavors)
      ? b.flavors
          .map((x: unknown) => String(x).trim())
          .filter(Boolean)
      : [];

    let categoryId: number | null = null;
    if (b?.categoryId) {
      const c = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, Number(b.categoryId)))
        .limit(1);
      categoryId = c[0]?.id ?? null;
    }

    const slug = await uniqueSlug(
      typeof b?.slug === "string" && b.slug.trim()
        ? slugify(b.slug.trim())
        : slugify(name),
    );

    const [row] = await db
      .insert(products)
      .values({
        name,
        slug,
        shortDescription: typeof b?.shortDescription === "string" ? b.shortDescription : "",
        description: typeof b?.description === "string" ? b.description : "",
        price: Math.round(price),
        categoryId,
        images,
        flavors,
        stock,
        available: b?.available !== false,
        featured: b?.featured === true,
        bestseller: b?.bestseller === true,
        limited: b?.limited === true,
        sort: Math.floor(Number(b?.sort) || 0),
      })
      .returning();

    return NextResponse.json({ ok: true, product: row }, { status: 201 });
  } catch (e) {
    console.error("POST /api/products", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
