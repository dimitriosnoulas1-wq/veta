import { IconTile } from "@/components/icons";

export function HeroArt() {
  return <DashboardMock />;
}

/** Polished member-dashboard mock inside a browser frame for the public hero. */
export function DashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-lg md:max-w-none" aria-hidden="true">
      <div className="float-y absolute -left-3 top-10 z-10 hidden w-40 rounded-xl border border-line bg-[color:var(--card-solid)] p-3 shadow-card sm:block md:-left-8">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Course progress</p>
        <p className="display mt-1 text-2xl">68%</p>
        <div className="progress-bar mt-2"><span style={{ width: "68%" }} /></div>
      </div>
      <div className="float-y absolute -right-2 top-24 z-10 hidden w-44 rounded-xl border border-line bg-[color:var(--card-solid)] p-3 shadow-card sm:block md:-right-6" style={{ animationDelay: "0.6s" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Lesson</p>
        <p className="mt-1 text-sm font-semibold leading-snug">New lesson unlocked</p>
        <p className="mt-1 text-xs text-orange">Crypto Academy</p>
      </div>
      <div className="browser-frame relative z-[1]">
        <div className="browser-chrome">
          <span className="browser-dot" /><span className="browser-dot" /><span className="browser-dot" />
          <span className="ml-3 truncate rounded-md border border-line bg-bg/40 px-2 py-0.5 text-[10px] text-muted">vatelife.com/app</span>
        </div>
        <div className="grid gap-3 bg-[color:var(--bg-elevated)] p-3 sm:p-4 md:grid-cols-[4.5rem_1fr]">
          <div className="hidden flex-col gap-2 rounded-lg border border-line bg-[color:var(--card-solid)] p-2 md:flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-2 rounded-full ${i === 1 ? "bg-brand-gradient" : "bg-white/10"}`} />
            ))}
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg border border-line bg-[color:var(--card-solid)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Continue learning</p>
                  <p className="mt-1 text-sm font-semibold">Facebook Marketing</p>
                </div>
                <span className="rounded-md bg-brand-gradient px-2 py-1 text-[10px] font-bold text-white">Resume</span>
              </div>
              <div className="progress-bar mt-3"><span style={{ width: "42%" }} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Referrals", "Balance", "Savings"].map((label, i) => (
                <div key={label} className="rounded-lg border border-line bg-[color:var(--card-solid)] p-2">
                  <p className="text-[9px] uppercase tracking-wide text-muted">{label}</p>
                  <p className="display mt-1 text-sm sm:text-base">{i === 0 ? "12" : i === 1 ? "$84" : "$20"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureMock({ kind }: { kind: "academy" | "tools" | "software" | "team" }) {
  const rows =
    kind === "academy"
      ? ["Facebook Marketing", "Crypto Trading", "The AI Awakening"]
      : kind === "tools"
        ? ["Hook Generator", "Objection Crusher", "Team Growth Calculator"]
        : kind === "software"
          ? ["Marketing Wizard", "WhatsApp Cast", "Leads Catcher"]
          : ["Powerline", "Pass-up", "Unilevel"];
  return (
    <div className="browser-frame" aria-hidden="true">
      <div className="browser-chrome">
        <span className="browser-dot" /><span className="browser-dot" /><span className="browser-dot" />
      </div>
      <div className="grid gap-2 bg-[color:var(--bg-elevated)] p-4">
        {rows.map((title, index) => (
          <div key={title} className="flex items-center gap-3 rounded-lg border border-line bg-[color:var(--card-solid)] px-3 py-2.5">
            <IconTile seed={title} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{title}</p>
              {kind === "academy" ? <div className="progress-bar mt-1.5"><span style={{ width: `${35 + index * 18}%` }} /></div> : null}
            </div>
            <span className="text-muted">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HubArt({ seed }: { seed: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.25rem]" aria-hidden="true">
      <div className="absolute -right-4 -top-4 opacity-80">
        <IconTile seed={seed} size="lg" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[color:var(--card-solid)] to-transparent" />
    </div>
  );
}

export function Sparkline({ points, tone = "violet" }: { points: number[]; tone?: "violet" | "orange" | "good" }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = Math.max(max - min, 1);
  const w = 120;
  const h = 36;
  const path = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * w;
      const y = h - ((value - min) / span) * (h - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = tone === "orange" ? "#fb923c" : tone === "good" ? "#34d399" : "#a78bfa";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-9 w-full" aria-hidden="true" role="img">
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={stroke} opacity="0.12" />
    </svg>
  );
}

export function ProgressRing({ value, max, label, id }: { value: number; max: number; label?: string; id?: string }) {
  const safeMax = Math.max(max, 1);
  const pct = Math.max(0, Math.min(1, value / safeMax));
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const gradId = id ?? `ring-${Math.round(pct * 100)}-${safeMax}`;
  return (
    <div className="inline-flex items-center gap-2" aria-label={label ?? `${value} of ${max}`}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 24 24)"
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <text x="24" y="28" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="700">
          {Math.round(pct * 100)}%
        </text>
      </svg>
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="card grid place-items-center gap-3 px-6 py-12 text-center">
      <div aria-hidden="true">
        <svg viewBox="0 0 120 90" className="h-20 w-28" role="img">
          <rect x="18" y="22" width="84" height="52" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
          <circle cx="60" cy="48" r="14" fill="url(#emptyOrb)" />
          <defs>
            <linearGradient id="emptyOrb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p className="display text-xl">{title}</p>
      {detail ? <p className="max-w-md text-sm text-muted">{detail}</p> : null}
    </div>
  );
}

export function KpiTile({ label, value, points, tone }: { label: string; value: React.ReactNode; points: number[]; tone?: "violet" | "orange" | "good" }) {
  return (
    <article className="card card-interactive p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</h2>
      <p className="display mt-2 text-2xl tabular-nums md:text-3xl">{value}</p>
      <Sparkline points={points} tone={tone} />
    </article>
  );
}

export function PlanCardShell({
  name,
  price,
  detail,
  cta,
  popular,
  popularLabel,
  children,
}: {
  name: string;
  price: string;
  detail: string;
  cta: string;
  popular?: boolean;
  popularLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`card card-interactive relative flex h-full flex-col gap-3 p-6 ${popular ? "scale-[1.02] shadow-glow ring-1 ring-violet/40" : ""}`}>
      {popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white">
          {popularLabel ?? "Most popular"}
        </span>
      ) : null}
      <IconTile seed={name} />
      <h3 className="display text-2xl text-ink">{name}</h3>
      <p className="display text-3xl text-orange">{price}</p>
      <p className="text-sm text-muted">{detail}</p>
      {children}
      <span className={`btn mt-auto w-full ${popular ? "btn-primary" : "btn-ghost"}`}>{cta}</span>
    </div>
  );
}

export function CourseThumb({ seed, title }: { seed: string; title: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-[color:var(--bg-elevated)]">
      <div className="absolute inset-0 bg-gradient-to-br from-violet/30 via-transparent to-orange/25" />
      <div className="absolute inset-0 grid place-items-center">
        <IconTile seed={`${seed} ${title}`} size="lg" />
      </div>
    </div>
  );
}
