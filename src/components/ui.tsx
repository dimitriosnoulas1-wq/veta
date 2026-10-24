import { Link } from "@/i18n/routing";
import { createCaptcha } from "@/lib/captcha";

export function Mark({ seed }: { seed: string }) {
  let hash = 0;
  for (const char of seed) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  const fills = ["#3b1d38", "#8a3b00", "#1f4d3a", "#1e3a5f", "#6b2d3c", "#3f3a1e"];
  const fill = fills[hash % fills.length];
  const letter = (seed.replace(/[^a-z0-9]/gi, "")[0] ?? "V").toUpperCase();
  const dots = [0, 1, 2, 3].filter((bit) => (hash >> bit) & 1);
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16" role="img" aria-hidden="true">
      <rect width="80" height="80" rx="18" fill={fill} />
      <text x="40" y="48" textAnchor="middle" fontSize="28" fontFamily="serif" fill="#fff8f1">{letter}</text>
      {dots.map((dot) => <circle key={dot} cx={18 + dot * 15} cy="66" r="3" fill="#fff8f1" />)}
    </svg>
  );
}

export function Crumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[#ffd7a8]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? <Link href={item.href} className="underline">{item.label}</Link> : <span className="text-[#fff8f1]">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHead({ title, intro, crumbs }: { title: string; intro?: string; crumbs: Array<{ href?: string; label: string }> }) {
  return (
    <header className="rounded-3xl bg-plum px-5 py-6 md:px-8 md:py-8">
      <Crumbs items={crumbs} />
      <h1 className="serif mt-3 text-3xl text-[#fff8f1] md:text-5xl">{title}</h1>
      {intro ? <p className="mt-3 max-w-3xl text-[#f6ede6]">{intro}</p> : null}
    </header>
  );
}

export function CardLink({ href, title, seed, action, note, badge }: { href: string; title: string; seed: string; action: string; note?: string; badge?: string }) {
  return (
    <Link href={href} className="card flex h-full flex-col gap-4 p-5 no-underline">
      <Mark seed={seed} />
      {badge ? <span className="w-fit rounded-full bg-plum px-3 py-1 text-sm font-semibold text-[#fff8f1]">{badge}</span> : null}
      <h2 className="serif text-2xl text-ink">{title}</h2>
      {note ? <p className="text-muted">{note}</p> : null}
      <span className="btn btn-primary mt-auto w-fit">{action}</span>
    </Link>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-line bg-card px-4 py-3 text-ink">{children}</p>;
}

export function DataTable({ columns, rows, empty }: { columns: string[]; rows: string[][]; empty: string }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          )) : (
            <tr><td colSpan={columns.length}>{empty}</td></tr>
          )}
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
