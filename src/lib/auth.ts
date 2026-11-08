import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";

export const SESSION_COOKIE = "bwl_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (test.length !== expected.length) return false;
  return timingSafeEqual(test, expected);
}

export async function createSession(adminId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, adminId, expiresAt });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await db.delete(sessions).where(eq(sessions.token, token));
  } catch {
    /* ignore */
  }
}

/** Renvoie l'admin connecté ou null. Utilisable dans les route handlers et les server components. */
export async function getSessionAdmin(): Promise<{
  id: number;
  username: string;
} | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const now = new Date();
    const sessionRows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);
    const session = sessionRows[0];
    if (!session || session.expiresAt < now) return null;
    const adminRows = await db
      .select()
      .from(admins)
      .where(eq(admins.id, session.adminId))
      .limit(1);
    const admin = adminRows[0];
    if (!admin) return null;
    return { id: admin.id, username: admin.username };
  } catch {
    return null;
  }
}
