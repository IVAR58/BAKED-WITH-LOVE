import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NouveauProduitPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/connexion");
  return (
    <div>
      <p className="text-xs tracking-luxe text-mauve uppercase">Catalogue</p>
      <h1 className="mb-8 mt-1 font-serif text-3xl">Nouveau produit</h1>
      <ProductForm />
    </div>
  );
}
