import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Lightweight check so an active session gets logged out when the store is suspended.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) {
    return NextResponse.json({ suspended: true }, { status: 401 });
  }
  const store = await db.store.findUnique({
    where: { id: session.user.storeId },
    select: { status: true },
  });
  return NextResponse.json({ suspended: !store || store.status !== "active" });
}
