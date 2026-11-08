import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { randomBytes } from "crypto";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin)
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Format non pris en charge. Utilisez JPG, PNG ou WebP." },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image trop lourde (4 Mo maximum)." },
        { status: 400 },
      );
    }
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const name = `uploads/img_${Date.now()}_${randomBytes(4).toString("hex")}.${ext}`;
    const blob = await put(name, file, { access: "public" });
    return NextResponse.json({ ok: true, url: blob.url }, { status: 201 });
  } catch (e) {
    console.error("upload", e);
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin)
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const url = new URL(req.url);
  const target = url.searchParams.get("url") ?? "";
  if (!target.includes("blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Invalide." }, { status: 400 });
  }
  try {
    await del(target);
  } catch {
    /* déjà supprimé */
  }
  return NextResponse.json({ ok: true });
}
