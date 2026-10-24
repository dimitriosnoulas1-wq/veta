import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { PlanCode } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeCallback } from "@/lib/format";
import { messages } from "@/messages/en";

const PLAN_ORDER: PlanCode[] = ["BASIC", "PRO", "ELITE", "VIP"];

export async function currentSession() {
  return getServerSession(authOptions);
}

export async function requireUser(locale: string, nextPath?: string) {
  const session = await currentSession();
  const login = `/${locale}/login?callbackUrl=${encodeURIComponent(safeCallback(locale, nextPath))}`;
  if (!session?.user?.id) redirect(login);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { notifications: true, messengers: true, payout: true, testimony: true },
  });
  if (!user) redirect(login);
  const { passwordHash, totpSecret, ...safe } = user;
  void passwordHash;
  void totpSecret;
  return safe;
}

export async function requireAdmin(locale: string, nextPath?: string) {
  const user = await requireUser(locale, nextPath);
  if (user.role !== "ADMIN") redirect(`/${locale}/app`);
  return user;
}

export async function getPlans() {
  const plans = await prisma.plan.findMany();
  return PLAN_ORDER.map((code) => plans.find((plan) => plan.code === code)).filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));
}

export async function getProducts() {
  return prisma.product.findMany({ orderBy: [{ kind: "asc" }, { title: "asc" }] });
}

export function flashText(code: string) {
  if (code in messages.chrome) return code as keyof typeof messages.chrome;
  return null;
}

export function dueNow(plan: { interval: string; enrollmentCents: number; recurringCents: number }) {
  return plan.interval === "year" ? plan.recurringCents : plan.enrollmentCents;
}

export function addInterval(interval: string, from = new Date()) {
  const next = new Date(from);
  if (interval === "year") next.setUTCFullYear(next.getUTCFullYear() + 1);
  else next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}
