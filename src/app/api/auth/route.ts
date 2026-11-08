import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  SESSION_COOKIE,
  createSession,
  destroySession,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis." },
        { status: 400 },
      );
    }

    const rows = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);
    const admin = rows[0];

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { error: "Nom d'utilisateur ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    const token = await createSession(admin.id);
    const res = NextResponse.json({ ok: true, username: admin.username });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
