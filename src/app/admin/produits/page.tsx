import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { ProductList } from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/connexion");
  return <ProductList />;
}
