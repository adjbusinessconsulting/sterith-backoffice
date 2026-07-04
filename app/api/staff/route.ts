import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cashiers = await db.cashier.findMany({
    where: { storeId: session.user.storeId, active: true },
    select: { id: true, name: true, initials: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(cashiers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const { name, pin, role } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!pin || String(pin).length !== 4) return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 });

  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();

  const cashier = await db.cashier.create({
    data: {
      storeId: session.user.storeId,
      name: name.trim(),
      initials,
      role: role ?? "kasir",
      pin: String(pin),
    },
  });

  return NextResponse.json({ id: cashier.id, name: cashier.name, role: cashier.role }, { status: 201 });
}
