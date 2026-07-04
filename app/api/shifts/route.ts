import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shifts = await db.shift.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(shifts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const { name, startTime, endTime, assignedCashierId } = await req.json();
  const shift = await db.shift.create({
    data: { storeId: session.user.storeId, name, startTime, endTime, assignedCashierId },
  });
  return NextResponse.json(shift, { status: 201 });
}
