import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Read-only audit trail for the store (mirrored from the POS on Premium).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await db.activityLog.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json({ logs });
}
