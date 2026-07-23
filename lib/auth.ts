import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { isAtLeast } from "@/lib/tier";
import { verifyAppPassword } from "@/lib/app-cred";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      storeId: string;
      tier: string;
      addOns: string[];
    };
  }
  interface User {
    id: string;
    role: string;
    storeId: string;
    tier: string;
    addOns: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    storeId: string;
    tier: string;
    addOns: string[];
  }
}

// From a verified Supabase user, resolve the Back Office session user (store,
// tier, add-ons). Premium-gated; returns null if not eligible. Shared by both
// the password provider and the token (SSO) provider.
async function resolveOwner(userId: string, email: string) {
  const store = await db.store.findFirst({ where: { ownerId: userId } });
  if (!store) return null;
  if (store.status !== "active") return null;

  const tierRows = await db.$queryRaw<Array<{ tier: string }>>`
    SELECT COALESCE(tier, 'free') AS tier FROM stores WHERE id = ${store.id}::uuid`;
  const tier = tierRows[0]?.tier ?? 'free';

  let addOns: string[] = [];
  try {
    const addonRows = await db.$queryRaw<Array<{ add_ons: string[] }>>`
      SELECT COALESCE(add_ons, '{}') AS add_ons FROM stores WHERE id = ${store.id}::uuid`;
    addOns = addonRows[0]?.add_ons ?? [];
  } catch { addOns = []; }

  if (!isAtLeast(tier, 'premium')) return null;

  return { id: userId, name: email.split("@")[0], email, role: "OWNER", storeId: store.id, tier, addOns };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email;

        // 1) New per-app password: the owner set an independent Back Office password
        //    via its setup link (app_credentials, scrypt). Same email, own password.
        let credRows: Array<{ owner_id: string; hash: string }> = [];
        try {
          credRows = await db.$queryRaw<Array<{ owner_id: string; hash: string }>>`
            SELECT ac.owner_id AS owner_id, ac.password_hash AS hash
            FROM app_credentials ac
            JOIN auth.users u ON u.id = ac.owner_id
            WHERE ac.app = 'backoffice' AND lower(u.email) = lower(${email})
            LIMIT 1`;
        } catch { credRows = []; }
        // Fallback if auth.users isn't reachable from this connection: resolve the
        // owner via stores.owner_email instead (same credential table).
        if (!credRows[0]?.hash) {
          try {
            credRows = await db.$queryRaw<Array<{ owner_id: string; hash: string }>>`
              SELECT ac.owner_id AS owner_id, ac.password_hash AS hash
              FROM app_credentials ac
              JOIN stores s ON s.owner_id = ac.owner_id
              WHERE ac.app = 'backoffice' AND lower(s.owner_email) = lower(${email})
              LIMIT 1`;
          } catch { /* ignore */ }
        }
        if (credRows[0]?.hash) {
          if (!verifyAppPassword(credentials.password, credRows[0].hash)) return null;
          const u = await resolveOwner(credRows[0].owner_id, email);
          if (!u) throw new Error("NOT_ELIGIBLE");   // password OK, but not Premium/active
          return u;
        }

        // 2) Legacy separate Back Office password (bcrypt, from Settings).
        const boRows = await db.$queryRaw<Array<{ owner_id: string; hash: string }>>`
          SELECT owner_id, backoffice_password_hash AS hash
          FROM stores
          WHERE lower(owner_email) = lower(${email}) AND backoffice_password_hash IS NOT NULL
          LIMIT 1`;
        if (boRows[0]?.hash) {
          const ok = await bcrypt.compare(credentials.password, boRows[0].hash);
          if (!ok) return null;
          const u = await resolveOwner(boRows[0].owner_id, email);
          if (!u) throw new Error("NOT_ELIGIBLE");
          return u;
        }

        // Otherwise verify against Supabase Auth — same credentials as the POS login.
        const res = await fetch(
          `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.SUPABASE_ANON_KEY ?? "",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        if (!res.ok) return null;
        const { user } = await res.json() as { user: { id: string; email: string } };
        if (!user?.id) return null;

        // Supabase password was correct — the only remaining gate is eligibility.
        const u = await resolveOwner(user.id, user.email ?? credentials.email);
        if (!u) throw new Error("NOT_ELIGIBLE");
        return u;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.storeId = user.storeId;
        token.tier = user.tier;
        token.addOns = user.addOns;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.storeId = token.storeId;
      session.user.tier = token.tier;
      session.user.addOns = token.addOns ?? [];
      return session;
    },
  },
};
