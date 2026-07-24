import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// The signed-in owner's store name + address, for the sidebar header.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await db.store.findUnique({ where: { id: session.user.storeId }, select: { name: true, address: true } });
  return NextResponse.json({ name: store?.name ?? "", address: store?.address ?? "" });
}
