import type { Metadata } from "next";
import { currentSession } from "@/lib/data";
import { renderPublic } from "@/views/public";

export const revalidate = 60;

const titles: Record<string, string> = {
  pricing: "Pricing",
  plan: "Compensation plan",
  shop: "Shop",
  contact: "Contact",
  terms: "Terms",
  privacy: "Privacy",
  register: "Register",
  login: "Sign in",
  faq: "FAQ",
  news: "News",
  articles: "Articles",
  calendar: "Calendar",
};

export function generateMetadata({ params }: { params: { slug?: string[] } }): Metadata {
  const key = params.slug?.[0] ?? "";
  return { title: titles[key] ?? "Home" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { locale: string; slug?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await currentSession();
  return renderPublic(params.locale, params.slug, searchParams, session);
}
