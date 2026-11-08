import { getSessionAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata = { title: "Administration" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getSessionAdmin();
  if (!admin) {
    // Non connecté : on rend l'enfant tel quel (page de connexion).
    return <>{children}</>;
  }
  return <AdminShell username={admin.username}>{children}</AdminShell>;
}
