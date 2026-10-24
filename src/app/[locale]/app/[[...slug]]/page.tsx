import type { Metadata } from "next";
import { NAV } from "@/content/catalog";
import { renderMember } from "@/views/member";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug?: string[] } }): Metadata {
  const path = `/${["app", ...(params.slug ?? [])].join("/")}`;
  const match = [...NAV].reverse().find((item) => path === item.href || path.startsWith(`${item.href}/`));
  return { title: match?.label ?? "Dashboard" };
}

export default function Page({
  params,
  searchParams,
}: {
  params: { locale: string; slug?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return renderMember(params.locale, params.slug, searchParams);
}
