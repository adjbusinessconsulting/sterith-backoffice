import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

// Owner sends feedback / a complaint from the Back Office → lands in Master Office's
// Layanan inbox (shared `feedback` table). The email comes from the session, so the
// owner never has to retype it. `app` tags the source so POS/Back Office feedback
// can be told apart.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { message, type } = await req.json().catch(() => ({}));
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  }
  // Only the two kinds an owner can file; anything else is coerced to feedback.
  const kind = type === "complain" ? "complain" : "feedback";

  await db.$executeRaw`
    insert into feedback (type, email, message, status, app)
    values (${kind}, ${session.user.email}, ${message.trim()}, 'pending', 'backoffice')`;

  return NextResponse.json({ ok: true });
}
