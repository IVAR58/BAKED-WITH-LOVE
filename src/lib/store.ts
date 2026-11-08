import { and, asc, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  orderItems,
  orders,
  products,
  settings,
  type OrderStatus,
} from "@/db/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: "Baked with Love",
  store_subtitle: "Pâtisserie",
  tagline: "Atelier spécialisé en macarons artisanaux",
  city: "Bordj Bou Arreridj",
  instagram: "bakedwithl_ove",
  whatsapp: "",
  phone: "",
  delivery_fee_bbr: "400",
  delivery_fee_national: "1500",
  delivery_zones:
    "Récupération à l'atelier — Bordj Bou Arreridj. Livraison possible sur la ville et les communes limitrophes ; pour les autres wilayas, nous confirmons les modalités par message.",
  announcement:
    "Atelier spécialisé en macarons artisanaux — Qualité • Précision • Élégance",
  hero_headline: "Des macarons d'exception, faits avec amour",
  webhook_url: "",
  logo_url: "",
};

/** Renvoie les réglages de la boutique fusionnés avec les valeurs par défaut. */
export async function getSettings(): Promise<Record<string, string>> {
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await db.select().from(settings);
  } catch {
    rows = [];
  }
  return {
    ...DEFAULT_SETTINGS,
    ...Object.fromEntries(rows.map((r) => [r.key, r.value])),
  };
}

export type ProductWithCategory = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  categoryId: number | null;
  images: string[];
  flavors: string[];
  stock: number;
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  limited: boolean;
  sort: number;
  createdAt: Date;
  categoryName: string | null;
  categorySlug: string | null;
};

type Row = {
  product: (typeof products.$inferSelect);
  category: (typeof categories.$inferSelect) | null;
};

function mapRow(r: Row): ProductWithCategory {
  return {
    ...r.product,
    categoryName: r.category?.name ?? null,
    categorySlug: r.category?.slug ?? null,
  };
}

export async function listProducts(opts?: {
  category?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
  featuredOnly?: boolean;
  bestsellers?: boolean;
  limit?: number;
}): Promise<ProductWithCategory[]> {
  const conditions: SQL[] = [];
  if (opts?.category) conditions.push(eq(categories.slug, opts.category));
  if (opts?.search) {
    const s = `%${opts.search}%`;
    const searchCond = or(like(products.name, s), like(products.shortDescription, s));
    if (searchCond) conditions.push(searchCond);
  }
  if (opts?.featuredOnly) conditions.push(eq(products.featured, true));
  if (opts?.bestsellers) conditions.push(eq(products.bestseller, true));
  const where = conditions.length ? and(...conditions) : undefined;

  const base = db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));
  const rows = await (where ? base.where(where) : base).limit(opts?.limit ?? 100);

  const result = rows.map(mapRow);
  const sort = opts?.sort;
  result.sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "name") return a.name.localeCompare(b.name, "fr");
    return b.createdAt.getTime() - a.createdAt.getTime() || b.sort - a.sort;
  });
  return result;
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!rows[0]) return null;
  return mapRow(rows[0] as Row);
}

export async function getCategories(opts?: { includeInactive?: boolean }) {
  const rows = await db
    .select()
    .from(categories)
    .where(opts?.includeInactive ? undefined : eq(categories.active, true))
    .orderBy(asc(categories.sort), asc(categories.name));
  const counts = await db
    .select({ categoryId: products.categoryId, count: sql<number>`count(*)` })
    .from(products)
    .groupBy(products.categoryId);
  const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));
  return rows.map((c) => ({
    ...c,
    productCount: countMap.get(c.id) ?? 0,
  }));
}

export async function getBestsellers(limit = 5) {
  const rows = await db
    .select({
      productName: orderItems.productName,
      qty: sql<number>`sum(${orderItems.quantity})`,
      image: products.images,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(sql`${orders.status} != 'annulee'`)
    .groupBy(orderItems.productName, products.images)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);
  return rows.map((r) => ({
    name: r.productName,
    quantity: Number(r.qty),
    image: (r.image ?? [])[0] ?? null,
  }));
}

export async function getDashboardStats() {
  const totals = await db
    .select({
      total: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(case when ${orders.status} != 'annulee' then ${orders.total} else 0 end), 0)::int`,
      newOrders: sql<number>`count(case when ${orders.status} = 'nouvelle' then 1 end)::int`,
      pending: sql<number>`count(case when ${orders.status} in ('confirmee','en_preparation','en_livraison') then 1 end)::int`,
    })
    .from(orders);
  const t = totals[0];

  const byStatusRows = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);

  const recent = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(6);
  const recentIds = recent.map((r) => r.id);
  const items = recentIds.length
    ? await db
        .select()
        .from(orderItems)
        .where(
          sql`${orderItems.orderId} in (${sql.join(
            recentIds.map((i) => sql`${i}`),
            sql`,`,
          )})`,
        )
    : [];

  const bestSellers = await getBestsellers(5);

  return {
    total: Number(t?.total ?? 0),
    revenue: Number(t?.revenue ?? 0),
    newOrders: Number(t?.newOrders ?? 0),
    pending: Number(t?.pending ?? 0),
    byStatus: byStatusRows,
    recent: recent.map((o) => ({
      ...o,
      items: items.filter((i) => i.orderId === o.id),
    })),
    bestSellers,
  };
}

export async function updateSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    await db
      .insert(settings)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(value) } });
  }
}

export function publicSettings(s: Record<string, string>) {
  return {
    storeName: s.store_name,
    storeSubtitle: s.store_subtitle,
    tagline: s.tagline,
    city: s.city,
    instagram: s.instagram,
    whatsapp: s.whatsapp,
    phone: s.phone,
    deliveryFeeBbr: Number(s.delivery_fee_bbr) || 0,
    deliveryFeeNational: Number(s.delivery_fee_national) || 0,
    deliveryZones: s.delivery_zones,
    announcement: s.announcement,
    heroHeadline: s.hero_headline,
    logoUrl: s.logo_url,
    webhookUrl: s.webhook_url,
  };
}

export const ORDER_STATUS_LIST: { value: OrderStatus; label: string }[] = [
  { value: "nouvelle", label: "Nouvelle commande" },
  { value: "confirmee", label: "Confirmée" },
  { value: "en_preparation", label: "En préparation" },
  { value: "en_livraison", label: "En livraison" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
];
