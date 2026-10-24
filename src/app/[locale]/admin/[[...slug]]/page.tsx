import type { Metadata } from "next";
import { renderAdmin } from "@/views/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

export default function Page({
  params,
  searchParams,
}: {
  params: { locale: string; slug?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return renderAdmin(params.locale, params.slug, searchParams);
}
