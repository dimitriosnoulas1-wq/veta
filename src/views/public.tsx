import { getTranslations } from "next-intl/server";
import type { Session } from "next-auth";
import { Link } from "@/i18n/routing";
import { CaptchaFields, CardLink, DataTable, Grid, HiddenLocale, Mark, Notice, PageHead } from "@/components/ui";
import { Countdown, HeroDecor, LoginForm } from "@/components/client";
import { PublicChrome } from "@/components/shell";
import { ADDRESS, NOTIFY_WHATSAPP, PLAY_STORE, POSITIONING, RANKS, SOCIAL, SUPPORT_WHATSAPP, ACTIVE_UNTIL } from "@/content/catalog";
import { flashText, getPlans, getProducts } from "@/lib/data";
import { safeCallback } from "@/lib/format";
import { prisma } from "@/lib/db";
import { money } from "@/lib/utils";
import { addToCart, registerMember, sendContact } from "@/lib/actions";

function q(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function Flash({ code }: { code: string }) {
  const key = flashText(code);
  if (!key) return null;
  const t = await getTranslations("chrome");
  return <Notice>{t(key)}</Notice>;
}

export async function Library({ locale, kind, query }: { locale: string; kind: "faq" | "news" | "articles" | "calendar"; query: string }) {
  const t = await getTranslations("chrome");
  const n = await getTranslations("nav");
  const title = n(kind === "faq" ? "faq" : kind === "news" ? "news" : kind === "articles" ? "articles" : "calendar");
  const intro = t(kind === "faq" ? "faqEmpty" : kind === "news" ? "newsEmpty" : kind === "articles" ? "articlesEmpty" : "calendarNote");
  return (
    <section className="grid gap-4">
      <PageHead title={title} intro={intro} crumbs={[{ href: `/${locale}`.replace(`/${locale}`, "/"), label: n("home") }, { label: title }]} />
      {kind === "faq" ? <Faq query={query} empty={t("noMatch")} search={t("search")} /> : null}
      {kind === "news" ? <News empty={t("emptyList")} /> : null}
      {kind === "articles" ? <Articles empty={t("emptyList")} read={t("read")} /> : null}
      {kind === "calendar" ? <Calendar /> : null}
    </section>
  );
}

async function Faq({ query, empty, search }: { query: string; empty: string; search: string }) {
  const rows = await prisma.faq.findMany({ orderBy: { sort: "asc" } });
  const filtered = rows.filter((row) => `${row.category} ${row.question} ${row.answer}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="grid gap-3">
      <form className="flex gap-2">
        <input name="q" defaultValue={query} aria-label={search} placeholder={search} />
        <button className="btn btn-primary" type="submit">{search}</button>
      </form>
      {filtered.length ? filtered.map((row) => (
        <article key={row.id} className="card p-4">
          <p className="text-sm text-muted">{row.category}</p>
          <h2 className="serif text-2xl">{row.question}</h2>
          <p className="mt-2">{row.answer}</p>
        </article>
      )) : <Notice>{empty}</Notice>}
    </div>
  );
}

async function News({ empty }: { empty: string }) {
  const rows = await prisma.newsItem.findMany({ orderBy: { createdAt: "desc" } });
  if (!rows.length) return <Notice>{empty}</Notice>;
  return <div className="grid gap-3">{rows.map((row) => <article key={row.id} className="card p-4"><h2 className="serif text-2xl">{row.title}</h2><p className="mt-2">{row.body}</p></article>)}</div>;
}

async function Articles({ empty, read }: { empty: string; read: string }) {
  const rows = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  if (!rows.length) return <Notice>{empty}</Notice>;
  return <div className="grid gap-3">{rows.map((row) => <article key={row.id} className="card p-4"><h2 className="serif text-2xl">{row.title}</h2><p className="mt-2 whitespace-pre-wrap">{row.body || empty}</p><p className="mt-2 text-sm">{read}</p></article>)}</div>;
}

async function Calendar() {
  const rows = await prisma.calendarEvent.findMany();
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article key={row.id} className="card p-4">
          <h2 className="serif text-2xl">{row.title}</h2>
          <p>{row.when}</p>
          <p>{row.note}</p>
          <a className="underline" href={row.href}>{row.href}</a>
        </article>
      ))}
    </div>
  );
}

export async function renderPublic(locale: string, slug: string[] | undefined, search: Record<string, string | string[] | undefined>, session: Session | null) {
  const body = await publicBody(locale, slug ?? [], search);
  return (
    <PublicChrome loggedIn={Boolean(session?.user?.id)} admin={session?.user?.role === "ADMIN"}>
      {body}
    </PublicChrome>
  );
}

async function publicBody(locale: string, slug: string[], search: Record<string, string | string[] | undefined>) {
  const t = await getTranslations("chrome");
  const n = await getTranslations("nav");
  const page = slug[0] ?? "home";
  const flash = <Flash code={q(search.m)} />;
  if (slug.length === 0) return <Home t={t} />;
  if (page === "pricing") return <Pricing t={t} n={n} flash={flash} />;
  if (page === "plan") return <Plan t={t} n={n} />;
  if (page === "shop" && slug[1]) return <ProductView id={slug[1]} t={t} shopLabel={n("shop")} member={false} locale={locale} />;
  if (page === "shop") return <Shop t={t} shopLabel={n("shop")} homeLabel={n("home")} kind={q(search.kind)} member={false} locale={locale} />;
  if (page === "contact") return <Contact t={t} n={n} locale={locale} flash={flash} />;
  if (page === "terms") return <Terms t={t} n={n} />;
  if (page === "privacy") return <Privacy t={t} n={n} />;
  if (page === "register") return <Register t={t} n={n} locale={locale} flash={flash} />;
  if (page === "login") return <section className="grid gap-4"><PageHead title={n("login")} crumbs={[{ href: "/", label: n("home") }, { label: n("login") }]} />{flash}<LoginForm registered={q(search.m) === "registered"} callbackUrl={safeCallback(locale, q(search.callbackUrl))} /></section>;
  if (page === "faq" || page === "news" || page === "articles" || page === "calendar") return <Library locale={locale} kind={page} query={q(search.q)} />;
  return <PageHead title={t("missing")} crumbs={[{ href: "/", label: n("home") }, { label: t("missing") }]} />;
}

function Home({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const cards = [
    ["Leads", "/app/leads"],
    ["Advertising Airtime", "/app/ads"],
    ["Smart Tools", "/app/tools"],
    ["Digital Marketing", "/app/learn/digital-marketing"],
    ["Crypto", "/app/learn/crypto"],
    ["AI", "/app/learn/ai"],
    ["Inviting Tools & Traffic Sources", "/app/inviting"],
    ["Chats Broadcast", "/app/broadcast"],
    ["Marketing Softwares", "/app/software/wizard"],
    ["eShop", "/shop"],
    ["Live Coaches", "/app/coaching"],
  ];
  return (
    <div className="grid gap-8">
      <section className="grid items-center gap-6 rounded-3xl bg-plum px-6 py-8 text-[#fff8f1] md:grid-cols-[1fr_auto] md:px-10">
        <div>
          <p className="text-[#ffd7a8]">VateLife</p>
          <h1 className="serif text-4xl md:text-6xl">Empowering Your Success</h1>
          <p className="mt-3 max-w-xl text-[#f6ede6]">{t("rangeNote")}</p>
          <Link className="btn btn-primary mt-5" href="/app">Dashboard</Link>
        </div>
        <HeroDecor><Mark seed="home-hero" /></HeroDecor>
      </section>
      <section className="grid gap-4">
        <h2 className="serif text-3xl">WHAT DO YOU GET with Your Membership</h2>
        <Grid>
          {cards.map(([title, href]) => <CardLink key={title} href={href} title={title} seed={title} action={t("open")} />)}
        </Grid>
      </section>
      <section className="card p-6">
        <h2 className="serif text-3xl">The VateLife Story</h2>
        <p className="mt-2">{t("storyMissing")}</p>
        <a className="btn btn-plum mt-4" href={PLAY_STORE}>{t("external")}</a>
      </section>
      <section className="card p-6">
        <h2 className="serif text-3xl">Testimonials</h2>
        <p className="mt-2">{t("quotesMissing")}</p>
      </section>
      <nav className="flex flex-wrap gap-3">
        {SOCIAL.map((item) => <a key={item.href} className="underline" href={item.href}>{item.label}</a>)}
      </nav>
    </div>
  );
}

async function Pricing({ t, n, flash }: { t: Awaited<ReturnType<typeof getTranslations>>; n: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  const plans = await getPlans();
  const yn = (value: boolean) => (value ? t("yes") : t("no"));
  return (
    <section className="grid gap-4">
      <PageHead title={n("pricing")} intro={t("rangeNote")} crumbs={[{ href: "/", label: n("home") }, { label: n("pricing") }]} />
      {flash}
      <Notice>{t("renewalNote")}</Notice>
      <Notice>{t("replayNote")}</Notice>
      <Notice>{t("noIncome")}</Notice>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("title")}</th>
              {plans.map((plan) => <th key={plan.code}>{plan.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <Row label={t("price")} cells={plans.map((plan) => plan.interval === "year" ? `${money(plan.recurringCents)} ${t("annually")}` : `${money(plan.enrollmentCents)} ${t("oneTime")} + ${money(plan.recurringCents)} ${t("monthly")}`)} />
            <Row label="Leads" cells={plans.map((plan) => String(plan.leads))} />
            <Row label="Leads on renewal" cells={plans.map((plan) => `+${plan.leadsOnRenewal}`)} />
            <Row label="Impressions" cells={plans.map((plan) => plan.impressions.toLocaleString("en-US"))} />
            <Row label="Impressions on renewal" cells={plans.map((plan) => `+${plan.impressionsOnRenewal.toLocaleString("en-US")}`)} />
            <Row label="Marketing softwares" cells={plans.map((plan) => String(plan.softwares))} />
            <Row label="WhatsApp Cast" cells={plans.map((plan) => yn(plan.waCast))} />
            <Row label="Telegram Cast" cells={plans.map((plan) => yn(plan.tgCast))} />
            <Row label="Leads Catcher" cells={plans.map((plan) => yn(plan.leadsCatcher))} />
            <Row label="Meta WA Campaigns" cells={plans.map((plan) => yn(plan.metaWa))} />
            <Row label="Gift products" cells={plans.map((plan) => String(plan.giftProducts))} />
            <Row label="Live Coaching" cells={plans.map((plan) => plan.liveCoaching)} />
            <Row label="Voucher" cells={plans.map((plan) => money(plan.voucherCents))} />
            <Row label="Placement" cells={plans.map((plan) => plan.placement)} />
            <Row label="Direct commission" cells={plans.map((plan) => money(plan.directCommissionCents))} />
            <Row label="Matrix depth" cells={plans.map((plan) => String(plan.matrixDepth))} />
            <Row label="Team lead levels" cells={plans.map((plan) => String(plan.teamLeadLevels))} />
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        {plans.map((plan) => <Link key={plan.code} className="btn btn-primary" href={`/app/upgrade?plan=${plan.code}`}>{t("choose")} {plan.name}</Link>)}
      </div>
      <p className="text-sm text-muted">{t("planKept")}</p>
      <p className="text-sm">{t("metaNote")}</p>
    </section>
  );
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return <tr><th scope="row">{label}</th>{cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>;
}

function Plan({ t, n }: { t: Awaited<ReturnType<typeof getTranslations>>; n: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="grid gap-4">
      <PageHead title={n("plan")} intro="All-in-One Platform ($12 monthly) · Automated System. Multi-Language · 2x14 Matrix Plan" crumbs={[{ href: "/", label: n("home") }, { label: n("plan") }]} />
      <p>The Fastest Growing PLATFORM</p>
      <p>Pre-Positioning Just Started!</p>
      <h2 className="serif text-3xl">HOW YOU GET PAID</h2>
      <Notice>{t("noIncome")}</Notice>
      <ul className="grid gap-2">
        <li>Powerline 2x14 Matrix</li>
        <li>Fast Start $10–$120</li>
        <li>Infinity Bonus $1 (PASS-UP)</li>
        <li>Leadership Ranks Bronze to Diamond</li>
        <li>Profit Sharing Pool 4%</li>
        <li>Advertising Commission 25% / 10% / 5% / 5% / 5%</li>
        <li>eShop Retail</li>
        <li>Team Commission</li>
      </ul>
      <DataTable columns={["Rank", "Directs", "Bonus", "Extra"]} rows={RANKS.map((rank) => [rank.name, String(rank.directs), money(rank.bonusCents), rank.extra])} empty={t("emptyList")} />
      <p>{POSITIONING.paidPending} Paid-Pending Members. {POSITIONING.freeMembers} Free Members. {t("snapshot")}.</p>
    </section>
  );
}

export async function Shop({ t, shopLabel, homeLabel, kind, member, locale }: { t: Awaited<ReturnType<typeof getTranslations>>; shopLabel: string; homeLabel: string; kind: string; member: boolean; locale: string }) {
  const products = await getProducts();
  const selected = kind === "PHYSICAL" || kind === "OFFER" ? kind : "EBOOK";
  const visible = products.filter((product) => product.kind === selected);
  const base = member ? "/app/shop" : "/shop";
  return (
    <section className="grid gap-4">
      <PageHead title={member ? "eShop" : shopLabel} intro={t("memberPriceNote")} crumbs={[{ href: member ? "/app" : "/", label: member ? "Dashboard" : homeLabel }, { label: member ? "eShop" : shopLabel }]} />
      {selected === "PHYSICAL" ? <Notice>{t("freeShipping")}</Notice> : null}
      <div className="flex flex-wrap gap-2">
        {[["EBOOK", "Digital"], ["PHYSICAL", "Physical"], ["OFFER", "Special Offers"]].map(([value, label]) => (
          <Link key={value} className={selected === value ? "btn btn-primary" : "btn btn-ghost"} href={`${base}?kind=${value}`}>{label}</Link>
        ))}
      </div>
      <Grid>
        {visible.map((product) => (
          <CardLink key={product.id} href={`${base}/${product.id}`} title={product.title} seed={product.id} action={t("open")} note={`${t("price")} ${money(product.priceCents)} · ${t("memberPrice")} ${money(product.memberCents)}`} />
        ))}
      </Grid>
      {member ? <Link className="btn btn-ghost w-fit" href="/app/shop/cart">{t("cart")}</Link> : null}
      <span className="sr-only">{locale}</span>
    </section>
  );
}

export async function ProductView({ id, t, shopLabel, member, locale }: { id: string; t: Awaited<ReturnType<typeof getTranslations>>; shopLabel: string; member: boolean; locale: string }) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return <PageHead title={t("missing")} crumbs={[{ href: member ? "/app/shop" : "/shop", label: shopLabel }, { label: t("missing") }]} />;
  return (
    <section className="grid gap-4">
      <PageHead title={product.title} intro={product.detail || t("empty")} crumbs={[{ href: member ? "/app/shop" : "/shop", label: shopLabel }, { label: product.title }]} />
      <div className="card grid gap-2 p-5 md:grid-cols-[auto_1fr]">
        <span className="sr-only">{locale}</span>
        <p>{t("was")} {money(product.wasCents)}</p>
        <p>{t("price")} {money(product.priceCents)}</p>
        <p>{t("memberPrice")} {money(product.memberCents)}</p>
        <p>{t("memberPriceNote")}</p>
        {product.kind === "PHYSICAL" ? <p>{t("freeShipping")}</p> : <p>Digital delivery</p>}
        {member ? (
          <form action={addToCart}>
            <HiddenLocale locale={locale} />
            <input type="hidden" name="productId" value={product.id} />
            <button className="btn btn-primary" type="submit">{t("add")}</button>
          </form>
        ) : <Link className="btn btn-primary w-fit" href="/login">Sign in</Link>}
      </div>
    </section>
  );
}

function Contact({ t, n, locale, flash }: { t: Awaited<ReturnType<typeof getTranslations>>; n: Awaited<ReturnType<typeof getTranslations>>; locale: string; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title={n("contact")} intro={t("contactPrefill")} crumbs={[{ href: "/", label: n("home") }, { label: n("contact") }]} />
      {flash}
      <p>{ADDRESS}</p>
      <p><a className="underline" href={SUPPORT_WHATSAPP}>{SUPPORT_WHATSAPP}</a></p>
      <p><a className="underline" href={NOTIFY_WHATSAPP}>{NOTIFY_WHATSAPP}</a></p>
      <form action={sendContact} className="card grid gap-3 p-5" autoComplete="off">
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("name")}</span><input name="name" autoComplete="off" required /></label>
        <label className="field"><span>{t("email")}</span><input name="email" type="email" autoComplete="off" required /></label>
        <label className="field"><span>{t("department")}</span><select name="department" defaultValue="Support"><option value="Support">Support</option><option value="Sales">Sales</option></select></label>
        <p className="text-sm text-muted">{t("deptNote")}</p>
        <label className="field"><span>{t("subject")}</span><input name="subject" required /></label>
        <label className="field"><span>{t("message")}</span><textarea name="message" required /></label>
        <CaptchaFields label={t("captcha")} />
        <button className="btn btn-primary w-fit" type="submit">{t("send")}</button>
      </form>
    </section>
  );
}

function Terms({ t, n }: { t: Awaited<ReturnType<typeof getTranslations>>; n: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="grid gap-4">
      <PageHead title={n("terms")} intro="Last Updated: July 28, 2026" crumbs={[{ href: "/", label: n("home") }, { label: n("terms") }]} />
      <p>{t("age")}</p>
      <h2 className="serif text-2xl">Disclaimer of No Promises</h2>
      <p>{t("noIncome")}</p>
      <p>Digital refunds are final. Unopened physical goods may be returned within 14 days. Damaged goods must be reported within 48 hours.</p>
      <p>{t("empty")}</p>
    </section>
  );
}

function Privacy({ t, n }: { t: Awaited<ReturnType<typeof getTranslations>>; n: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="grid gap-4">
      <PageHead title={n("privacy")} intro="Last Updated: July 28, 2026" crumbs={[{ href: "/", label: n("home") }, { label: n("privacy") }]} />
      <p>{ADDRESS}</p>
      <p>{t("age")}</p>
      <p>Anti-spam. Rights. Strict permission-based communication.</p>
      <p>{t("empty")}</p>
    </section>
  );
}

function Register({ t, n, locale, flash }: { t: Awaited<ReturnType<typeof getTranslations>>; n: Awaited<ReturnType<typeof getTranslations>>; locale: string; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Create Your Free Account" intro={t("optionalSponsor")} crumbs={[{ href: "/", label: n("home") }, { label: n("register") }]} />
      <Countdown target={ACTIVE_UNTIL} />
      <p className="text-sm text-muted">{t("activeHelp")}</p>
      {flash}
      <form action={registerMember} className="card grid gap-3 p-5" autoComplete="off">
        <HiddenLocale locale={locale} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="field"><span>{t("firstName")}</span><input name="firstName" autoComplete="off" required /></label>
          <label className="field"><span>{t("lastName")}</span><input name="lastName" autoComplete="off" required /></label>
        </div>
        <label className="field"><span>{t("email")}</span><input name="email" type="email" autoComplete="off" required /></label>
        <label className="field"><span>{t("phone")}</span><input name="phone" autoComplete="off" /></label>
        <label className="field"><span>{t("country")}</span><input name="country" autoComplete="off" /></label>
        <p className="text-sm text-muted">{t("countriesUnset")}</p>
        <label className="field"><span>{t("sponsor")}</span><input name="sponsor" autoComplete="off" /></label>
        <label className="field"><span>{t("username")}</span><input name="username" autoComplete="off" required /></label>
        <label className="field"><span>{t("password")}</span><input name="password" type="password" autoComplete="new-password" required /></label>
        <label className="field"><span>{t("confirm")}</span><input name="confirm" type="password" autoComplete="new-password" required /></label>
        <p className="text-sm">{t("passwordRule")} {t("showPassword")}</p>
        <CaptchaFields label={t("captcha")} />
        <label className="flex items-center gap-2"><input className="h-5 w-5" type="checkbox" name="terms" value="yes" required /><span>{t("termsAgree")}</span></label>
        <p className="text-sm">{t("age")}</p>
        <button className="btn btn-primary w-fit" type="submit">{n("register")}</button>
      </form>
    </section>
  );
}
