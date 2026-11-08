import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
