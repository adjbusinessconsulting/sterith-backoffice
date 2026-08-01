import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Editing an existing cashier. Without this a manager created before the
// password column existed could never be given one — the only way to set a
// password was to delete the account and make it again.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) {
    const parts = body.name.trim().split(/\s+/);
    data.name = body.name.trim();
    data.initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
  }

  if (body.pin !== undefined) {
    const pin = String(body.pin);
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN harus 6 digit angka." }, { status: 400 });
    }
    data.pin = pin;
  }

  // "" clears the password; a value sets it; omitting the field leaves it alone.
  if (body.password !== undefined) {
    const pw = typeof body.password === "string" ? body.password.trim() : "";
    if (pw && pw.length < 4) {
      return NextResponse.json({ error: "Kata sandi minimal 4 karakter." }, { status: 400 });
    }
    data.password = pw || null;
  }

  if (body.role === "kasir" || body.role === "MANAJER" || body.role === "manajer") data.role = body.role;

  if (!Object.keys(data).length) return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });

  // Scoped to this owner's store, and the owner's own row is never editable here.
  const res = await db.cashier.updateMany({
    where: { id: params.id, storeId: session.user.storeId, role: { not: "owner" } },
    data,
  });
  if (!res.count) return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  await db.cashier.updateMany({
    where: { id: params.id, storeId: session.user.storeId, role: { not: "owner" } },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
