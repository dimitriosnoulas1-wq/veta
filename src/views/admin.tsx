import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CardLink, DataTable, Grid, HiddenLocale, Notice, PageHead } from "@/components/ui";
import { MemberChrome } from "@/components/shell";
import { addLesson, addLibrary, markPayment, replyTicket, saveCourse, savePlan, saveProduct, saveUser } from "@/lib/actions";
import { flashText, requireAdmin } from "@/lib/data";
import { maskLogin } from "@/lib/format";
import { prisma } from "@/lib/db";
import { money } from "@/lib/utils";

function q(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function renderAdmin(locale: string, slug: string[] | undefined, search: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (key === "m" || typeof value !== "string") continue;
    params.set(key, value);
  }
  const nextPath = `/${locale}/admin${slug?.length ? `/${slug.join("/")}` : ""}`;
  const query = params.toString();
  const user = await requireAdmin(locale, query ? `${nextPath}?${query}` : nextPath);
  const t = await getTranslations("chrome");
  const path = (slug ?? []).join("/");
  const key = flashText(q(search.m));
  const flash = key ? <Notice>{t(key)}</Notice> : null;
  let body: React.ReactNode = <Overview locale={locale} t={t} />;
  if (path === "courses") body = <Courses locale={locale} t={t} flash={flash} />;
  else if (path === "products") body = <Products locale={locale} t={t} flash={flash} />;
  else if (path === "plans") body = <Plans locale={locale} t={t} flash={flash} />;
  else if (path === "users") body = <Users locale={locale} t={t} flash={flash} />;
  else if (path === "tickets") body = <Tickets locale={locale} t={t} flash={flash} />;
  else if (path === "messages") body = <Messages t={t} />;
  else if (path === "library") body = <LibraryAdmin locale={locale} t={t} flash={flash} />;
  else if (path) body = <PageHead title={t("missing")} crumbs={[{ href: "/admin", label: "Admin" }, { label: t("missing") }]} />;
  return <MemberChrome firstName={user.firstName || "Admin"} admin>{body}</MemberChrome>;
}

function Overview({ locale, t }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>> }) {
  const cards = [["Courses", "/admin/courses"], ["Products", "/admin/products"], ["Plans", "/admin/plans"], ["Users", "/admin/users"], ["Support tickets", "/admin/tickets"], ["Contact messages", "/admin/messages"], ["FAQ, News, Articles", "/admin/library"]];
  return (
    <section className="grid gap-4">
      <PageHead title="Admin" intro={t("usersHint")} crumbs={[{ label: "Admin" }]} />
      <Pending locale={locale} t={t} />
      <Grid>{cards.map(([title, href]) => <CardLink key={href} href={href} title={title} seed={href} action={t("open")} />)}</Grid>
    </section>
  );
}

async function Pending({ locale, t }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>> }) {
  const rows = await prisma.payment.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 20 });
  if (!rows.length) return <Notice>{t("noPending")}</Notice>;
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <form key={row.id} action={markPayment} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <HiddenLocale locale={locale} />
          <input type="hidden" name="id" value={row.id} />
          <p>{money(row.amountCents)} · {row.description}</p>
          <button className="btn btn-primary" type="submit">{t("setPaid")}</button>
        </form>
      ))}
    </div>
  );
}

async function Courses({ locale, t, flash }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  const courses = await prisma.course.findMany({ orderBy: [{ academy: "asc" }, { sort: "asc" }], include: { lessons: true } });
  return (
    <section className="grid gap-4">
      <PageHead title="Courses" crumbs={[{ href: "/admin", label: "Admin" }, { label: "Courses" }]} />
      {flash}
      {courses.map((course) => (
        <form key={course.id} action={saveCourse} className="card grid gap-2 p-4">
          <HiddenLocale locale={locale} />
          <input type="hidden" name="id" value={course.id} />
          <p className="text-sm text-muted">{course.academy} · {course.lessons.length}</p>
          <input name="title" defaultValue={course.title} />
          <input name="summary" defaultValue={course.summary} />
          <select name="access" defaultValue={course.access}><option value="open">open</option><option value="pro">pro</option><option value="elite">elite</option><option value="vip">vip</option></select>
          <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
        </form>
      ))}
      <form action={addLesson} className="card grid gap-2 p-4">
        <h2 className="serif text-2xl">{t("addLesson")}</h2>
        <p>{t("recordedOnly")}</p>
        <HiddenLocale locale={locale} />
        <select name="courseId">{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
        <input name="title" placeholder={t("lessonTitle")} />
        <input name="videoId" placeholder={t("videoId")} />
        <button className="btn btn-ghost w-fit" type="submit">{t("addLesson")}</button>
      </form>
    </section>
  );
}

async function Products({ locale, t, flash }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  const products = await prisma.product.findMany({ orderBy: { title: "asc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="Products" crumbs={[{ href: "/admin", label: "Admin" }, { label: "Products" }]} />
      {flash}
      {products.map((product) => (
        <form key={product.id} action={saveProduct} className="card grid gap-2 p-4 md:grid-cols-2">
          <HiddenLocale locale={locale} />
          <input type="hidden" name="id" value={product.id} />
          <input name="title" defaultValue={product.title} />
          <input name="category" defaultValue={product.category} />
          <input name="detail" defaultValue={product.detail} />
          <select name="kind" defaultValue={product.kind}><option>EBOOK</option><option>PHYSICAL</option><option>OFFER</option></select>
          <label className="field"><span>{t("cents")} {t("price")}</span><input name="priceCents" defaultValue={product.priceCents} /></label>
          <label className="field"><span>{t("cents")} {t("was")}</span><input name="wasCents" defaultValue={product.wasCents} /></label>
          <label className="field"><span>{t("cents")} {t("memberPrice")}</span><input name="memberCents" defaultValue={product.memberCents} /></label>
          <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
        </form>
      ))}
    </section>
  );
}

async function Plans({ locale, t, flash }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  const plans = await prisma.plan.findMany();
  const fields = ["enrollmentCents", "recurringCents", "leads", "leadsOnRenewal", "impressions", "impressionsOnRenewal", "softwares", "voucherCents", "directCommissionCents", "matrixDepth", "teamLeadLevels", "giftProducts"] as const;
  return (
    <section className="grid gap-4">
      <PageHead title="Plans" intro={t("renewalNote")} crumbs={[{ href: "/admin", label: "Admin" }, { label: "Plans" }]} />
      {flash}
      {plans.map((plan) => (
        <form key={plan.code} action={savePlan} className="card grid gap-2 p-4 md:grid-cols-3">
          <h2 className="serif text-2xl md:col-span-3">{plan.name}</h2>
          <HiddenLocale locale={locale} />
          <input type="hidden" name="code" value={plan.code} />
          {fields.map((field) => <label key={field} className="field"><span>{field}</span><input name={field} defaultValue={plan[field]} /></label>)}
          {(["waCast", "tgCast", "leadsCatcher", "metaWa"] as const).map((field) => <label key={field} className="flex items-center gap-2"><input type="checkbox" name={field} defaultChecked={plan[field]} /><span>{field}</span></label>)}
          <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
        </form>
      ))}
    </section>
  );
}

async function Users({ locale, t, flash }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, firstName: true, role: true, planCode: true, status: true, balanceCents: true, adCredits: true, username: true } });
  return (
    <section className="grid gap-4">
      <PageHead title="Users" intro={t("masked")} crumbs={[{ href: "/admin", label: "Admin" }, { label: "Users" }]} />
      {flash}
      <DataTable columns={["Name", "Login", "Role", "Plan", "Status"]} rows={users.map((user) => [user.firstName, maskLogin(user.username), user.role, user.planCode ?? "", user.status])} empty={t("emptyList")} />
      {users.map((user) => (
        <form key={user.id} action={saveUser} className="card grid gap-2 p-4 md:grid-cols-3">
          <HiddenLocale locale={locale} />
          <input type="hidden" name="id" value={user.id} />
          <p className="md:col-span-3">{user.firstName} · {maskLogin(user.username)}</p>
          <select name="role" defaultValue={user.role}><option>MEMBER</option><option>ADMIN</option></select>
          <select name="planCode" defaultValue={user.planCode ?? ""}><option value="">FREE</option><option>BASIC</option><option>PRO</option><option>ELITE</option><option>VIP</option></select>
          <select name="status" defaultValue={user.status}><option>FREE</option><option>PAID_PENDING</option><option>PAID</option><option>EXPIRED</option></select>
          <label className="field"><span>{t("balance")} {t("cents")}</span><input name="balanceCents" defaultValue={user.balanceCents} /></label>
          <label className="field"><span>{t("credits")}</span><input name="adCredits" defaultValue={user.adCredits} /></label>
          <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
        </form>
      ))}
    </section>
  );
}

async function Tickets({ locale, t, flash }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  const tickets = await prisma.ticket.findMany({ include: { messages: true }, orderBy: { createdAt: "desc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="Support tickets" crumbs={[{ href: "/admin", label: "Admin" }, { label: "Support tickets" }]} />
      {flash}
      {tickets.map((ticket) => (
        <article key={ticket.id} className="card grid gap-2 p-4">
          <h2 className="serif text-2xl">{ticket.number} · {ticket.subject}</h2>
          <p>{ticket.department} · {ticket.status}</p>
          {ticket.messages.map((message) => <p key={message.id}>{message.author}: {message.body}</p>)}
          {ticket.status === "CLOSED" ? <p>{t("closedNoReply")}</p> : (
            <form action={replyTicket} className="grid gap-2">
              <HiddenLocale locale={locale} />
              <input type="hidden" name="id" value={ticket.id} />
              <textarea name="body" required />
              <label className="flex items-center gap-2"><input type="checkbox" name="close" value="yes" /><span>{t("closed")}</span></label>
              <button className="btn btn-primary w-fit" type="submit">{t("reply")}</button>
            </form>
          )}
        </article>
      ))}
    </section>
  );
}

async function Messages({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="grid gap-4">
      <PageHead title="Contact messages" crumbs={[{ href: "/admin", label: "Admin" }, { label: "Contact messages" }]} />
      {rows.length ? rows.map((row) => <article key={row.id} className="card p-4"><h2 className="serif text-2xl">{row.subject}</h2><p>{row.name} · {row.department}</p><p className="whitespace-pre-wrap">{row.body}</p></article>) : <Notice>{t("emptyList")}</Notice>}
    </section>
  );
}

function LibraryAdmin({ locale, t, flash }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>>; flash: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <PageHead title="FAQ" intro={t("recordedOnly")} crumbs={[{ href: "/admin", label: "Admin" }, { label: "FAQ" }]} />
      {flash}
      <form action={addLibrary} className="card grid gap-2 p-4">
        <HiddenLocale locale={locale} />
        <input type="hidden" name="kind" value="faq" />
        <input name="category" placeholder={t("category")} />
        <input name="question" placeholder={t("question")} required />
        <textarea name="answer" placeholder={t("answer")} required />
        <button className="btn btn-primary w-fit" type="submit">{t("addFaq")}</button>
      </form>
      <form action={addLibrary} className="card grid gap-2 p-4">
        <HiddenLocale locale={locale} />
        <input type="hidden" name="kind" value="news" />
        <input name="title" placeholder={t("title")} required />
        <textarea name="body" placeholder={t("body")} />
        <button className="btn btn-primary w-fit" type="submit">{t("addNews")}</button>
      </form>
      <form action={addLibrary} className="card grid gap-2 p-4">
        <HiddenLocale locale={locale} />
        <input type="hidden" name="kind" value="article" />
        <input name="title" placeholder={t("title")} required />
        <textarea name="body" placeholder={t("body")} />
        <button className="btn btn-primary w-fit" type="submit">{t("addArticle")}</button>
      </form>
      <Link className="underline" href="/faq">FAQ</Link>
    </section>
  );
}
