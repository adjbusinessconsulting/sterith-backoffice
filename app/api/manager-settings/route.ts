import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Which manager capabilities the owner can grant. Stored inside stores.settings
// (jsonb) so both Back Office (Prisma) and the POS (Supabase) read the same source.
const PERM_KEYS = ["void", "discount", "products", "shifts", "cashDrawer", "stock", "reports"] as const;

// openPerms is a SEPARATE key on purpose. Widening managerPerms from boolean to a
// level string would make an older POS build read "owner" as truthy and grant
// everything — a security regression on tills that have not updated yet. An old
// build simply ignores openPerms and keeps asking, which is the safe direction.
interface ManagerSettings {
  managerPerms: Record<string, boolean>;   // manajer may act alone
  openPerms: Record<string, boolean>;      // ANYONE may act, no approval at all
  approvalMethod: "pin" | "password";
}

function extract(settings: unknown): ManagerSettings {
  const s = (settings ?? {}) as Record<string, unknown>;
  const mp = (s.managerPerms ?? {}) as Record<string, unknown>;
  const op = (s.openPerms ?? {}) as Record<string, unknown>;
  const perms: Record<string, boolean> = {};
  const open: Record<string, boolean> = {};
  for (const k of PERM_KEYS) { perms[k] = !!mp[k]; open[k] = !!op[k]; }
  const method = s.approvalMethod === "password" ? "password" : "pin";
  return { managerPerms: perms, openPerms: open, approvalMethod: method };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await db.store.findUnique({ where: { id: session.user.storeId }, select: { settings: true } });
  return NextResponse.json(extract(store?.settings));
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const store = await db.store.findUnique({ where: { id: session.user.storeId }, select: { settings: true } });
  const current = (store?.settings ?? {}) as Record<string, unknown>;
  const currentPerms = (current.managerPerms ?? {}) as Record<string, boolean>;
  const currentOpen = (current.openPerms ?? {}) as Record<string, boolean>;

  // Merge only the manager keys the request sent; never touch other POS settings.
  const nextPerms = { ...currentPerms };
  const nextOpen = { ...currentOpen };
  if (body.managerPerms && typeof body.managerPerms === "object") {
    for (const k of PERM_KEYS) if (k in body.managerPerms) nextPerms[k] = !!body.managerPerms[k];
  }
  if (body.openPerms && typeof body.openPerms === "object") {
    for (const k of PERM_KEYS) if (k in body.openPerms) nextOpen[k] = !!body.openPerms[k];
  }
  // "Anyone may do it" implies the manager may too — keeps the two flags from
  // drifting into a state the UI cannot represent.
  for (const k of PERM_KEYS) if (nextOpen[k]) nextPerms[k] = true;
  const nextMethod =
    body.approvalMethod === "password" ? "password"
    : body.approvalMethod === "pin" ? "pin"
    : (current.approvalMethod === "password" ? "password" : "pin");

  const merged = { ...current, managerPerms: nextPerms, openPerms: nextOpen, approvalMethod: nextMethod };
  await db.store.update({
    where: { id: session.user.storeId },
    data: { settings: merged as Prisma.InputJsonObject },
  });
  return NextResponse.json(extract(merged));
}
