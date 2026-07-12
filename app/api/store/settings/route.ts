import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isAtLeast } from "@/lib/tier";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.$queryRaw<{
    qris_image_url: string | null;
    midtrans_client_key: string | null;
    midtrans_server_key_set: boolean;
    settings_locked: boolean;
  }[]>(Prisma.sql`
    SELECT
      qris_image_url,
      midtrans_client_key,
      (midtrans_server_key IS NOT NULL AND midtrans_server_key <> '') AS midtrans_server_key_set,
      COALESCE(settings_locked, false) AS settings_locked
    FROM stores WHERE id = ${session.user.storeId}::uuid
  `);

  if (!rows[0]) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const body = await req.json();
  const fields: string[] = [];
  const values: (string | null | boolean)[] = [];

  // Only update fields explicitly included in the request
  if ("qris_image_url" in body) {
    fields.push("qris_image_url");
    values.push(body.qris_image_url?.trim() || null);
  }
  if ("midtrans_client_key" in body) {
    fields.push("midtrans_client_key");
    values.push(body.midtrans_client_key?.trim() || null);
  }
  if ("midtrans_server_key" in body) {
    fields.push("midtrans_server_key");
    values.push(body.midtrans_server_key?.trim() || null);
  }
  // Master lock — Premium+ only (the Back Office is already Premium-gated at login,
  // but enforce here too). When true the POS hides its Pengaturan surface entirely.
  if ("settings_locked" in body) {
    if (!isAtLeast(session.user.tier ?? "free", "premium")) {
      return NextResponse.json({ error: "Premium only" }, { status: 403 });
    }
    fields.push("settings_locked");
    values.push(!!body.settings_locked);
  }

  if (fields.length === 0) return NextResponse.json({ ok: true });

  // Build update SQL dynamically
  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  await db.$executeRawUnsafe(
    `UPDATE stores SET ${setClauses} WHERE id = $1::uuid`,
    session.user.storeId,
    ...values,
  );

  return NextResponse.json({ ok: true });
}
