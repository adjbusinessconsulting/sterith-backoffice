// Verify a per-app password hash (scrypt) — matches Master Office lib/app-auth.ts.
import { scryptSync, timingSafeEqual } from "crypto";

const N = 16384, r = 8, p = 1;

export function verifyAppPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  try {
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, expected.length, { N, r, p });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
