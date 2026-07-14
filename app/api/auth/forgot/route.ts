import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Back Office "Lupa password?" — resets the shared account password by email and
// clears any SEPARATE Back Office password, so recovery always restores access
// (Back Office reverts to the shared password once the owner sets a new one).
// Always returns ok (don't reveal whether an email exists).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email: string = (body.email ?? "").trim();
  if (!email) return NextResponse.json({ ok: true });

  // Revert the separate Back Office password (downgrades to the shared password —
  // grants no access on its own, since the shared password is still required).
  try {
    await db.$executeRaw`UPDATE stores SET backoffice_password_hash = NULL WHERE lower(owner_email) = lower(${email})`;
  } catch { /* ignore */ }

  // Send the shared-account reset email via the existing Master Office flow.
  try {
    await fetch("https://masteroffice.sterith.com/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch { /* ignore */ }

  return NextResponse.json({ ok: true });
}
