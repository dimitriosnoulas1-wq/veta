import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "nl"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, usePathname, useRouter } = createNavigation(routing);

export function isLocale(value: string): value is "en" | "el" | "nl" {
  return routing.locales.includes(value as "en");
}
