import { IconTile } from "@/components/icons";

export function HeroArt() {
  return (
    <div className="relative mx-auto h-56 w-full max-w-md md:h-72" aria-hidden="true">
      <div className="aurora opacity-90" />
      <svg viewBox="0 0 420 320" className="relative z-[1] h-full w-full float-y" role="img">
        <defs>
          <linearGradient id="vl-orb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="55%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="vl-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
          <filter id="vl-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <ellipse cx="210" cy="270" rx="120" ry="18" fill="#a855f7" opacity="0.25" filter="url(#vl-soft)" />
        <rect x="92" y="78" width="236" height="160" rx="28" fill="url(#vl-panel)" stroke="rgba(255,255,255,0.18)" />
        <circle cx="210" cy="150" r="54" fill="url(#vl-orb)" opacity="0.95" />
        <circle cx="210" cy="150" r="70" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        <circle cx="210" cy="150" r="88" fill="none" stroke="rgba(251,146,60,0.28)" strokeWidth="1.5" strokeDasharray="6 10" />
        <rect x="118" y="210" width="184" height="10" rx="5" fill="rgba(255,255,255,0.14)" />
        <rect x="142" y="228" width="136" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
        <path d="M70 120c30-40 70-50 110-28" fill="none" stroke="#fb923c" strokeWidth="2" opacity="0.55" />
        <path d="M340 110c-28-36-72-48-118-22" fill="none" stroke="#c084fc" strokeWidth="2" opacity="0.55" />
        <circle cx="78" cy="118" r="7" fill="#fb923c" />
        <circle cx="348" cy="108" r="7" fill="#c084fc" />
        <circle cx="120" cy="70" r="4" fill="#fff" opacity="0.7" />
        <circle cx="310" cy="64" r="3" fill="#fff" opacity="0.55" />
        <circle cx="250" cy="48" r="2.5" fill="#fb923c" opacity="0.8" />
      </svg>
    </div>
  );
}

export function HubArt({ seed }: { seed: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.5rem]" aria-hidden="true">
      <div className="aurora opacity-70" />
      <div className="absolute -right-6 -top-4 opacity-90">
        <IconTile seed={seed} size="lg" />
      </div>
      <div className="absolute bottom-3 right-16 opacity-40 scale-75">
        <IconTile seed={`${seed}-alt`} size="sm" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[color:var(--bg)] to-transparent" />
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
    <div className="card grid place-items-center gap-3 px-6 py-10 text-center">
      <div aria-hidden="true" className="relative">
        <div className="aurora absolute inset-0 scale-150 opacity-60" />
        <svg viewBox="0 0 120 90" className="relative h-20 w-28" role="img">
          <rect x="18" y="22" width="84" height="52" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)" />
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
    <article className="card card-interactive p-4">
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
    <div className={`card card-interactive relative flex h-full flex-col gap-3 p-5 ${popular ? "shadow-glow ring-1 ring-orange/50" : ""}`}>
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
