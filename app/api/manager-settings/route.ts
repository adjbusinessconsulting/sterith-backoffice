import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Which manager capabilities the owner can grant. Stored inside stores.settings
// (jsonb) so both Back Office (Prisma) and the POS (Supabase) read the same source.
const PERM_KEYS = ["void", "discount", "products", "shifts", "cashDrawer", "stock", "reports"] as const;

interface ManagerSettings { managerPerms: Record<string, boolean>; approvalMethod: "pin" | "password"; }

function extract(settings: unknown): ManagerSettings {
  const s = (settings ?? {}) as Record<string, unknown>;
  const mp = (s.managerPerms ?? {}) as Record<string, unknown>;
  const perms: Record<string, boolean> = {};
  for (const k of PERM_KEYS) perms[k] = !!mp[k];
  const method = s.approvalMethod === "password" ? "password" : "pin";
  return { managerPerms: perms, approvalMethod: method };
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

  // Merge only the manager keys the request sent; never touch other POS settings.
  const nextPerms = { ...currentPerms };
  if (body.managerPerms && typeof body.managerPerms === "object") {
    for (const k of PERM_KEYS) if (k in body.managerPerms) nextPerms[k] = !!body.managerPerms[k];
  }
  const nextMethod =
    body.approvalMethod === "password" ? "password"
    : body.approvalMethod === "pin" ? "pin"
    : (current.approvalMethod === "password" ? "password" : "pin");

  const merged = { ...current, managerPerms: nextPerms, approvalMethod: nextMethod };
  await db.store.update({
    where: { id: session.user.storeId },
    data: { settings: merged as Prisma.InputJsonObject },
  });
  return NextResponse.json(extract(merged));
}
