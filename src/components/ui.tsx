import { Link } from "@/i18n/routing";
import { createCaptcha } from "@/lib/captcha";
import { IconTile } from "@/components/icons";
import { CourseThumb, EmptyState } from "@/components/graphics";

/** @deprecated Prefer IconTile — kept for call sites that still import Mark. */
export function Mark({ seed }: { seed: string }) {
  return <IconTile seed={seed} size="lg" />;
}

export function Crumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true" className="opacity-40">/</span> : null}
            {item.href ? <Link href={item.href} className="underline decoration-white/20 underline-offset-4 hover:text-ink hover:decoration-orange" prefetch>{item.label}</Link> : <span className="text-ink">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHead({ title, intro, crumbs }: { title: string; intro?: string; crumbs: Array<{ href?: string; label: string }> }) {
  return (
    <header className="relative border-b border-line pb-6 md:pb-8">
      <div className="relative z-[1] max-w-3xl">
        <Crumbs items={crumbs} />
        <div className="mt-3 flex items-start gap-3">
          <span className="mt-1 hidden sm:inline-flex"><IconTile seed={title} size="sm" /></span>
          <div>
            <h1 className="display text-3xl text-ink md:text-4xl lg:text-[2.75rem]">{title}</h1>
            {intro ? <p className="mt-3 max-w-2xl text-base text-muted md:text-lg">{intro}</p> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

/** Hub-style card: icon, title, one-line note, trailing arrow — website dashboard, not phone tile. */
export function CardLink({ href, title, seed, action, note, badge }: { href: string; title: string; seed: string; action: string; note?: string; badge?: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="card card-interactive group flex h-full items-start gap-3 p-4 no-underline sm:p-5"
      aria-label={`${title}. ${action}`}
    >
      <IconTile seed={`${seed} ${title}`} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <h2 className="display text-base leading-snug text-ink sm:text-lg">{title}</h2>
          {badge ? <span className="shrink-0 rounded-md border border-line bg-bg/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange">{badge}</span> : null}
        </span>
        {note ? <p className="mt-1 line-clamp-2 text-sm text-muted">{note}</p> : null}
      </span>
      <span className="mt-1 text-muted transition group-hover:translate-x-0.5 group-hover:text-orange" aria-hidden="true">→</span>
    </Link>
  );
}

export function CourseCard({
  href,
  title,
  seed,
  modules,
  modulesLabel,
  badge,
  progress,
  progressLabel,
  locked,
  action,
}: {
  href: string;
  title: string;
  seed: string;
  modules: number;
  modulesLabel: string;
  badge?: string;
  progress?: number;
  progressLabel?: string;
  locked?: boolean;
  action: string;
}) {
  const pct = Math.max(0, Math.min(100, progress ?? 0));
  return (
    <Link href={href} prefetch className="card card-interactive group flex h-full flex-col gap-3 p-3 no-underline sm:p-4" aria-label={`${title}. ${action}`}>
      <CourseThumb seed={seed} title={title} />
      <div className="flex items-start justify-between gap-2 px-0.5">
        <h2 className="display text-base leading-snug sm:text-lg">{title}</h2>
        {badge ? (
          <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${locked ? "border-orange/40 text-orange" : "border-line text-muted"}`}>
            {badge}
          </span>
        ) : null}
      </div>
      <p className="px-0.5 text-sm text-muted">{modules} {modulesLabel}</p>
      {typeof progress === "number" ? (
        <div className="px-0.5">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{progressLabel}</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
        </div>
      ) : null}
    </Link>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{children}</div>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  const text = typeof children === "string" ? children : null;
  if (text && /empty|no |missing|none|δεν|geen/i.test(text) && text.length < 120) {
    return <EmptyState title={text} />;
  }
  return <p className="rounded-xl border border-line bg-[color:var(--card-solid)] px-4 py-3 text-ink">{children}</p>;
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
            <tr key={index} className="hover:bg-white/[0.02]">{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CaptchaFields({ label }: { label: string }) {
  const captcha = createCaptcha();
  return (
    <fieldset className="grid gap-2 rounded-xl border border-line p-3">
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

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
