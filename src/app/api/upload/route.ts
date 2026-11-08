import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Format non pris en charge. Utilisez JPG, PNG ou WebP." },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image trop lourde (5 Mo maximum)." },
        { status: 400 },
      );
    }
    const ext =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const name = `img_${Date.now()}_${randomBytes(4).toString("hex")}.${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
    return NextResponse.json({ ok: true, url: `/uploads/${name}` }, { status: 201 });
  } catch (e) {
    console.error("upload", e);
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const url = new URL(req.url);
  const target = url.searchParams.get("url") ?? "";
  if (!target.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalide." }, { status: 400 });
  }
  const file = path.basename(target);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, file));
  } catch {
    /* déjà supprimé */
  }
  return NextResponse.json({ ok: true });
}
