import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import { isAtLeast } from "@/lib/tier";

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

        // Verify against Supabase Auth — same credentials as the POS owner login
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

        // Store lookup, tier, add-ons, Premium gate.
        return resolveOwner(user.id, user.email ?? credentials.email);
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
