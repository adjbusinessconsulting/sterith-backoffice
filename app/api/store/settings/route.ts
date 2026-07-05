import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.$queryRaw<{
    qris_image_url: string | null;
    midtrans_client_key: string | null;
    midtrans_server_key_set: boolean;
  }[]>(Prisma.sql`
    SELECT
      qris_image_url,
      midtrans_client_key,
      (midtrans_server_key IS NOT NULL AND midtrans_server_key <> '') AS midtrans_server_key_set
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
  const values: (string | null)[] = [];

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
