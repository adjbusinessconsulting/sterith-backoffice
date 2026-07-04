import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const staff = await db.user.findMany({
    where: { businessId, deletedAt: null },
    select: { id: true, name: true, role: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, pin, role } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!pin || pin.length !== 4) return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 });

  const pinHash = await bcrypt.hash(pin, 10);
  const user = await db.user.create({
    data: { businessId, name: name.trim(), role: role ?? "KASIR", pinHash },
  });

  return NextResponse.json({ id: user.id, name: user.name, role: user.role }, { status: 201 });
}
