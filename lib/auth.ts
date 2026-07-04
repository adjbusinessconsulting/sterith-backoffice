import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      businessId: string | null;  // null for MASTER_ADMIN
    };
  }
  interface User {
    id: string;
    role: string;
    businessId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    businessId: string | null;
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

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordH) return null;
        if (user.role === "KASIR") return null;       // POS-only, not allowed here
        if (user.deletedAt) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordH);
        if (!valid) return null;

        // MASTER_ADMIN logs into Master Office, not Backoffice.
        // Block them here so they don't accidentally land in a single-business view.
        if (user.role === "MASTER_ADMIN") return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? "",
          role: user.role,
          businessId: user.businessId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessId = user.businessId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.businessId = token.businessId;
      return session;
    },
  },
};
