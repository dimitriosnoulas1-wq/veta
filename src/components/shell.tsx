"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { NAV } from "@/content/catalog";
import { ThemeButton } from "@/components/client";

const LOCALES = ["en", "el", "nl"] as const;

function Languages() {
  const t = useTranslations("chrome");
  const pathname = usePathname();
  return (
    <nav aria-label={t("language")} className="flex gap-2 text-sm">
      {LOCALES.map((locale) => (
        <Link key={locale} href={pathname || "/"} locale={locale} className="underline">
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}

export function PublicChrome({ children, loggedIn, admin }: { children: React.ReactNode; loggedIn: boolean; admin: boolean }) {
  const t = useTranslations("chrome");
  const n = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const links = [
    ["/", n("home")],
    ["/pricing", n("pricing")],
    ["/shop", n("shop")],
    ["/plan", n("plan")],
    ["/contact", n("contact")],
  ] as const;
  return (
    <div className="min-h-screen">
      <a className="skip" href="#content">{t("skip")}</a>
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="serif text-2xl text-orange no-underline">VateLife</Link>
          <button type="button" className="btn btn-ghost md:hidden" onClick={() => setOpen((value) => !value)}>{open ? t("close") : t("menu")}</button>
          <nav className={`${open ? "grid" : "hidden"} absolute left-0 right-0 top-16 z-30 gap-2 border-b border-line bg-card p-4 md:static md:flex md:border-0 md:bg-transparent md:p-0`}>
            {links.map(([href, label]) => <Link key={href} href={href} className="underline" onClick={() => setOpen(false)}>{label}</Link>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Languages />
            <ThemeButton />
            {admin ? <Link className="btn btn-ghost" href="/admin">{n("admin")}</Link> : null}
            <Link className="btn btn-primary" href={loggedIn ? "/app" : "/login"}>{loggedIn ? n("member") : n("login")}</Link>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto grid max-w-6xl gap-8 px-4 py-8">{children}</main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p>Copyright © 2026 VateLife</p>
          <nav className="flex flex-wrap gap-3">
            <Link className="underline" href="/terms">{n("terms")}</Link>
            <Link className="underline" href="/privacy">{n("privacy")}</Link>
            <Link className="underline" href="/faq">{n("faq")}</Link>
            <Link className="underline" href="/news">{n("news")}</Link>
            <Link className="underline" href="/articles">{n("articles")}</Link>
            <Link className="underline" href="/calendar">{n("calendar")}</Link>
            <a className="underline" href="#content">{t("toTop")}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function MemberChrome({ children, firstName, admin }: { children: React.ReactNode; firstName: string; admin: boolean }) {
  const t = useTranslations("chrome");
  const n = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:grid md:grid-cols-[17rem_1fr]">
      <a className="skip" href="#content">{t("skip")}</a>
      <aside className={`${open ? "block" : "hidden"} border-r border-white/10 bg-plum-deep text-[#fff8f1] md:block`}>
        <div className="sticky top-0 flex max-h-screen flex-col gap-2 overflow-y-auto p-4">
          <Link href="/app" className="serif px-2 text-2xl text-[#ffb068] no-underline">VateLife</Link>
          <nav aria-label={n("member")} className="grid gap-1">
            {NAV.map((item) => {
              const active = item.href === "/app" ? pathname === "/app" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-xl px-3 py-2 no-underline ${active ? "bg-[#c2410c] text-white" : "text-[#fff8f1]"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div>
        <header className="flex flex-wrap items-center gap-2 border-b border-line bg-card px-4 py-3">
          <button type="button" className="btn btn-ghost md:hidden" onClick={() => setOpen((value) => !value)}>{open ? t("close") : t("menu")}</button>
          <Link className="underline" href="/app">{NAV[0].label}</Link>
          <Link className="underline" href="/app/support">{t("tickets")}</Link>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Languages />
            <ThemeButton />
            {admin ? <Link className="btn btn-ghost" href="/admin">{n("admin")}</Link> : null}
            <details>
              <summary className="cursor-pointer">{firstName}</summary>
              <div className="mt-2 grid gap-2">
                <Link href="/app/account">{t("profile")}</Link>
                <button type="button" className="btn btn-ghost" onClick={() => signOut({ callbackUrl: `/${locale}/` })}>{t("signOut")}</button>
              </div>
            </details>
          </div>
        </header>
        <main id="content" className="grid gap-6 px-4 py-6">{children}</main>
        <footer className="px-4 py-6 text-sm text-muted">
          <p>Copyright © 2026 VateLife</p>
          <a className="underline" href="#content">{t("toTop")}</a>
        </footer>
      </div>
    </div>
  );
}
