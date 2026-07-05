import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      storeId: string;
      tier: string;
    };
  }
  interface User {
    id: string;
    role: string;
    storeId: string;
    tier: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    storeId: string;
    tier: string;
  }
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

        // Look up their store
        const store = await db.store.findFirst({
          where: { ownerId: user.id },
        });
        if (!store) return null;

        // Fetch tier via raw query (column added outside Prisma migration)
        const tierRows = await db.$queryRaw<Array<{ tier: string }>>`
          SELECT COALESCE(tier, 'free') AS tier FROM stores WHERE id = ${store.id}::uuid
        `;
        const tier = tierRows[0]?.tier ?? 'free';

        return {
          id: user.id,
          name: credentials.email.split("@")[0],
          email: user.email,
          role: "OWNER",
          storeId: store.id,
          tier,
        };
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
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.storeId = token.storeId;
      session.user.tier = token.tier;
      return session;
    },
  },
};
