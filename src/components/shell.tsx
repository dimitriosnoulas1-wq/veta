"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
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
        <Link key={locale} href={pathname || "/"} locale={locale} className="underline decoration-white/25 underline-offset-4" prefetch>
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
      <header className="sticky top-0 z-40 border-b border-line bg-[color:var(--glass)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="display text-2xl text-orange no-underline" prefetch>VateLife</Link>
          <button type="button" className="btn btn-ghost md:hidden" aria-expanded={open} aria-controls="public-nav" onClick={() => setOpen((value) => !value)}>
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
            <span>{open ? t("close") : t("menu")}</span>
          </button>
          <nav id="public-nav" className={`${open ? "grid" : "hidden"} absolute left-0 right-0 top-[3.6rem] z-30 gap-2 border-b border-line bg-[color:var(--card-solid)]/95 p-4 backdrop-blur-xl md:static md:flex md:border-0 md:bg-transparent md:p-0`}>
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-3 text-base no-underline hover:bg-white/5 md:px-2 md:py-1 md:underline" onClick={() => setOpen(false)} prefetch>
                {label}
              </Link>
            ))}
            <div className="grid gap-2 pt-2 md:hidden">
              <Languages />
              <ThemeButton />
              {admin ? <Link className="btn btn-ghost" href="/admin" prefetch>{n("admin")}</Link> : null}
              <Link className="btn btn-primary" href={loggedIn ? "/app" : "/login"} prefetch>{loggedIn ? n("member") : n("login")}</Link>
            </div>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Languages />
            <ThemeButton />
            {admin ? <Link className="btn btn-ghost" href="/admin" prefetch>{n("admin")}</Link> : null}
            <Link className="btn btn-primary" href={loggedIn ? "/app" : "/login"} prefetch>{loggedIn ? n("member") : n("login")}</Link>
          </div>
        </div>
      </header>
      <main id="content" className="page-enter mx-auto grid max-w-6xl gap-8 px-4 py-8 pb-24 md:pb-8">{children}</main>
      <footer className="border-t border-line px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p>Copyright © 2026 VateLife</p>
          <nav className="flex flex-wrap gap-3">
            <Link className="underline" href="/terms" prefetch>{n("terms")}</Link>
            <Link className="underline" href="/privacy" prefetch>{n("privacy")}</Link>
            <Link className="underline" href="/faq" prefetch>{n("faq")}</Link>
            <Link className="underline" href="/news" prefetch>{n("news")}</Link>
            <Link className="underline" href="/articles" prefetch>{n("articles")}</Link>
            <Link className="underline" href="/calendar" prefetch>{n("calendar")}</Link>
            <a className="underline" href="#content">{t("toTop")}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

const BOTTOM = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/learn/crypto", label: "Learn", icon: GraduationCap },
  { href: "/app/shop", label: "Shop", icon: ShoppingBag },
] as const;

export function MemberChrome({ children, firstName, admin }: { children: React.ReactNode; firstName: string; admin: boolean }) {
  const t = useTranslations("chrome");
  const n = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[17rem_1fr]">
      <a className="skip" href="#content">{t("skip")}</a>
      <div
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] border-r border-white/10 bg-[color:var(--plum-deep)] text-[#fff8f1] shadow-2xl transition-transform duration-300 md:static md:z-auto md:block md:w-auto md:translate-x-0 md:shadow-none ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label={n("member")}
      >
        <div className="sticky top-0 flex max-h-screen flex-col gap-2 overflow-y-auto p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Link href="/app" className="display px-2 text-2xl text-[#ffb068] no-underline" prefetch>VateLife</Link>
            <button type="button" className="btn btn-ghost md:hidden" onClick={() => setOpen(false)} aria-label={t("close")}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <nav className="grid gap-1">
            {NAV.map((item) => {
              const active = item.href === "/app" ? pathname === "/app" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm no-underline transition ${active ? "bg-gradient-to-r from-[#c2410c] to-[#9333ea] text-white shadow-glow" : "text-[#fff8f1]/90 hover:bg-white/5"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-line bg-[color:var(--glass)] px-4 py-3 backdrop-blur-xl">
          <button type="button" className="btn btn-ghost md:hidden" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu size={18} aria-hidden="true" />
            <span>{t("menu")}</span>
          </button>
          <Link className="hidden underline sm:inline" href="/app" prefetch>{NAV[0].label}</Link>
          <Link className="hidden underline sm:inline" href="/app/support" prefetch>{t("tickets")}</Link>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Languages />
            <ThemeButton />
            {admin ? <Link className="btn btn-ghost" href="/admin" prefetch>{n("admin")}</Link> : null}
            <details className="relative">
              <summary className="cursor-pointer rounded-full border border-line px-3 py-2 text-sm">{firstName}</summary>
              <div className="absolute right-0 z-20 mt-2 grid min-w-40 gap-2 rounded-2xl border border-line bg-[color:var(--card-solid)] p-3 shadow-card">
                <Link href="/app/account" prefetch>{t("profile")}</Link>
                <button type="button" className="btn btn-ghost" onClick={() => signOut({ callbackUrl: `/${locale}/` })}>{t("signOut")}</button>
              </div>
            </details>
          </div>
        </header>
        <main id="content" className="page-enter grid gap-6 px-4 py-6">{children}</main>
        <footer className="hidden px-4 py-6 text-sm text-muted md:block">
          <p>Copyright © 2026 VateLife</p>
          <a className="underline" href="#content">{t("toTop")}</a>
        </footer>
      </div>
      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[color:var(--glass)]/95 px-2 pt-2 backdrop-blur-xl md:hidden" aria-label={n("member")}>
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {BOTTOM.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/app" ? pathname === "/app" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold no-underline ${active ? "text-orange" : "text-muted"}`}
                >
                  <Icon size={20} aria-hidden="true" strokeWidth={active ? 2.4 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
