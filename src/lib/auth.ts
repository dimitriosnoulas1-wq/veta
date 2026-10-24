import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { verifySync } from "otplib";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/en/login" },
  providers: [
    Email({
      server: process.env.EMAIL_SERVER || "smtp://127.0.0.1:1025",
      from: process.env.EMAIL_FROM || "VateLife <no-reply@vatelife.local>",
      async sendVerificationRequest({ identifier, url }) {
        const dir = path.join(process.cwd(), "data");
        mkdirSync(dir, { recursive: true });
        appendFileSync(path.join(dir, "email-outbox.log"), `${new Date().toISOString()} ${identifier} ${url}\n`);
      },
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Authentication code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        if (user.totpEnabled) {
          const token = credentials?.totp?.replace(/\s/g, "") ?? "";
          if (!token || !user.totpSecret) throw new Error("TOTP_REQUIRED");
          const result = verifySync({ secret: user.totpSecret, token });
          if (!result.valid) throw new Error("TOTP_INVALID");
        }
        return { id: user.id, email: user.email, name: user.firstName };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email") {
        if (!user.email) return false;
        const existing = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
        return Boolean(existing);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (!token.sub) return session;
      const record = await prisma.user.findUnique({ where: { id: token.sub } });
      if (!record) return session;
      session.user.id = record.id;
      session.user.role = record.role;
      session.user.planCode = record.planCode;
      session.user.status = record.status;
      session.user.firstName = record.firstName;
      session.user.username = record.username;
      session.user.email = record.email;
      return session;
    },
  },
};
