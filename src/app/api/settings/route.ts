import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionAdmin, hashPassword } from "@/lib/auth";
import { getSettings, publicSettings, updateSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

const EDITABLE_KEYS = [
  "store_name",
  "store_subtitle",
  "tagline",
  "city",
  "instagram",
  "whatsapp",
  "phone",
  "delivery_fee_bbr",
  "delivery_fee_national",
  "delivery_zones",
  "announcement",
  "hero_headline",
  "webhook_url",
  "logo_url",
];

export async function GET() {
  const s = await getSettings();
  return NextResponse.json(publicSettings(s));
}

export async function PUT(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  try {
    const b = await req.json().catch(() => null);
    if (!b) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

    const values: Record<string, string> = {};
    for (const key of EDITABLE_KEYS) {
      if (typeof b?.values?.[key] === "string") values[key] = b.values[key];
    }
    if (Object.keys(values).length) await updateSettings(values);

    // Changement d'identifiants administrateur
    const creds = b?.credentials;
    if (creds && (creds.newUsername || creds.newPassword)) {
      const newUsername =
        typeof creds.newUsername === "string" ? creds.newUsername.trim() : admin.username;
      const newPassword =
        typeof creds.newPassword === "string" ? creds.newPassword : "";
      if (newUsername.length < 3) {
        return NextResponse.json(
          { error: "Le nom d'utilisateur doit faire au moins 3 caractères." },
          { status: 400 },
        );
      }
      if (newPassword && newPassword.length < 8) {
        return NextResponse.json(
          { error: "Le nouveau mot de passe doit faire au moins 8 caractères." },
          { status: 400 },
        );
      }
      const others = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.username, newUsername))
        .limit(1);
      if (others[0] && others[0].id !== admin.id) {
        return NextResponse.json(
          { error: "Ce nom d'utilisateur est déjà utilisé." },
          { status: 400 },
        );
      }
      await db
        .update(admins)
        .set({
          username: newUsername,
          ...(newPassword ? { passwordHash: hashPassword(newPassword) } : {}),
        })
        .where(eq(admins.id, admin.id));
    }

    const s = await getSettings();
    return NextResponse.json({ ok: true, settings: publicSettings(s) });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
