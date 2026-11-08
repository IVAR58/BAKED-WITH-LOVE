import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProduitPage({ params }: Props) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/connexion");

  const { id } = await params;
  const rows = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  if (!rows[0]) notFound();

  return (
    <div>
      <p className="text-xs tracking-luxe text-mauve uppercase">Catalogue</p>
      <h1 className="mb-8 mt-1 font-serif text-3xl">Modifier le produit</h1>
      <ProductForm
        product={{
          id: rows[0].id,
          name: rows[0].name,
          slug: rows[0].slug,
          shortDescription: rows[0].shortDescription,
          description: rows[0].description,
          price: rows[0].price,
          categoryId: rows[0].categoryId,
          images: rows[0].images,
          flavors: rows[0].flavors,
          stock: rows[0].stock,
          available: rows[0].available,
          featured: rows[0].featured,
          bestseller: rows[0].bestseller,
          limited: rows[0].limited,
          sort: rows[0].sort,
        }}
      />
    </div>
  );
}
