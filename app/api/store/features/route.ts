import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// POS feature toggles that live in stores.settings (jsonb). Premium owners manage
// them here in Back Office; the POS reads the same source via mergeSettings, so a
// change here shows up in the POS on its next refresh. Keys + defaults mirror the
// POS DEFAULT_SETTINGS.
const FEATURE_DEFAULTS: Record<string, boolean> = {
  pay_tunai: true, pay_qris: true, pay_transfer: true, pay_debit: true, pay_ewallet: true,
  hutang: true, kas: true, rekonsiliasi: true, gantiShift: true, fotoBuktiWajib: false,
  pinWajib: true, passwordConfirmPrice: true, receiptLogo: true, whatsappShare: true,
  sellWhenHabis: true,
};
const FEATURE_KEYS = Object.keys(FEATURE_DEFAULTS);

function extract(settings: unknown): Record<string, boolean> {
  const s = (settings ?? {}) as Record<string, unknown>;
  const out: Record<string, boolean> = {};
  for (const k of FEATURE_KEYS) out[k] = k in s ? !!s[k] : FEATURE_DEFAULTS[k];
  return out;
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

  // Merge only the feature keys the request sent; never touch other POS settings
  // (managerPerms, quickCash, sessionGraceMinutes, etc.).
  const merged: Record<string, unknown> = { ...current };
  for (const k of FEATURE_KEYS) if (k in body) merged[k] = !!body[k];

  await db.store.update({
    where: { id: session.user.storeId },
    data: { settings: merged as Prisma.InputJsonObject },
  });
  return NextResponse.json(extract(merged));
}
