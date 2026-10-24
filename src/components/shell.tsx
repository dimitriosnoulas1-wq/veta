"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { NAV, NAV_GROUPS, SOCIAL } from "@/content/catalog";
import { ThemeButton } from "@/components/client";

const LOCALES = ["en", "el", "nl"] as const;

function Languages() {
  const t = useTranslations("chrome");
  const pathname = usePathname();
  return (
    <nav aria-label={t("language")} className="flex gap-1.5 text-xs font-semibold tracking-wide">
      {LOCALES.map((locale) => (
        <Link key={locale} href={pathname || "/"} locale={locale} className="rounded-md px-1.5 py-1 text-muted no-underline hover:text-ink" prefetch>
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
  const [solid, setSolid] = useState(false);
  const links = [
    ["/", n("home")],
    ["/pricing", n("pricing")],
    ["/shop", n("shop")],
    ["/contact", n("contact")],
  ] as const;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <div className="relative z-[1] flex min-h-screen flex-col">
      <a className="skip" href="#content">{t("skip")}</a>
      <header className={`public-header sticky top-0 z-40 ${solid || open ? "is-solid" : ""}`}>
        <div className="container-site flex h-16 items-center justify-between gap-3 md:h-[4.25rem]">
          <Link href="/" className="display text-xl text-ink no-underline md:text-2xl" prefetch>
            VateLife
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label={n("home")}>
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted no-underline transition hover:bg-white/5 hover:text-ink" prefetch>
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Languages />
            <ThemeButton />
            {admin ? <Link className="btn btn-ghost" href="/admin" prefetch>{n("admin")}</Link> : null}
            {loggedIn ? (
              <Link className="btn btn-primary" href="/app" prefetch>{n("member")}</Link>
            ) : (
              <>
                <Link className="btn btn-ghost" href="/login" prefetch>{n("login")}</Link>
                <Link className="btn btn-primary" href="/register" prefetch>{t("join")}</Link>
              </>
            )}
          </div>
          <button type="button" className="btn btn-ghost md:hidden" aria-expanded={open} aria-controls="public-nav" onClick={() => setOpen((value) => !value)}>
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
            <span className="sr-only">{open ? t("close") : t("menu")}</span>
          </button>
        </div>
        {open ? (
          <nav id="public-nav" className="border-t border-line bg-[color:var(--glass-strong)] px-4 py-4 backdrop-blur-xl md:hidden">
            <div className="container-site grid gap-1">
              {links.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-lg px-3 py-3 text-base font-medium no-underline hover:bg-white/5" onClick={() => setOpen(false)} prefetch>
                  {label}
                </Link>
              ))}
              <div className="mt-3 grid gap-2 border-t border-line pt-3">
                <Languages />
                <ThemeButton />
                {admin ? <Link className="btn btn-ghost" href="/admin" onClick={() => setOpen(false)} prefetch>{n("admin")}</Link> : null}
                {loggedIn ? (
                  <Link className="btn btn-primary" href="/app" onClick={() => setOpen(false)} prefetch>{n("member")}</Link>
                ) : (
                  <>
                    <Link className="btn btn-ghost" href="/login" onClick={() => setOpen(false)} prefetch>{n("login")}</Link>
                    <Link className="btn btn-primary" href="/register" onClick={() => setOpen(false)} prefetch>{t("join")}</Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        ) : null}
      </header>
      <main id="content" className="page-enter flex-1">{children}</main>
      <footer className="mt-auto border-t border-line bg-[color:var(--bg-elevated)]">
        <div className="container-site section-y !py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-3">
              <p className="display text-2xl">VateLife</p>
              <p className="max-w-xs text-sm text-muted">{t("rangeNote")}</p>
              <nav className="flex flex-wrap gap-3 pt-2">
                {SOCIAL.map((item) => (
                  <a key={item.href} className="text-sm text-muted underline decoration-white/20 underline-offset-4 hover:text-ink" href={item.href}>{item.label}</a>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Explore</p>
              <nav className="mt-4 grid gap-2 text-sm">
                <Link className="text-ink no-underline hover:text-orange" href="/" prefetch>{n("home")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/pricing" prefetch>{n("pricing")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/shop" prefetch>{n("shop")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/plan" prefetch>{n("plan")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/contact" prefetch>{n("contact")}</Link>
              </nav>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Resources</p>
              <nav className="mt-4 grid gap-2 text-sm">
                <Link className="text-ink no-underline hover:text-orange" href="/faq" prefetch>{n("faq")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/news" prefetch>{n("news")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/articles" prefetch>{n("articles")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/calendar" prefetch>{n("calendar")}</Link>
              </nav>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Legal</p>
              <nav className="mt-4 grid gap-2 text-sm">
                <Link className="text-ink no-underline hover:text-orange" href="/terms" prefetch>{n("terms")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/privacy" prefetch>{n("privacy")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/login" prefetch>{n("login")}</Link>
                <Link className="text-ink no-underline hover:text-orange" href="/register" prefetch>{n("register")}</Link>
                <a className="text-ink no-underline hover:text-orange" href="#content">{t("toTop")}</a>
              </nav>
            </div>
          </div>
          <p className="mt-12 border-t border-line pt-6 text-sm text-muted">Copyright © 2026 VateLife</p>
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

function NavLink({ href, label, pathname, onNavigate }: { href: string; label: string; pathname: string; onNavigate?: () => void }) {
  const active = href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      prefetch
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-2 text-sm no-underline transition ${active ? "bg-white/10 font-semibold text-ink" : "text-muted hover:bg-white/5 hover:text-ink"}`}
    >
      {label}
    </Link>
  );
}

export function MemberChrome({ children, firstName, admin }: { children: React.ReactNode; firstName: string; admin: boolean }) {
  const t = useTranslations("chrome");
  const n = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !query || item.label.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.items.length > 0 || !query);

  const showDashboard = !query || NAV[0].label.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="relative z-[1] min-h-screen md:grid md:grid-cols-[16.5rem_1fr]">
      <a className="skip" href="#content">{t("skip")}</a>
      <div
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-line bg-[color:var(--bg-elevated)] transition-transform duration-300 md:static md:z-auto md:w-auto md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label={n("member")}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
          <Link href="/app" className="display text-xl text-ink no-underline" prefetch>VateLife</Link>
          <button type="button" className="btn btn-ghost md:hidden" onClick={() => setOpen(false)} aria-label={t("close")}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {showDashboard ? <NavLink href="/app" label={NAV[0].label} pathname={pathname} onNavigate={() => setOpen(false)} /> : null}
          {filteredGroups.map((group) => (
            <div key={group.id} className="mt-5">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{group.label}</p>
              <nav className="grid gap-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} onNavigate={() => setOpen(false)} />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-col pb-[4.75rem] md:pb-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-[color:var(--glass-strong)] px-4 py-3 backdrop-blur-xl">
          <button type="button" className="btn btn-ghost md:hidden" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu size={18} aria-hidden="true" />
            <span className="sr-only">{t("menu")}</span>
          </button>
          <label className="relative hidden min-w-0 flex-1 sm:block md:max-w-md">
            <span className="sr-only">{t("search")}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search")}
              className="pl-9"
            />
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Languages />
            <ThemeButton />
            {admin ? <Link className="btn btn-ghost" href="/admin" prefetch>{n("admin")}</Link> : null}
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-[color:var(--card-solid)] py-1.5 pl-1.5 pr-3 text-sm font-semibold">
                <span className="grid size-7 place-items-center rounded-full bg-brand-gradient text-xs text-white" aria-hidden="true">
                  {firstName.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[7rem] truncate">{firstName}</span>
              </summary>
              <div className="absolute right-0 z-20 mt-2 grid min-w-44 gap-1 rounded-xl border border-line bg-[color:var(--card-solid)] p-2 shadow-card">
                <Link className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-white/5" href="/app/account" prefetch>{t("profile")}</Link>
                <Link className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-white/5" href="/app/support" prefetch>{t("tickets")}</Link>
                <button type="button" className="btn btn-ghost justify-start" onClick={() => signOut({ callbackUrl: `/${locale}/` })}>{t("signOut")}</button>
              </div>
            </details>
          </div>
        </header>
        <main id="content" className="page-enter mx-auto w-full max-w-[1200px] flex-1 grid content-start gap-6 px-4 py-6 md:px-6 md:py-8">{children}</main>
        <footer className="mt-auto hidden px-6 py-6 text-sm text-muted md:block">
          <p>Copyright © 2026 VateLife</p>
          <a className="underline" href="#content">{t("toTop")}</a>
        </footer>
      </div>
      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[color:var(--glass-strong)] px-1 pt-1.5 backdrop-blur-xl md:hidden" aria-label={n("member")}>
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5">
          {BOTTOM.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/app" ? pathname === "/app" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[9px] font-semibold leading-tight no-underline ${active ? "text-orange" : "text-muted"}`}
                >
                  <Icon size={18} aria-hidden="true" strokeWidth={active ? 2.4 : 1.8} />
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
