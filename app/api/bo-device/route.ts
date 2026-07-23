import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Single active Back Office device per store: first login holds, a second is
// blocked until the first logs out (or is forced / goes stale). Mirrors the POS
// device lock but on its own columns (active_bo_device_id/at) so Premium keeps
// 1 POS + 1 Back Office. Uses raw SQL because these columns aren't in the Prisma
// model. Actions: claim | heartbeat | release.
const STALE_MS = 2 * 60 * 1000;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const storeId = session?.user?.storeId;
  if (!storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, deviceId, force } = await req.json().catch(() => ({}));
  if (!deviceId || typeof deviceId !== "string") {
    return NextResponse.json({ error: "no device" }, { status: 400 });
  }

  if (action === "claim") {
    const rows = await db.$queryRaw<Array<{ active_bo_device_id: string | null; active_bo_device_at: Date | null; name: string | null }>>`
      SELECT active_bo_device_id, active_bo_device_at, name FROM stores WHERE id = ${storeId}::uuid`;
    const row = rows[0];
    const curId = row?.active_bo_device_id ?? null;
    const curAt = row?.active_bo_device_at ? new Date(row.active_bo_device_at).getTime() : 0;
    const heldByOther = !!curId && curId !== deviceId;
    const fresh = curAt > 0 && Date.now() - curAt < STALE_MS;
    if (!force && heldByOther && fresh) {
      return NextResponse.json({ ok: false, blocked: true, storeName: row?.name ?? "" });
    }
    await db.$executeRaw`UPDATE stores SET active_bo_device_id = ${deviceId}, active_bo_device_at = now() WHERE id = ${storeId}::uuid`;
    return NextResponse.json({ ok: true });
  }

  if (action === "heartbeat") {
    const rows = await db.$queryRaw<Array<{ active_bo_device_id: string | null }>>`
      SELECT active_bo_device_id FROM stores WHERE id = ${storeId}::uuid`;
    const curId = rows[0]?.active_bo_device_id ?? null;
    if (curId && curId !== deviceId) return NextResponse.json({ owner: false });
    await db.$executeRaw`UPDATE stores SET active_bo_device_at = now() WHERE id = ${storeId}::uuid AND active_bo_device_id = ${deviceId}`;
    return NextResponse.json({ owner: true });
  }

  if (action === "release") {
    await db.$executeRaw`UPDATE stores SET active_bo_device_id = NULL, active_bo_device_at = NULL WHERE id = ${storeId}::uuid AND active_bo_device_id = ${deviceId}`;
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad action" }, { status: 400 });
}
