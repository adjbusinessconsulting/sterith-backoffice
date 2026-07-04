import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const shifts = await db.shift.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(shifts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, startTime, endTime, assignedId } = await req.json();
  const shift = await db.shift.create({
    data: { businessId, name, startTime, endTime, assignedId },
  });
  return NextResponse.json(shift, { status: 201 });
}
