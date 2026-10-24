import type { LucideIcon } from "lucide-react";
import {
  ArrowUpCircle,
  BadgeDollarSign,
  Banknote,
  Bitcoin,
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  Clock3,
  CreditCard,
  GraduationCap,
  History,
  Image,
  Layers3,
  LayoutDashboard,
  Link2,
  Mail,
  Megaphone,
  MessageCircle,
  Newspaper,
  Package,
  Radio,
  Receipt,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  TrafficCone,
  TreePine,
  Users,
  UserRound,
  Wallet,
  WandSparkles,
  Wrench,
} from "lucide-react";

const RULES: Array<{ match: RegExp; icon: LucideIcon; glow: string }> = [
  { match: /wallet|balance|earn|withdraw|payment|voucher|upgrade|renew|compensation/i, icon: Wallet, glow: "#fb923c" },
  { match: /upgrade|renew|arrow|higher/i, icon: ArrowUpCircle, glow: "#f97316" },
  { match: /voucher|ticket|gift/i, icon: Ticket, glow: "#f59e0b" },
  { match: /history|payment|earning|airtime history/i, icon: History, glow: "#a78bfa" },
  { match: /withdraw|bank|payout/i, icon: Banknote, glow: "#34d399" },
  { match: /account|profile|sponsor|personal/i, icon: UserRound, glow: "#c084fc" },
  { match: /team|referral|powerline|unilevel|pass-?up|users/i, icon: Users, glow: "#60a5fa" },
  { match: /lead/i, icon: Layers3, glow: "#38bdf8" },
  { match: /broadcast|email|sender|hygiene|chat|bridge|mail/i, icon: Mail, glow: "#818cf8" },
  { match: /invit|script|sales|closing|banner|link/i, icon: Send, glow: "#f472b6" },
  { match: /traffic/i, icon: TrafficCone, glow: "#fb7185" },
  { match: /digital.?marketing|facebook|instagram|tiktok|marketing/i, icon: Megaphone, glow: "#f97316" },
  { match: /crypto|bitcoin|blockchain|defi|trading/i, icon: Bitcoin, glow: "#f59e0b" },
  { match: /\bai\b|gemini|avatar|twin|sparkle|brain/i, icon: Brain, glow: "#a855f7" },
  { match: /academy|course|learn|graduation|module|training/i, icon: GraduationCap, glow: "#8b5cf6" },
  { match: /coach|live|replay|meeting/i, icon: Radio, glow: "#e879f9" },
  { match: /tool|smart|wrench|generator|builder/i, icon: Wrench, glow: "#22d3ee" },
  { match: /wizard|software|boxoko/i, icon: WandSparkles, glow: "#c026d3" },
  { match: /whatsapp|telegram|cast|message/i, icon: MessageCircle, glow: "#22c55e" },
  { match: /catcher|scrape/i, icon: Bot, glow: "#14b8a6" },
  { match: /shop|eshop|cart|product|offer|ebook|physical/i, icon: ShoppingBag, glow: "#fb923c" },
  { match: /ad|advert|banner|airtime|impression/i, icon: Megaphone, glow: "#f43f5e" },
  { match: /support|ticket|faq|help/i, icon: CircleHelp, glow: "#94a3b8" },
  { match: /news|article/i, icon: Newspaper, glow: "#64748b" },
  { match: /calendar|event/i, icon: CalendarDays, glow: "#38bdf8" },
  { match: /dashboard|home|kpi/i, icon: LayoutDashboard, glow: "#a855f7" },
  { match: /plan|rank|matrix|commission/i, icon: ChartNoAxesCombined, glow: "#f97316" },
  { match: /clock|countdown|active/i, icon: Clock3, glow: "#c084fc" },
  { match: /credit|card|pay/i, icon: CreditCard, glow: "#fbbf24" },
  { match: /receipt|order/i, icon: Receipt, glow: "#fdba74" },
  { match: /package|pack/i, icon: Package, glow: "#fdba74" },
  { match: /shield|security|2fa|totp/i, icon: ShieldCheck, glow: "#34d399" },
  { match: /image|photo|design/i, icon: Image, glow: "#e879f9" },
  { match: /tree|powerline/i, icon: TreePine, glow: "#4ade80" },
  { match: /broadcast|radio/i, icon: Radio, glow: "#818cf8" },
  { match: /link/i, icon: Link2, glow: "#60a5fa" },
  { match: /dollar|money|fee/i, icon: BadgeDollarSign, glow: "#fbbf24" },
  { match: /book|read/i, icon: BookOpen, glow: "#a78bfa" },
  { match: /spark/i, icon: Sparkles, glow: "#e879f9" },
];

export function resolveGraphic(seed: string): { icon: LucideIcon; glow: string } {
  for (const rule of RULES) {
    if (rule.match.test(seed)) return { icon: rule.icon, glow: rule.glow };
  }
  return { icon: Sparkles, glow: "#a855f7" };
}

export function IconTile({ seed, size = "md" }: { seed: string; size?: "sm" | "md" | "lg" }) {
  const { icon: Icon, glow } = resolveGraphic(seed);
  const dim = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const iconSize = size === "lg" ? 28 : size === "sm" ? 18 : 22;
  return (
    <span
      className={`glow-tile ${dim} inline-flex items-center justify-center`}
      style={{
        ["--tile-glow" as string]: glow,
        background: `linear-gradient(145deg, color-mix(in srgb, ${glow} 38%, #1a1024), color-mix(in srgb, #3b1d55 70%, #0b0712))`,
      }}
      aria-hidden="true"
    >
      <span className="pointer-events-none absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at 30% 25%, ${glow}, transparent 55%)` }} />
      <Icon width={iconSize} height={iconSize} strokeWidth={1.75} className="relative text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
    </span>
  );
}
