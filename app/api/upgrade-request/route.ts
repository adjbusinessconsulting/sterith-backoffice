import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Client submits a tier/add-on upgrade request → lands in Master Office's Layanan
// inbox (shared `feedback` table, type='upgrade_request').
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { message } = await req.json().catch(() => ({}));
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  }
  await db.$executeRaw`
    insert into feedback (type, email, message, status)
    values ('upgrade_request', ${session.user.email}, ${message}, 'pending')`;
  return NextResponse.json({ ok: true });
}
