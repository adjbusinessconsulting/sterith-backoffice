import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SUPA = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY ?? "";

// Grant a Supabase session with email+password. Returns the access token (proof
// the password is correct + lets us update the account password), or null.
async function supabaseToken(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const j = await res.json() as { access_token?: string };
  return j.access_token ?? null;
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const email = session.user.email;
  const storeId = session.user.storeId;
  if (!email) return NextResponse.json({ error: "No email on session" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const target: "pos" | "backoffice" = body.target;
  const currentPassword: string = body.currentPassword ?? "";
  const newPassword: string = body.newPassword ?? "";
  const remove: boolean = body.remove === true;

  // ── Front office (POS / shared Supabase account) password ──
  if (target === "pos") {
    if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
    const token = await supabaseToken(email, currentPassword);
    if (!token) return NextResponse.json({ error: "Kata sandi POS saat ini salah." }, { status: 400 });
    const upd = await fetch(`${SUPA}/auth/v1/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password: newPassword }),
    });
    if (!upd.ok) return NextResponse.json({ error: "Gagal memperbarui kata sandi POS." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // ── Back Office password (separate; NULL = same as POS) ──
  if (target === "backoffice") {
    // Verify the CURRENT Back Office password: the separate hash if set, else the POS one.
    const rows = await db.$queryRaw<Array<{ hash: string | null }>>`
      SELECT backoffice_password_hash AS hash FROM stores WHERE id = ${storeId}::uuid LIMIT 1`;
    const currentHash = rows[0]?.hash ?? null;
    const currentOk = currentHash
      ? await bcrypt.compare(currentPassword, currentHash)
      : (await supabaseToken(email, currentPassword)) !== null;
    if (!currentOk) return NextResponse.json({ error: "Kata sandi Back Office saat ini salah." }, { status: 400 });

    if (remove) {
      await db.$executeRaw`UPDATE stores SET backoffice_password_hash = NULL WHERE id = ${storeId}::uuid`;
      return NextResponse.json({ ok: true, separate: false });
    }
    if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.$executeRaw`UPDATE stores SET owner_email = ${email}, backoffice_password_hash = ${hash} WHERE id = ${storeId}::uuid`;
    return NextResponse.json({ ok: true, separate: true });
  }

  return NextResponse.json({ error: "Target tidak valid" }, { status: 400 });
}

// Whether a separate Back Office password is currently set (for the Settings UI).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.$queryRaw<Array<{ hash: string | null }>>`
    SELECT backoffice_password_hash AS hash FROM stores WHERE id = ${session.user.storeId}::uuid LIMIT 1`;
  return NextResponse.json({ separate: !!rows[0]?.hash, email: session.user.email });
}
