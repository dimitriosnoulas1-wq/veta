import { Link } from "@/i18n/routing";
import { createCaptcha } from "@/lib/captcha";
import { IconTile } from "@/components/icons";
import { EmptyState, HubArt } from "@/components/graphics";

/** @deprecated Prefer IconTile — kept for call sites that still import Mark. */
export function Mark({ seed }: { seed: string }) {
  return <IconTile seed={seed} size="lg" />;
}

export function Crumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[#ffd7a8]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? <Link href={item.href} className="underline decoration-white/30 underline-offset-4 hover:decoration-orange" prefetch>{item.label}</Link> : <span className="text-[#fff8f1]">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHead({ title, intro, crumbs }: { title: string; intro?: string; crumbs: Array<{ href?: string; label: string }> }) {
  return (
    <header className="relative overflow-hidden rounded-[1.5rem] border border-line bg-[color:var(--glass)] px-5 py-7 shadow-card backdrop-blur-xl md:px-8 md:py-9">
      <HubArt seed={title} />
      <div className="relative z-[1] max-w-3xl">
        <Crumbs items={crumbs} />
        <h1 className="display mt-3 text-3xl text-[#fff8f1] md:text-5xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-3xl text-[#f6ede6]/90">{intro}</p> : null}
      </div>
    </header>
  );
}

export function CardLink({ href, title, seed, action, note, badge }: { href: string; title: string; seed: string; action: string; note?: string; badge?: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="card card-interactive group flex h-full flex-col gap-2.5 p-3.5 no-underline sm:p-4"
      aria-label={`${title}. ${action}`}
    >
      <div className="flex items-start justify-between gap-2">
        <IconTile seed={`${seed} ${title}`} size="sm" />
        {badge ? <span className="rounded-full border border-line bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ffd7a8]">{badge}</span> : null}
      </div>
      <h2 className="display text-base leading-snug text-ink sm:text-lg">{title}</h2>
      {note ? <p className="line-clamp-2 text-xs text-muted sm:text-sm">{note}</p> : null}
      <span className="mt-auto pt-1 text-xs font-semibold text-orange opacity-90 transition group-hover:opacity-100">{action} →</span>
    </Link>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">{children}</div>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  const text = typeof children === "string" ? children : null;
  if (text && /empty|no |missing|none|δεν|geen/i.test(text) && text.length < 120) {
    return <EmptyState title={text} />;
  }
  return <p className="rounded-2xl border border-line bg-[color:var(--glass)] px-4 py-3 text-ink backdrop-blur-md">{children}</p>;
}

export function DataTable({ columns, rows, empty }: { columns: string[]; rows: string[][]; empty: string }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CaptchaFields({ label }: { label: string }) {
  const captcha = createCaptcha();
  return (
    <fieldset className="grid gap-2 rounded-2xl border border-line p-3">
      <legend className="px-1 font-semibold">{label} {captcha.a} + {captcha.b}?</legend>
      <input name="a" type="hidden" value={captcha.a} />
      <input name="b" type="hidden" value={captcha.b} />
      <input name="sig" type="hidden" value={captcha.sig} />
      <input name="answer" inputMode="numeric" autoComplete="off" required aria-label={`${label} ${captcha.a} + ${captcha.b}`} />
    </fieldset>
  );
}

export function HiddenLocale({ locale }: { locale: string }) {
  return <input type="hidden" name="locale" value={locale} />;
}

export function PayMethods({ balance, crypto }: { balance: string; crypto: string }) {
  return (
    <label className="field">
      <span>{balance}</span>
      <select name="method" defaultValue="balance">
        <option value="balance">Account Balance</option>
        <option value="crypto">Pay with Crypto</option>
      </select>
      <span className="sr-only">{crypto}</span>
    </label>
  );
}
