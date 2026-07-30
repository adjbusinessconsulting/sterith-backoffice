import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Credit ledger (bon / hutang) for the store — outstanding and recently settled,
// newest first. Not date-scoped: a bon stays relevant until it's paid off.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = session.user;
  try {
    const rows = await db.hutang.findMany({
      where: { storeId, voided: false },   // cancelled (voided) bons don't appear
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],   // open/partial before lunas
      take: 100,
    });
    return NextResponse.json(rows.map(h => ({
      id: h.id, customerName: h.customerName, phone: h.phone,
      amount: h.amount, paidAmount: h.paidAmount, status: h.status,
      cashierName: h.cashierName, createdAt: h.createdAt, settledAt: h.settledAt,
    })));
  } catch {
    return NextResponse.json([]);   // hutang table not migrated on this DB
  }
}
