import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/routing";

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  return children;
}
