import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = session.user.businessId;
  if (!businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = session.user.id;
  const { location, lines } = await req.json() as {
    location: "WAREHOUSE" | "STORE";
    lines: { productId: string; physicalQty: number }[];
  };

  const opname = await db.opname.create({
    data: {
      businessId,
      location,
      createdById: userId,
      lines: {
        create: await Promise.all(lines.map(async l => {
          const p = await db.product.findFirst({ where: { id: l.productId } });
          return {
            productId: l.productId,
            systemQty: location === "WAREHOUSE" ? (p?.warehouseQty ?? 0) : (p?.storeQty ?? 0),
            physicalQty: l.physicalQty,
          };
        })),
      },
    },
  });

  return NextResponse.json(opname, { status: 201 });
}
