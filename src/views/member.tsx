import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CaptchaFields, CardLink, DataTable, Grid, HiddenLocale, Notice, PageHead } from "@/components/ui";
import { AnimatedCounter, CopyField, Countdown, LockNotice, TeamTree, TotpPanel, WithdrawCode } from "@/components/client";
import { KpiTile, ProgressRing } from "@/components/graphics";
import { YouTubeLite } from "@/components/media";
import { MemberChrome } from "@/components/shell";
import { ACADEMIES, AD_PACKS, BOXOKO, BRIDGE_STEPS, CHAT_STRATEGIES, EMAIL_PROVIDERS, EMAIL_SEQUENCES, GLOBAL_LEAD_TOTAL, INVITE_CHANNELS, INVITE_PHASES, LEAD_LEGEND, MESSENGERS, NOTIFICATION_KEYS, NOTIFY_WHATSAPP, PLAY_STORE, POSITIONING, REFERRAL_LEGEND, REPLAY_CENTS, SOCIAL, SPONSOR, SUPPORT_WHATSAPP, TOOL_GROUPS, TRAININGS, TRAFFIC, VERIFIERS, WITHDRAW_FEE_CENTS, ACTIVE_UNTIL } from "@/content/catalog";
import { accessLabel, canAccess, requiredPlan, type Access } from "@/lib/access";
import { buyAirtime, buyReplay, buyVoucher, changePassword, checkout, createAd, openTicket, requestWithdrawal, saveAddress, saveMessengers, savePayout, savePhoto, saveProfile, saveSettings, saveTestimony, toggleLesson, updateCart, upgradePlan } from "@/lib/actions";
import { dueNow, flashText, getPlans, requireUser } from "@/lib/data";
import { formatEet } from "@/lib/format";
import { prisma } from "@/lib/db";
import { money, perCredit } from "@/lib/utils";
import { Library, ProductView, Shop } from "@/views/public";

type Member = Awaited<ReturnType<typeof requireUser>>;
type T = Awaited<ReturnType<typeof getTranslations>>;

function q(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function statusLine(user: Member) {
  if (user.status === "PAID" && user.planCode === "BASIC") return "Basic Paid Member";
  if (user.status === "PAID" && user.planCode === "PRO") return "Pro Paid Member";
  if (user.status === "PAID" && user.planCode === "ELITE") return "Elite Paid Member";
  if (user.status === "PAID" && user.planCode === "VIP") return "VIP Paid Member";
  if (user.status === "PAID_PENDING") return "Paid-Pending";
  if (user.status === "EXPIRED") return "Expired";
  return "Free";
}

function activeLine(user: Member) {
  if (!user.activeUntil || user.status !== "PAID" || !user.planCode) return "";
  const name = user.planCode === "BASIC" ? "Basic" : user.planCode === "PRO" ? "Pro" : user.planCode === "ELITE" ? "Elite" : "VIP";
  return `Active ${name} Representative until ${formatEet(user.activeUntil)}`;
}

function Gate({ user, access, t, children }: { user: Member; access: Access; t: T; children: React.ReactNode }) {
  if (canAccess(user.planCode, access)) return children;
  const plan = requiredPlan(access);
  return <LockNotice label={`${t("locked")} · ${accessLabel(access)}`} detail={t("videoHidden")} href={`/app/upgrade?plan=${plan}`} action={t("upgrade")} close={t("close")} />;
}

function returnPath(locale: string, root: "app" | "admin", slug: string[] | undefined, search: Record<string, string | string[] | undefined>) {
  const path = `/${locale}/${root}${slug?.length ? `/${slug.join("/")}` : ""}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (key === "m" || typeof value !== "string") continue;
    params.set(key, value);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export async function renderMember(locale: string, slug: string[] | undefined, search: Record<string, string | string[] | undefined>) {
  const user = await requireUser(locale, returnPath(locale, "app", slug, search));
  const t = await getTranslations("chrome");
  const body = await memberBody(locale, slug ?? [], search, user, t);
  return <MemberChrome firstName={user.firstName || user.username} admin={user.role === "ADMIN"}>{body}</MemberChrome>;
}

async function memberBody(locale: string, slug: string[], search: Record<string, string | string[] | undefined>, user: Member, t: T) {
  const path = slug.join("/");
  const key = flashText(q(search.m));
  const flash = key ? <Notice>{t(key)}</Notice> : null;
  if (!path) return <Dashboard user={user} t={t} />;
  if (path === "account") return <Account user={user} locale={locale} t={t} flash={flash} />;
  if (path === "wallet") return <WalletHome t={t} />;
  if (path === "wallet/upgrade" || path === "upgrade") return <Upgrade user={user} locale={locale} t={t} plan={q(search.plan)} flash={flash} />;
  if (path === "wallet/vouchers") return <Vouchers locale={locale} t={t} flash={flash} />;
  if (path === "wallet/mine") return <MyVouchers user={user} t={t} flash={flash} />;
  if (path === "wallet/payments") return <Payments user={user} t={t} />;
  if (path === "wallet/earnings") return <Earnings user={user} t={t} bucket={q(search.bucket)} />;
  if (path === "wallet/withdraw") return <Withdraw user={user} locale={locale} t={t} flash={flash} />;
  if (path === "wallet/account") return <Payout user={user} locale={locale} t={t} flash={flash} />;
  if (path === "wallet/payouts") return <Payouts user={user} t={t} status={q(search.status)} flash={flash} />;
  if (path === "leads") return <LeadsHome t={t} />;
  if (path === "leads/global") return <GlobalLeads user={user} t={t} query={q(search.q)} legend={q(search.legend)} />;
  if (path === "leads/team") return <TeamLeads user={user} t={t} level={q(search.level)} />;
  if (path === "broadcast") return <BroadcastHome t={t} />;
  if (path === "broadcast/emails") return <Emails user={user} t={t} />;
  if (path === "broadcast/senders") return <Senders t={t} />;
  if (path === "broadcast/hygiene") return <Hygiene t={t} />;
  if (path === "broadcast/chats") return <Chats t={t} />;
  if (path === "broadcast/bridge") return <Bridge t={t} />;
  if (path === "inviting") return <InvitingHome t={t} />;
  if (path === "inviting/scripts") return <Scripts t={t} />;
  if (path === "inviting/sales") return <Sales t={t} />;
  if (path === "inviting/closing") return <Closing t={t} />;
  if (path === "inviting/links") return <Links user={user} t={t} />;
  if (path === "inviting/banners" || path === "inviting/downloads") return <Banners t={t} title={path.endsWith("banners") ? "HTML Banners" : "Downloadable Banners"} />;
  if (path === "traffic") return <Traffic user={user} t={t} />;
  if (path.startsWith("learn/")) return <Learn user={user} locale={locale} t={t} parts={slug.slice(1)} flash={flash} />;
  if (path === "coaching") return <Coaching user={user} locale={locale} t={t} flash={flash} />;
  if (path === "trainings") return <Trainings user={user} t={t} />;
  if (path === "tools") return <ToolsHome t={t} />;
  if (path.startsWith("tools/")) return <Tool user={user} t={t} id={slug[1] ?? ""} />;
  if (path === "software/wizard") return <Software user={user} t={t} kind="wizard" />;
  if (path === "software/cast") return <CastHome user={user} t={t} />;
  if (path === "software/whatsapp") return <Software user={user} t={t} kind="whatsapp" />;
  if (path === "software/telegram") return <Software user={user} t={t} kind="telegram" />;
  if (path === "software/leads") return <Software user={user} t={t} kind="leads" />;
  if (path === "shop") return <Shop t={t} shopLabel="eShop" homeLabel="Dashboard" kind={q(search.kind)} member locale={locale} />;
  if (path.startsWith("shop/") && slug[1] && slug[1] !== "cart" && slug[1] !== "history") return <ProductView id={slug[1]} t={t} shopLabel="eShop" member locale={locale} />;
  if (path === "shop/cart") return <Cart user={user} locale={locale} t={t} flash={flash} />;
  if (path === "shop/history") return <Orders user={user} t={t} flash={flash} />;
  if (path === "ads") return <AdsHome t={t} />;
  if (path === "ads/text" || path === "ads/banner") return <AdForm user={user} locale={locale} t={t} kind={path.endsWith("text") ? "text" : "banner"} flash={flash} />;
  if (path === "ads/buy") return <Airtime locale={locale} t={t} flash={flash} />;
  if (path === "ads/history") return <AirtimeHistory user={user} t={t} />;
  if (path === "team") return <TeamHome t={t} />;
  if (path === "team/sponsor") return <Sponsor t={t} />;
  if (path === "team/free" || path === "team/paid") return <Referrals user={user} t={t} paid={path.endsWith("paid")} />;
  if (path === "team/powerline" || path === "team/passup" || path === "team/unilevel") return <Tree user={user} t={t} mode={path.split("/")[1] as "powerline" | "passup" | "unilevel"} />;
  if (path === "support") return <SupportHome t={t} />;
  if (path === "support/new") return <NewTicket locale={locale} t={t} flash={flash} />;
  if (path === "support/open" || path === "support/closed") return <Tickets user={user} t={t} closed={path.endsWith("closed")} flash={flash} />;
  if (path.startsWith("support/ticket/")) return <TicketView user={user} t={t} id={slug[2] ?? ""} />;
  if (path === "support/faq") return <Library locale={locale} kind="faq" query={q(search.q)} />;
  if (path === "support/news") return <Library locale={locale} kind="news" query="" />;
  if (path === "support/articles") return <Library locale={locale} kind="articles" query="" />;
  if (path === "support/calendar") return <Library locale={locale} kind="calendar" query="" />;
  return <PageHead title={t("missing")} crumbs={[{ href: "/app", label: "Dashboard" }, { label: t("missing") }]} />;
}

async function Dashboard({ user, t }: { user: Member; t: T }) {
  const directs = await prisma.user.count({ where: { sponsorUsername: user.username } });
  const spark = (seed: number) => Array.from({ length: 8 }, (_, i) => Math.max(1, ((seed * (i + 3)) % 17) + i * 2));
  const tiles = [
    ["Direct Referrals", String(directs), spark(directs + 3), "violet" as const],
    ["Account Balance", money(user.balanceCents), spark(user.balanceCents || 11), "orange" as const],
    ["Total Savings", money(user.savingsCents), spark(user.savingsCents || 7), "good" as const],
    ["Shopping Balance", money(user.shoppingBalanceCents), spark(user.shoppingBalanceCents || 13), "violet" as const],
    ["Pending Withdrawal", money(user.pendingWithdrawalCents), spark(user.pendingWithdrawalCents || 5), "orange" as const],
    ["Total Withdraws", money(user.totalWithdrawnCents), spark(user.totalWithdrawnCents || 19), "good" as const],
  ];
  return (
    <div className="grid gap-4">
      <PageHead title="Dashboard" intro={`${t("welcome")}, ${user.firstName}`} crumbs={[{ label: "Dashboard" }]} />
      <section className="card grid gap-2 p-5">
        <h2 className="display text-3xl">{statusLine(user)}</h2>
        <p>{activeLine(user)}</p>
        <p className="text-sm text-muted">{t("activeHelp")}</p>
        <Countdown target={user.activeUntil?.toISOString() ?? ACTIVE_UNTIL} stamp={user.activeUntil ? formatEet(user.activeUntil) : "17/11/2026 06:29:40"} />
        <Link className="btn btn-primary w-fit" href="/app/upgrade" prefetch>Upgrade Higher</Link>
      </section>
      <Notice>NEXT WAVE Positioning: {POSITIONING.paidPending} Paid-Pending Members, {POSITIONING.freeMembers} Free Members. {t("snapshot")}.</Notice>
      <div className="grid gap-3 md:grid-cols-2">
        <CopyField label="YOUR INVITING LINK" value={`https://vateplan.com/ref/${user.username}`} />
        <CopyField label="YOUR ESHOP LINK" value={`https://vatelife.com/shop/${user.username}`} />
      </div>
      <div className="flex flex-wrap gap-3">
        <a className="underline" href="https://t.me/VateLife">Join Our Telegram Channel</a>
        <a className="underline" href={NOTIFY_WHATSAPP}>Receive WhatsApp Free Notifications</a>
      </div>
      <article className="card p-5">
        <h2 className="display text-2xl">Your Daily LIVE Meeting</h2>
        <p>Multi-Language Meetings</p>
        <p>{POSITIONING.dailyCall}</p>
        <a className="underline" href={POSITIONING.meet}>{POSITIONING.meet}</a>
      </article>
      <Grid>
        {tiles.map(([label, value, points, tone]) => (
          <KpiTile
            key={label as string}
            label={label as string}
            value={<AnimatedCounter value={String(value)} />}
            points={points as number[]}
            tone={tone as "violet" | "orange" | "good"}
          />
        ))}
        <CardLink href="/plan" title="Compensation Plan" seed="compensation" action={t("open")} />
      </Grid>
      <CardLink href="/app/coaching" title="Live Coaching Replays – Get Access" seed="coaching" action={t("open")} note={t("downloadMissing")} />
      <a className="underline" href={PLAY_STORE}>{PLAY_STORE}</a>
      <nav className="flex flex-wrap gap-3">{SOCIAL.map((item) => <a key={item.href} className="underline" href={item.href}>{item.label}</a>)}</nav>
    </div>
  );
}

function Account({ user, locale, t, flash }: { user: Member; locale: string; t: T; flash: React.ReactNode }) {
  const messenger = user.messengers;
  const notes = user.notifications;
  return (
    <div className="grid gap-4">
      <PageHead title="My Account" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "My Account" }]} />
      {flash}
      {user.avatarUpdatedAt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/avatar?ts=${user.avatarUpdatedAt.getTime()}`} alt="" width={90} height={90} />
      ) : null}
      <form action={saveProfile} className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">Personal Information</h2>
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("firstName")}</span><input name="firstName" defaultValue={user.firstName} required /></label>
        <label className="field"><span>{t("lastName")}</span><input name="lastName" defaultValue={user.lastName} required /></label>
        <label className="field"><span>{t("email")}</span><input name="email" type="email" defaultValue={user.email} required /></label>
        <label className="field"><span>{t("mobile")}</span><input name="phone" defaultValue={user.phone ?? ""} /></label>
        <label className="field"><span>{t("country")}</span><input name="country" defaultValue={user.country ?? ""} /></label>
        <p className="text-sm text-muted">{t("countriesUnset")}</p>
        <label className="field"><span>{t("languageField")}</span>
          <select name="language" defaultValue={user.language}><option value="en">English</option><option value="el">Ελληνικά</option><option value="nl">Nederlands</option></select>
        </label>
        <p className="text-sm">{t("username")}: {user.username}</p>
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
      <form action={changePassword} className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">Change password</h2>
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("oldPassword")}</span><input name="old" type="password" autoComplete="current-password" required /></label>
        <label className="field"><span>{t("newPassword")}</span><input name="next" type="password" autoComplete="new-password" required /></label>
        <label className="field"><span>{t("confirm")}</span><input name="confirm" type="password" autoComplete="new-password" required /></label>
        <p>{t("passwordRule")} {t("showPassword")}</p>
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
      <form action={savePhoto} className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">Profile Photo</h2>
        <HiddenLocale locale={locale} />
        <p>{t("photoRule")}</p>
        <input name="photo" type="file" accept="image/jpeg,image/png,image/gif" required />
        <button className="btn btn-primary w-fit" type="submit">{t("upload")}</button>
      </form>
      <form action={saveMessengers} className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">Instant Messenger</h2>
        <HiddenLocale locale={locale} />
        {MESSENGERS.map((label) => {
          const name = label === "Google Hangouts" ? "hangouts" : label === "Facebook Messenger" ? "messenger" : label === "KakaoTalk" ? "kakaotalk" : label.toLowerCase();
          const value = messenger?.[name as keyof NonNullable<typeof messenger>] ?? "";
          return <label key={label} className="field"><span>{label}</span><input name={name} defaultValue={typeof value === "string" ? value : ""} /></label>;
        })}
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
      <form action={saveSettings} className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">My Settings</h2>
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("auto")}</span>
          <select name="autoRenew" defaultValue={user.autoRenew ? "yes" : "no"}><option value="yes">{t("yes")}</option><option value="no">{t("no")}</option></select>
        </label>
        <fieldset className="grid gap-2"><legend>{t("notifications")}</legend>
          {NOTIFICATION_KEYS.map(([key, label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" name={key} defaultChecked={notes ? notes[key] : true} /><span>{label}</span></label>)}
        </fieldset>
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
      <form action={saveTestimony} className="card grid gap-3 p-5" autoComplete="off">
        <h2 className="serif text-2xl">My Testimonial</h2>
        <p>{t("currentTestimony")}: {user.testimony ? 1 : 0}</p>
        <p>{t("emptyTestimony")}</p>
        <p className="text-sm text-muted">{t("quickMissing")}</p>
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("subject")}</span><input name="subject" defaultValue={user.testimony?.subject ?? ""} autoComplete="off" /></label>
        <label className="field"><span>{t("body")}</span><textarea name="body" defaultValue={user.testimony?.body ?? ""} autoComplete="off" /></label>
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
      <section className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">Two-factor authentication</h2>
        <TotpPanel enabled={user.totpEnabled} />
      </section>
    </div>
  );
}

function WalletHome({ t }: { t: T }) {
  const cards = [["Upgrade / Renew", "/app/wallet/upgrade"], ["Buy Vouchers", "/app/wallet/vouchers"], ["My Vouchers", "/app/wallet/mine"], ["Withdraw funds", "/app/wallet/withdraw"], ["Withdrawal Details", "/app/wallet/account"], ["Earnings History", "/app/wallet/earnings"], ["Payments History", "/app/wallet/payments"], ["Withdrawals History", "/app/wallet/payouts"]];
  return <section className="grid gap-4"><PageHead title="My Wallet" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "My Wallet" }]} /><Grid>{cards.map(([title, href]) => <CardLink key={href} href={href} title={title} seed={href} action={t("open")} />)}</Grid></section>;
}

async function Upgrade({ user, locale, t, plan, flash }: { user: Member; locale: string; t: T; plan: string; flash: React.ReactNode }) {
  const plans = await getPlans();
  const selected = plans.find((item) => item.code === plan) ?? plans[0];
  return (
    <section className="grid gap-4">
      <PageHead title="Upgrade / Renew" intro={selected ? `${t("planKept")} ${selected.name}` : t("planMissing")} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Upgrade / Renew" }]} />
      {flash}
      <p>{t("cryptoOnly")} {t("noIncome")}</p>
      <div className="flex flex-wrap gap-2">{plans.map((item) => <Link key={item.code} className={item.code === selected?.code ? "btn btn-primary" : "btn btn-ghost"} href={`/app/upgrade?plan=${item.code}`}>{item.name}</Link>)}</div>
      {selected ? (
        <form action={upgradePlan} className="card grid gap-3 p-5">
          <HiddenLocale locale={locale} />
          <input type="hidden" name="plan" value={selected.code} />
          <p>{selected.interval === "year" ? `${money(selected.recurringCents)} ${t("annually")}` : `${money(selected.enrollmentCents)} ${t("oneTime")} + ${money(selected.recurringCents)} ${t("monthly")}`}</p>
          <p>{t("amount")}: {money(dueNow(selected))}</p>
          <p>{t("balance")}: {money(user.balanceCents)}</p>
          <label className="field"><span>{t("method")}</span><select name="method" defaultValue="balance"><option value="balance">Account Balance</option><option value="crypto">Pay with Crypto</option></select></label>
          <button className="btn btn-primary w-fit" type="submit">{t("payNow")}</button>
        </form>
      ) : null}
    </section>
  );
}

async function Vouchers({ locale, t, flash }: { locale: string; t: T; flash: React.ReactNode }) {
  const plans = await getPlans();
  return (
    <section className="grid gap-4">
      <PageHead title="Buy Vouchers" intro="Buy a membership gift voucher and give it to a free member to upgrade." crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Buy Vouchers" }]} />
      {flash}
      <Grid>
        {plans.map((plan) => (
          <form key={plan.code} action={buyVoucher} className="card grid gap-3 p-5">
            <h2 className="serif text-2xl">{plan.name}</h2>
            <p>{money(plan.voucherCents)}</p>
            <HiddenLocale locale={locale} />
            <input type="hidden" name="plan" value={plan.code} />
            <select name="method" defaultValue="balance"><option value="balance">Account Balance</option><option value="crypto">Pay with Crypto</option></select>
            <button className="btn btn-primary" type="submit">{t("buy")}</button>
          </form>
        ))}
      </Grid>
    </section>
  );
}

async function MyVouchers({ user, t, flash }: { user: Member; t: T; flash: React.ReactNode }) {
  const rows = await prisma.voucher.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="My Vouchers" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "My Vouchers" }]} />
      {flash}
      <p>{t("copyCode")}</p>
      <DataTable columns={["Voucher code", "Plan", "Ordered", "Expired", "Used by", "Date used"]} rows={rows.map((row) => [row.code, row.planCode, formatEet(row.createdAt), row.usedAt ? t("yes") : t("no"), row.usedBy ?? "", row.usedAt ? formatEet(row.usedAt) : ""])} empty={t("emptyList")} />
    </section>
  );
}

async function Payments({ user, t }: { user: Member; t: T }) {
  const rows = await prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const paid = rows.filter((row) => row.status === "PAID").reduce((sum, row) => sum + row.amountCents, 0);
  return (
    <section className="grid gap-4">
      <PageHead title="Payments History" intro={`${t("total")}: ${rows.length} ${t("amount")}: ${money(paid)}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Payments History" }]} />
      <DataTable columns={["Date", "Amount", "Method", "Description", "Status"]} rows={rows.map((row) => [formatEet(row.createdAt), money(row.amountCents), row.method === "CRYPTO" ? "Pay with Crypto" : "Account Balance", row.description.replace(/^(PLAN:\w+|REPLAY|ADS:\S+|VOUCHER:\w+|ORDER:\S+)\s?/, ""), row.status])} empty={t("emptyList")} />
    </section>
  );
}

async function Earnings({ user, t, bucket }: { user: Member; t: T; bucket: string }) {
  const rows = await prisma.earning.findMany({ where: { userId: user.id, ...(bucket ? { bucket } : {}) }, orderBy: { createdAt: "desc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="Earnings History" intro={t("noIncome")} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Earnings History" }]} />
      <div className="flex flex-wrap gap-2">{["", "General", "Pool", "Ranks", "eShop", "Powerline", "Team"].map((item) => <Link key={item || "all"} className="btn btn-ghost" href={item ? `/app/wallet/earnings?bucket=${item}` : "/app/wallet/earnings"}>{item || t("all")}</Link>)}</div>
      <DataTable columns={["Date", "Amount", "Info", "Bucket"]} rows={rows.map((row) => [formatEet(row.createdAt), money(row.amountCents), row.info, row.bucket])} empty={t("emptyList")} />
    </section>
  );
}

function Withdraw({ user, locale, t, flash }: { user: Member; locale: string; t: T; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Withdraw funds" intro={`${t("fee")} ${money(WITHDRAW_FEE_CENTS)}. ${t("dailyLimit")}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Withdraw funds" }]} />
      {flash}
      <p>{t("stepsMissing")}</p>
      {user.payout ? (
        <form action={requestWithdrawal} className="card grid gap-3 p-5">
          <HiddenLocale locale={locale} />
          <p>{t("balance")}: {money(user.balanceCents)}</p>
          <label className="field"><span>{t("amount")}</span><input name="amount" inputMode="decimal" required /></label>
          <WithdrawCode />
          <label className="field"><span>{t("enterCode")}</span><input name="code" inputMode="numeric" autoComplete="off" required /></label>
          <button className="btn btn-primary w-fit" type="submit">{t("apply")}</button>
        </form>
      ) : <Notice>{t("withdrawBlocked")}</Notice>}
    </section>
  );
}

function Payout({ user, locale, t, flash }: { user: Member; locale: string; t: T; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Withdrawal Details" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Withdrawal Details" }]} />
      {flash}
      <form action={savePayout} className="card grid gap-3 p-5">
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("labelField")}</span><input name="label" defaultValue={user.payout?.label ?? ""} required /></label>
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
    </section>
  );
}

async function Payouts({ user, t, status, flash }: { user: Member; t: T; status: string; flash: React.ReactNode }) {
  const where = status === "PAID" || status === "PENDING" || status === "REJECTED" ? { userId: user.id, status: status as "PAID" | "PENDING" | "REJECTED" } : { userId: user.id };
  const rows = await prisma.withdrawal.findMany({ where, orderBy: { createdAt: "desc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="Withdrawals History" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/wallet", label: "My Wallet" }, { label: "Withdrawals History" }]} />
      {flash}
      <div className="flex gap-2">{["", "PENDING", "PAID", "REJECTED"].map((item) => <Link key={item || "all"} className="btn btn-ghost" href={item ? `/app/wallet/payouts?status=${item}` : "/app/wallet/payouts"}>{item || t("all")}</Link>)}</div>
      <DataTable columns={["Date", "Amount", "Status"]} rows={rows.map((row) => [formatEet(row.createdAt), money(row.amountCents), row.status])} empty={t("emptyList")} />
    </section>
  );
}

function LeadsHome({ t }: { t: T }) {
  return <section className="grid gap-4"><PageHead title="Leads" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Leads" }]} /><Grid><CardLink href="/app/leads/global" title="Global Leads" seed="global-leads" action={t("open")} /><CardLink href="/app/leads/team" title="Team Leads" seed="team-leads" action={t("open")} /></Grid></section>;
}

function GlobalLeads({ user, t, query, legend }: { user: Member; t: T; query: string; legend: string }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Global Leads" intro={`${t("directory")}: ${GLOBAL_LEAD_TOTAL}. ${t("rowsRedacted")}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/leads", label: "Leads" }, { label: "Global Leads" }]} />
      <Gate user={user} access="open" t={t}>
        <p>{t("allowance")}: {user.planCode === "VIP" ? "2,000" : user.planCode === "ELITE" ? "800" : user.planCode === "PRO" ? "400" : "200"}</p>
        <p>{t("pageSize")} {t("searchAdded")}</p>
        <form className="flex flex-wrap gap-2">
          <input name="q" defaultValue={query} aria-label={t("search")} />
          <select name="legend" defaultValue={legend} aria-label={t("filter")}>{["", ...LEAD_LEGEND].map((item) => <option key={item || "all"} value={item}>{item || t("all")}</option>)}</select>
          <button className="btn btn-primary" type="submit">{t("search")}</button>
          <a className="btn btn-ghost" href="/api/leads-export">{t("export")}</a>
        </form>
        <p>{t("exportNote")}</p>
        <ul className="flex flex-wrap gap-2">{LEAD_LEGEND.map((item) => <li key={item} className="rounded-full border border-line px-3 py-1">{item}</li>)}</ul>
        <DataTable columns={["#", "First Name", "Email", "Country"]} rows={[]} empty={query || legend ? t("noMatch") : t("rowsRedacted")} />
        <p>Total: {GLOBAL_LEAD_TOTAL}</p>
      </Gate>
    </section>
  );
}

async function TeamLeads({ user, t, level }: { user: Member; t: T; level: string }) {
  const plan = await prisma.plan.findUnique({ where: { code: user.planCode ?? "BASIC" } });
  const depth = plan?.teamLeadLevels ?? 0;
  return (
    <section className="grid gap-4">
      <PageHead title="Team Leads" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/leads", label: "Leads" }, { label: "Team Leads" }]} />
      <Gate user={user} access="open" t={t}>
        <form className="flex gap-2">
          <label className="field"><span>{t("level")}</span>
            <select name="level" defaultValue={level || "1"}>{Array.from({ length: Math.max(depth, 1) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select>
          </label>
          <button className="btn btn-primary self-end" type="submit">{t("filter")}</button>
        </form>
        <DataTable columns={["#", "First Name", "Email", "Country"]} rows={[]} empty={t("emptyList")} />
      </Gate>
    </section>
  );
}

function BroadcastHome({ t }: { t: T }) {
  const cards = [["Email Autoresponder Sequence", "/app/broadcast/emails"], ["Free Email Senders", "/app/broadcast/senders"], ["List Hygiene & Deliverability Kit", "/app/broadcast/hygiene"], ["Chat Scripts", "/app/broadcast/chats"], ["Bridge Tactics", "/app/broadcast/bridge"]];
  return <section className="grid gap-4"><PageHead title="Emails/Chats Broadcast" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Emails/Chats Broadcast" }]} /><Grid>{cards.map(([title, href]) => <CardLink key={href} href={href} title={title} seed={href} action={t("open")} />)}</Grid></section>;
}

function Emails({ user, t }: { user: Member; t: T }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Email Autoresponder Sequence" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/broadcast", label: "Emails/Chats Broadcast" }, { label: "Email Autoresponder Sequence" }]} />
      <Gate user={user} access="open" t={t}>
      {EMAIL_SEQUENCES.map((title) => (
        <article key={title} className="card p-4">
          <h2 className="serif text-2xl">{title}</h2>
          <ol className="mt-2 grid gap-1">{[1, 2, 3, 4, 5].map((index) => <li key={index}>Email {index}. {t("empty")}</li>)}</ol>
        </article>
      ))}
      </Gate>
    </section>
  );
}

function Senders({ t }: { t: T }) {
  return <section className="grid gap-4"><PageHead title="Free Email Senders" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/broadcast", label: "Emails/Chats Broadcast" }, { label: "Free Email Senders" }]} /><Grid>{EMAIL_PROVIDERS.map((title) => <CardLink key={title} href="/app/broadcast/senders" title={title} seed={title} action={t("open")} note={t("empty")} />)}</Grid></section>;
}

function Hygiene({ t }: { t: T }) {
  return <section className="grid gap-4"><PageHead title="List Hygiene & Deliverability Kit" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/broadcast", label: "Emails/Chats Broadcast" }, { label: "List Hygiene & Deliverability Kit" }]} /><Grid>{VERIFIERS.map((title) => <article key={title} className="card p-4"><h2 className="serif text-2xl">{title}</h2><p>{t("empty")}</p></article>)}</Grid><p>Pre-Flight Checklist. {t("empty")}</p></section>;
}

function Chats({ t }: { t: T }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Chat Scripts" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/broadcast", label: "Emails/Chats Broadcast" }, { label: "Chat Scripts" }]} />
      <Grid>{CHAT_STRATEGIES.map((title, index) => <article key={title} className="card p-4"><h2 className="serif text-2xl">{index + 1}: {title}</h2><p>{t("empty")}</p></article>)}</Grid>
      <article className="card p-4"><h2 className="serif text-2xl">MASTERCLASS: Chat Etiquette & Anti-Spam Safety</h2><p>{t("empty")}</p></article>
      <Grid>
        <CardLink href="/app/software/whatsapp" title="WhatsApp Cast" seed="wa" action={t("open")} />
        <CardLink href="/app/software/telegram" title="Telegram Cast" seed="tg" action={t("open")} />
        <CardLink href="/app/broadcast/bridge" title="Bridge Tactics" seed="bridge" action={t("open")} />
      </Grid>
    </section>
  );
}

function Bridge({ t }: { t: T }) {
  return <section className="grid gap-4"><PageHead title="Bridge Tactics" intro={t("empty")} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/broadcast", label: "Emails/Chats Broadcast" }, { label: "Bridge Tactics" }]} /><Grid>{BRIDGE_STEPS.map((step) => <article key={step.step} className="card p-4"><p>{step.step}</p><h2 className="serif text-2xl">{step.title}</h2><p>{t("empty")}</p></article>)}</Grid><h2 className="serif text-2xl">The Mastery Mindset</h2><p>{t("empty")}</p></section>;
}

function InvitingHome({ t }: { t: T }) {
  const cards = [["Inviting Scripts", "/app/inviting/scripts"], ["Email Autoresponder Sequence", "/app/broadcast/emails"], ["Sales Scripts", "/app/inviting/sales"], ["Communication & Closing Scripts", "/app/inviting/closing"], ["Traffic Sources", "/app/traffic"], ["Your Inviting Links", "/app/inviting/links"], ["HTML Banners", "/app/inviting/banners"], ["Downloadable Banners", "/app/inviting/downloads"], ["Live Trainings", "/app/trainings"]];
  return <section className="grid gap-4"><PageHead title="Inviting Tools" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Inviting Tools" }]} /><Grid>{cards.map(([title, href]) => <CardLink key={title} href={href} title={title} seed={title} action={t("open")} />)}</Grid></section>;
}

function Scripts({ t }: { t: T }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Inviting Scripts" intro="The Master Invitation: Urgency & Posture" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: "Inviting Scripts" }]} />
      {INVITE_PHASES.map((phase) => (
        <article key={phase} className="card p-4">
          <h2 className="serif text-2xl">{phase}</h2>
          <ul className="mt-2">{INVITE_CHANNELS.map((channel) => <li key={channel}>{channel}. {t("empty")}</li>)}</ul>
        </article>
      ))}
      <h2 className="serif text-2xl">The Prospecting Golden Rules</h2>
      <p>{t("empty")}</p>
      <Link className="btn btn-primary w-fit" href="/app/inviting">I AM READY TO START INVITING</Link>
    </section>
  );
}

function Sales({ t }: { t: T }) {
  return <section className="grid gap-3"><PageHead title="Sales Scripts" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: "Sales Scripts" }]} />{Array.from({ length: 13 }, (_, index) => <article key={index} className="card p-4"><h2>Sales Script {index + 1}</h2><p>{t("empty")}</p></article>)}</section>;
}

function Closing({ t }: { t: T }) {
  return <section className="grid gap-3"><PageHead title="Communication & Closing Scripts" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: "Communication & Closing Scripts" }]} />{["Phase 1", "Phase 2", "Phase 3", "Phase 4", "The Closer's Final Checklist", "The Objection Shield", "THE ULTIMATE SORTER PIVOT"].map((title) => <article key={title} className="card p-4"><h2 className="serif text-2xl">{title}</h2><p>{t("empty")}</p></article>)}<Link className="underline" href="/app/learn/digital-marketing">Back to Digital Marketing</Link></section>;
}

function Links({ user, t }: { user: Member; t: T }) {
  return <section className="grid gap-4"><PageHead title="Your Inviting Links" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: "Your Inviting Links" }]} /><CopyField label="YOUR INVITING LINK" value={`https://vateplan.com/ref/${user.username}`} /><CopyField label="YOUR ESHOP LINK" value={`https://vatelife.com/shop/${user.username}`} /><p className="sr-only">{t("copy")}</p></section>;
}

function Banners({ t, title }: { t: T; title: string }) {
  return <section className="grid gap-4"><PageHead title={title} intro={t("empty")} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: title }]} /><Link className="btn btn-ghost w-fit" href="/app/inviting">{t("back")}</Link></section>;
}

function Traffic({ user, t }: { user: Member; t: T }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Traffic Sources" intro="Inbox Strategy" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: "Traffic Sources" }]} />
      <Gate user={user} access="open" t={t}>
        <Grid>{TRAFFIC.map((href) => <article key={href} className="card p-4"><h2 className="break-all text-lg">{href.replace(/^https?:\/\//, "")}</h2><a className="btn btn-primary mt-3" href={href}>{t("visit")}</a></article>)}</Grid>
        <p>Pro-Tip. {t("empty")}</p>
        <Link className="underline" href="/app/inviting">Back to Inviting Tools</Link>
      </Gate>
    </section>
  );
}

async function Learn({ user, locale, t, parts, flash }: { user: Member; locale: string; t: T; parts: string[]; flash: React.ReactNode }) {
  const academy = ACADEMIES.find((item) => item.id === parts[0]);
  if (!academy) return <PageHead title={t("missing")} crumbs={[{ href: "/app", label: "Dashboard" }, { label: t("missing") }]} />;
  if (!parts[1]) {
    const courses = await prisma.course.findMany({ where: { academy: academy.id }, orderBy: { sort: "asc" } });
    const groups: Array<[string, typeof courses]> = [
      ["", courses.filter((course) => course.access === "open")],
      ["EXCLUSIVE PRO COURSES", courses.filter((course) => course.access === "pro")],
      ["EXCLUSIVE ELITE APPS", courses.filter((course) => course.access === "elite")],
      ["EXCLUSIVE VIP APPS", courses.filter((course) => course.access === "vip")],
    ];
    return (
      <section className="grid gap-4">
        <PageHead title={academy.title} intro={academy.intro} crumbs={[{ href: "/app", label: "Dashboard" }, { label: academy.title }]} />
        {academy.headings.map((heading) => <h2 key={heading} className="serif text-2xl">{heading}</h2>)}
        {"videos" in academy ? academy.videos.map((video) => <article key={video.id} className="card p-4"><h2>{video.note}</h2><div className="mt-3"><YouTubeLite id={video.id} title={video.note} /></div></article>) : null}
        {groups.filter(([, rows]) => rows.length).map(([heading, rows]) => (
          <div key={heading || "open"} className="grid gap-3">
            {heading ? <h2 className="display text-2xl">{heading}</h2> : null}
            <Grid>{rows.map((course) => (
              <CardLink
                key={course.id}
                href={`/app/learn/${academy.id}/${course.id}`}
                title={course.title}
                seed={`${course.id} ${course.title} ${academy.title}`}
                action={t("open")}
                badge={course.access === "open" ? "Basic & above" : accessLabel(course.access as Access)}
                note={`${course.modules} ${t("modules")}`}
              />
            ))}</Grid>
          </div>
        ))}
        {academy.id === "digital-marketing" ? <Grid><CardLink href="/app/inviting/scripts" title="Inviting Scripts" seed="z1h" action={t("open")} /><CardLink href="/app/inviting/closing" title="Communication & Closing Scripts" seed="z1i" action={t("open")} /></Grid> : null}
      </section>
    );
  }
  const course = await prisma.course.findUnique({ where: { id: parts[1] }, include: { lessons: { orderBy: { position: "asc" }, include: { progress: { where: { userId: user.id } } } } } });
  if (!course || course.academy !== academy.id) return <PageHead title={t("missing")} crumbs={[{ href: `/app/learn/${academy.id}`, label: academy.title }, { label: t("missing") }]} />;
  const access = (course.access === "pro" || course.access === "elite" || course.access === "vip" ? course.access : "open") as Access;
  const done = course.lessons.filter((lesson) => lesson.progress.some((item) => item.completed)).length;
  return (
    <section className="grid gap-4">
      <PageHead title={course.title} intro={`${t("progress")}: ${done} ${t("of")} ${course.lessons.length}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: `/app/learn/${academy.id}`, label: academy.title }, { label: course.title }]} />
      <div className="flex items-center gap-3">
        <ProgressRing value={done} max={Math.max(course.lessons.length, 1)} label={`${t("progress")}: ${done} ${t("of")} ${course.lessons.length}`} id={`progress-${course.id}`} />
        <p className="text-sm text-muted">{t("progress")}: {done} {t("of")} {course.lessons.length}</p>
      </div>
      {flash}
      <Gate user={user} access={access} t={t}>
        {course.lessons.map((lesson) => (
          <article key={lesson.id} className="card grid gap-3 p-4">
            <h2 className="display text-2xl">{lesson.title}</h2>
            {lesson.videoId ? <YouTubeLite id={lesson.videoId} title={lesson.title} /> : <p>{t("noVideo")}</p>}
            <p>{lesson.note || t("empty")}</p>
            <form action={toggleLesson}>
              <HiddenLocale locale={locale} />
              <input type="hidden" name="lessonId" value={lesson.id} />
              <button className="btn btn-primary" type="submit">{lesson.progress.some((item) => item.completed) ? t("completed") : t("markComplete")}</button>
            </form>
          </article>
        ))}
      </Gate>
    </section>
  );
}

function Coaching({ user, locale, t, flash }: { user: Member; locale: string; t: T; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Live Coaching" intro={t("replayNote")} crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Live Coaching" }]} />
      {flash}
      <p>{POSITIONING.dailyCall}</p>
      <a className="underline" href={POSITIONING.meet}>{POSITIONING.meet}</a>
      <p>{user.replayUntil ? `${t("included")} ${formatEet(user.replayUntil)}` : t("notIncluded")}</p>
      <p>{t("downloadMissing")}</p>
      <form action={buyReplay} className="card grid gap-3 p-5">
        <HiddenLocale locale={locale} />
        <p>{money(REPLAY_CENTS)} / one-year access</p>
        <select name="method" defaultValue="balance"><option value="balance">Account Balance</option><option value="crypto">Pay with Crypto</option></select>
        <button className="btn btn-primary w-fit" type="submit">{t("payNow")}</button>
      </form>
    </section>
  );
}

function Trainings({ user, t }: { user: Member; t: T }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Live Trainings" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/inviting", label: "Inviting Tools" }, { label: "Live Trainings" }]} />
      <Gate user={user} access="open" t={t}>
        {TRAININGS.map((video, index) => (
          <article key={video.id} className="card p-4">
            <h2 className="serif text-2xl">Replay {index + 1}{video.note ? ` · ${video.note}` : ""}</h2>
            <div className="mt-3"><YouTubeLite id={video.id} title={`Replay ${index + 1}`} /></div>
          </article>
        ))}
      </Gate>
    </section>
  );
}

function ToolsHome({ t }: { t: T }) {
  return (
    <section className="grid gap-6">
      <PageHead title="Smart Tools" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Smart Tools" }]} />
      {TOOL_GROUPS.map((group) => (
        <div key={group.title} className="grid gap-3">
          <h2 className="serif text-2xl">{group.title}</h2>
          <Grid>{group.tools.map((tool) => <CardLink key={tool.id} href={`/app/tools/${tool.id}`} title={tool.title} seed={tool.id} action={t("open")} />)}</Grid>
        </div>
      ))}
    </section>
  );
}

function Tool({ user, t, id }: { user: Member; t: T; id: string }) {
  const tool = TOOL_GROUPS.flatMap((group) => group.tools).find((item) => item.id === id);
  if (!tool) return <PageHead title={t("missing")} crumbs={[{ href: "/app/tools", label: "Smart Tools" }, { label: t("missing") }]} />;
  return (
    <section className="grid gap-4">
      <PageHead title={tool.title} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/tools", label: "Smart Tools" }, { label: tool.title }]} />
      <Gate user={user} access="open" t={t}>
        {tool.videos?.map((video) => <YouTubeLite key={video} id={video} title={tool.title} />)}
        {tool.href ? <a className="underline" href={tool.href}>{t("external")}</a> : null}
        <p>{t("empty")}</p>
      </Gate>
    </section>
  );
}

function CastHome({ user, t }: { user: Member; t: T }) {
  return (
    <section className="grid gap-4">
      <PageHead title="WhatsApp/Telegram Cast" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "WhatsApp/Telegram Cast" }]} />
      <Grid>
        <CardLink href="/app/software/whatsapp" title="WhatsApp Cast" seed="whatsapp" action={t("open")} badge={canAccess(user.planCode, "pro") ? t("included") : "PRO & above"} />
        <CardLink href="/app/software/telegram" title="Telegram Cast" seed="telegram" action={t("open")} badge={canAccess(user.planCode, "elite") ? t("included") : "ELITE & above"} />
        <CardLink href="/app/software/leads" title="Leads Catcher" seed="catcher" action={t("open")} badge={canAccess(user.planCode, "vip") ? t("included") : "VIP"} />
      </Grid>
      <p>{t("metaNote")}</p>
    </section>
  );
}

function Software({ user, t, kind }: { user: Member; t: T; kind: "wizard" | "whatsapp" | "telegram" | "leads" }) {
  const map: Record<typeof kind, [string, Access]> = {
    wizard: ["Marketing Wizard", "open"],
    whatsapp: ["WhatsApp Cast", "pro"],
    telegram: ["Telegram Cast", "elite"],
    leads: ["Leads Catcher", "vip"],
  };
  const [title, access] = map[kind];
  return (
    <section className="grid gap-4">
      <PageHead title={title} crumbs={[{ href: "/app", label: "Dashboard" }, ...(kind === "wizard" ? [] : [{ href: "/app/software/cast", label: "WhatsApp/Telegram Cast" }]), { label: title }]} />
      <Gate user={user} access={access} t={t}>
        {kind === "wizard" ? <a className="btn btn-primary w-fit" href={BOXOKO}>{t("wizard")}</a> : <p>{t("softwareNote")}</p>}
        <p>{t("noCredentials")} {t("downloadMissing")}</p>
        {kind !== "wizard" ? <p>{t("metaNote")}</p> : null}
      </Gate>
    </section>
  );
}

async function Cart({ user, locale, t, flash }: { user: Member; locale: string; t: T; flash: React.ReactNode }) {
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  const address = await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { id: "desc" } });
  const total = items.reduce((sum, item) => sum + item.product.memberCents * item.qty, 0);
  return (
    <section className="grid gap-4">
      <PageHead title={t("cart")} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/shop", label: "eShop" }, { label: t("cart") }]} />
      {flash}
      {items.length ? items.map((item) => (
        <form key={item.id} action={updateCart} className="card flex items-center justify-between gap-3 p-4">
          <HiddenLocale locale={locale} />
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="op" value="remove" />
          <p>{item.product.title} × {item.qty} · {money(item.product.memberCents * item.qty)}</p>
          <button className="btn btn-ghost" type="submit">{t("remove")}</button>
        </form>
      )) : <Notice>{t("emptyCart")}</Notice>}
      <p>{t("total")}: {money(total)}</p>
      <form action={saveAddress} className="card grid gap-3 p-5">
        <h2 className="serif text-2xl">{t("shipping")}</h2>
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("receiver")}</span><input name="receiver" defaultValue={address?.receiver ?? ""} /></label>
        <label className="field"><span>{t("phone")}</span><input name="phone" defaultValue={address?.phone ?? ""} /></label>
        <label className="field"><span>{t("line")}</span><input name="line" defaultValue={address?.line ?? ""} required /></label>
        <label className="field"><span>{t("city")}</span><input name="city" defaultValue={address?.city ?? ""} required /></label>
        <label className="field"><span>{t("state")}</span><input name="state" defaultValue={address?.state ?? ""} /></label>
        <label className="field"><span>{t("country")}</span><input name="country" defaultValue={address?.country ?? ""} required /></label>
        <label className="field"><span>{t("postal")}</span><input name="postal" defaultValue={address?.postal ?? ""} /></label>
        <button className="btn btn-ghost w-fit" type="submit">{t("place")}</button>
      </form>
      <form action={checkout} className="grid gap-3">
        <HiddenLocale locale={locale} />
        <select name="method" defaultValue="balance"><option value="balance">Account Balance</option><option value="crypto">Pay with Crypto</option></select>
        <button className="btn btn-primary w-fit" type="submit" disabled={!items.length}>{t("checkout")}</button>
      </form>
    </section>
  );
}

async function Orders({ user, t, flash }: { user: Member; t: T; flash: React.ReactNode }) {
  const rows = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="Shopping History" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/shop", label: "eShop" }, { label: "Shopping History" }]} />
      {flash}
      <DataTable columns={["Date", "Order No.", "Items", "Member total", "Order status"]} rows={rows.map((row) => [formatEet(row.createdAt), row.number, row.items.map((item) => item.title).join(", "), money(row.memberCents), row.status])} empty={t("emptyList")} />
    </section>
  );
}

function AdsHome({ t }: { t: T }) {
  const cards = [["Text Ads", "/app/ads/text"], ["Banner Ads", "/app/ads/banner"], ["Buy Ad Airtime", "/app/ads/buy"], ["Ad Airtime History", "/app/ads/history"]];
  return <section className="grid gap-4"><PageHead title="Advertising Center" intro="Advertising Center: Amplify Your Reach" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Advertising Center" }]} /><Grid>{cards.map(([title, href]) => <CardLink key={href} href={href} title={title} seed={href} action={t("open")} />)}</Grid></section>;
}

async function AdForm({ user, locale, t, kind, flash }: { user: Member; locale: string; t: T; kind: "text" | "banner"; flash: React.ReactNode }) {
  const rows = await prisma.ad.findMany({ where: { userId: user.id, kind }, orderBy: { createdAt: "desc" } });
  const title = kind === "text" ? "Text Ads" : "Banner Ads";
  return (
    <section className="grid gap-4">
      <PageHead title={title} intro={`${kind === "text" ? "Cost: 1 Ad Credit per impression" : "Cost: 2 Ad Credit per impression"}. ${t("adHave")}: ${user.adCredits} Ad Credits`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/ads", label: "Advertising Center" }, { label: title }]} />
      {flash}
      {kind === "banner" ? <p>{t("proTip")}</p> : null}
      <form action={createAd} className="card grid gap-3 p-5">
        <HiddenLocale locale={locale} />
        <input type="hidden" name="kind" value={kind} />
        <label className="field"><span>Ad Credits</span><input name="credits" inputMode="numeric" required /></label>
        <label className="field"><span>Ad name</span><input name="name" required /></label>
        {kind === "text" ? <label className="field"><span>{t("title")}</span><input name="title" /></label> : null}
        {kind === "text" ? <label className="field"><span>Line 1</span><input name="line1" /></label> : null}
        {kind === "text" ? <label className="field"><span>Line 2</span><input name="line2" /></label> : null}
        {kind === "banner" ? <label className="field"><span>Ad type</span><select name="size"><option>125 x 125</option><option>468 x 60</option><option>300 x 250</option></select></label> : null}
        {kind === "banner" ? <label className="field"><span>{t("upload")}</span><input name="image" type="file" accept="image/*" /></label> : null}
        <label className="field"><span>Destination URL</span><input name="url" type="url" required /></label>
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      </form>
      <DataTable columns={["#", "Ad name", "Url", "Clicks", "Impressions", "Total cost", "Status"]} rows={rows.map((row, index) => [String(index + 1), row.name, row.url, String(row.clicks), String(row.impressions), String(row.credits), row.status])} empty={t("emptyList")} />
    </section>
  );
}

function Airtime({ locale, t, flash }: { locale: string; t: T; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="Buy Ad Airtime" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/ads", label: "Advertising Center" }, { label: "Buy Ad Airtime" }]} />
      {flash}
      <Grid>
        {AD_PACKS.map((pack) => (
          <form key={pack.id} action={buyAirtime} className="card grid gap-2 p-4">
            <HiddenLocale locale={locale} />
            <input type="hidden" name="pack" value={pack.id} />
            <h2 className="serif text-2xl">{pack.name}</h2>
            <p>{pack.credits.toLocaleString("en-US")} = {money(pack.cents)}</p>
            <p>{perCredit(pack.credits, pack.cents)} {t("perCredit")}</p>
            <select name="method" defaultValue="balance"><option value="balance">Account Balance</option><option value="crypto">Pay with Crypto</option></select>
            <button className="btn btn-primary" type="submit">{t("buy")}</button>
          </form>
        ))}
      </Grid>
    </section>
  );
}

async function AirtimeHistory({ user, t }: { user: Member; t: T }) {
  const rows = await prisma.payment.findMany({ where: { userId: user.id, description: { startsWith: "ADS:" } }, orderBy: { createdAt: "desc" } });
  return <section className="grid gap-4"><PageHead title="Ad Airtime History" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/ads", label: "Advertising Center" }, { label: "Ad Airtime History" }]} /><DataTable columns={["#", "Date", "Order No.", "Cost ($)", "Product name", "Ad Credits", "Status"]} rows={rows.map((row, index) => [String(index + 1), formatEet(row.createdAt), row.id.slice(-6), money(row.amountCents), row.description.replace(/^ADS:\S+\s/, ""), "", row.status])} empty={t("emptyList")} /></section>;
}

function TeamHome({ t }: { t: T }) {
  const cards = [["My Sponsor", "/app/team/sponsor"], ["Free Referrals", "/app/team/free"], ["Paid Referrals", "/app/team/paid"], ["My Powerline", "/app/team/powerline"], ["Pass-up members", "/app/team/passup"], ["Unilevel tree", "/app/team/unilevel"]];
  return <section className="grid gap-4"><PageHead title="My Team" intro="My Team: Track Your Impact" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "My Team" }]} /><Grid>{cards.map(([title, href]) => <CardLink key={href} href={href} title={title} seed={href} action={t("open")} />)}</Grid></section>;
}

function Sponsor({ t }: { t: T }) {
  return (
    <section className="grid gap-3">
      <PageHead title="My Sponsor" crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/team", label: "My Team" }, { label: "My Sponsor" }]} />
      <p>Username : {SPONSOR.username}</p>
      <p>Name : {SPONSOR.name}</p>
      <p>Country : {SPONSOR.country}</p>
      <a className="btn btn-primary w-fit" href={SUPPORT_WHATSAPP}>{t("contactMe")}</a>
      <p>{t("opensWhatsapp")} {SUPPORT_WHATSAPP}</p>
    </section>
  );
}

async function Referrals({ user, t, paid }: { user: Member; t: T; paid: boolean }) {
  const rows = await prisma.user.findMany({
    where: { sponsorUsername: user.username, status: paid ? { in: ["PAID", "EXPIRED"] } : { in: ["FREE", "PAID_PENDING"] } },
    orderBy: { createdAt: "asc" },
  });
  const title = paid ? "Paid Referrals" : "Free Referrals";
  return (
    <section className="grid gap-4">
      <PageHead title={title} intro={`${t("total")}: ${rows.length}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/team", label: "My Team" }, { label: title }]} />
      <ul className="flex flex-wrap gap-2">{REFERRAL_LEGEND.map((item) => <li key={item} className="rounded-full border border-line px-3 py-1">{item}</li>)}</ul>
      <DataTable columns={paid ? ["#", "Status", "Username", "Name", "Phone", "Email", "Country", "Date joined", "Active date"] : ["#", "Status", "Username", "Name", "Phone", "Email", "Country", "Date joined"]} rows={rows.map((row, index) => {
        const base = [String(index + 1), row.status, row.username, `${row.firstName} ${row.lastName}`.trim(), row.phone ?? "", row.email, row.country ?? "", formatEet(row.createdAt)];
        return paid ? [...base, row.activeUntil ? formatEet(row.activeUntil) : ""] : base;
      })} empty={t("emptyList")} />
    </section>
  );
}

function Tree({ user, t, mode }: { user: Member; t: T; mode: "powerline" | "passup" | "unilevel" }) {
  const title = mode === "powerline" ? "My Powerline" : mode === "passup" ? "Pass-up members" : "Unilevel tree";
  const note = mode === "passup" ? `Infinity Bonus $1 (PASS-UP). ${t("noIncome")}` : "Downlines Level 1–14 → 0. Total Downlines: 0.";
  return (
    <section className="grid gap-4">
      <PageHead title={title} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/team", label: "My Team" }, { label: title }]} />
      <TeamTree you={`${user.firstName} (${user.username})`} sponsor={`${SPONSOR.name} (${SPONSOR.username})`} back="Back To The TOP" down="Level" total="Total Downlines" note={note} />
    </section>
  );
}

function SupportHome({ t }: { t: T }) {
  const cards = [["New Support Ticket", "/app/support/new"], ["My Open Tickets", "/app/support/open"], ["My Replied Tickets", "/app/support/closed"], ["FAQ", "/app/support/faq"], ["News", "/app/support/news"], ["Articles", "/app/support/articles"], ["Calendar", "/app/support/calendar"]];
  return <section className="grid gap-4"><PageHead title="Support" intro="VateLife Support Center" crumbs={[{ href: "/app", label: "Dashboard" }, { label: "Support" }]} /><p>{t("supportSla")}</p><Grid>{cards.map(([title, href]) => <CardLink key={href} href={href} title={title} seed={href} action={t("open")} />)}</Grid></section>;
}

function NewTicket({ locale, t, flash }: { locale: string; t: T; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="New Support Ticket" intro={t("supportSla")} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/support", label: "Support" }, { label: "New Support Ticket" }]} />
      {flash}
      <p className="text-sm text-muted">{t("deptNote")} {t("quickMissing")}</p>
      <form action={openTicket} className="card grid gap-3 p-5">
        <HiddenLocale locale={locale} />
        <label className="field"><span>{t("department")}</span><select name="department" defaultValue="Support"><option value="Support">Support</option><option value="Sales">Sales</option></select></label>
        <label className="field"><span>{t("subject")}</span><input name="subject" required /></label>
        <label className="field"><span>{t("message")}</span><textarea name="message" required /></label>
        <CaptchaFields label={t("captcha")} />
        <button className="btn btn-primary w-fit" type="submit">{t("send")}</button>
      </form>
    </section>
  );
}

async function Tickets({ user, t, closed, flash }: { user: Member; t: T; closed: boolean; flash: React.ReactNode }) {
  const rows = await prisma.ticket.findMany({ where: { userId: user.id, status: closed ? "CLOSED" : "OPEN" }, orderBy: { createdAt: "desc" } });
  const title = closed ? "My Replied Tickets" : "My Open Tickets";
  return (
    <section className="grid gap-4">
      <PageHead title={title} intro={`${t("total")}: ${rows.length}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/support", label: "Support" }, { label: title }]} />
      {flash}
      <DataTable columns={["#", "Date Posted", "Ticket #", "Department", "Subject"]} rows={rows.map((row, index) => [String(index + 1), formatEet(row.createdAt), row.number, row.department, row.subject])} empty={t("emptyList")} />
      <ul className="grid gap-2">{rows.map((row) => <li key={row.id}><Link className="underline" href={`/app/support/ticket/${row.id}`}>{row.number} {row.subject}</Link></li>)}</ul>
    </section>
  );
}

async function TicketView({ user, t, id }: { user: Member; t: T; id: string }) {
  const ticket = await prisma.ticket.findFirst({ where: { id, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!ticket) return <PageHead title={t("missing")} crumbs={[{ href: "/app/support", label: "Support" }, { label: t("missing") }]} />;
  return (
    <section className="grid gap-4">
      <PageHead title={ticket.subject} intro={`${ticket.number} · ${ticket.department} · ${ticket.status}`} crumbs={[{ href: "/app", label: "Dashboard" }, { href: "/app/support", label: "Support" }, { label: ticket.subject }]} />
      {ticket.messages.length ? ticket.messages.map((message) => <article key={message.id} className="card p-4"><p className="text-sm">{message.author === "staff" ? "Staff" : "Member"} · {formatEet(message.createdAt)}</p><p className="mt-2 whitespace-pre-wrap">{message.body}</p></article>) : <Notice>{t("staffMissing")}</Notice>}
      {ticket.status === "CLOSED" ? <Notice>{t("closedNoReply")}</Notice> : null}
    </section>
  );
}
