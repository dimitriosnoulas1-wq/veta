import type { Access, PlanCode } from "@/lib/access";

/** Single price source: public pricing.php (a.2) plus voucher, ad-credit, replay and withdrawal figures from a.3.
 *  The old upgrade table also listed Basic/Pro/Elite renewal as $20, VIP renewal leads as +2,000 and VIP software as 4.
 *  Those conflict with pricing.php ($12/month, VIP renewal 1,000 leads, 5 marketing softwares). This catalog follows pricing.php.
 */
export const PLANS: Array<{
  code: PlanCode;
  name: string;
  enrollmentCents: number;
  recurringCents: number;
  interval: "month" | "year";
  leads: number;
  leadsOnRenewal: number;
  impressions: number;
  impressionsOnRenewal: number;
  softwares: number;
  waCast: boolean;
  tgCast: boolean;
  leadsCatcher: boolean;
  metaWa: boolean;
  giftProducts: number;
  liveCoaching: string;
  voucherCents: number;
  placement: string;
  directCommissionCents: number;
  matrixDepth: number;
  teamLeadLevels: number;
}> = [
  { code: "BASIC", name: "Basic", enrollmentCents: 1300, recurringCents: 1200, interval: "month", leads: 200, leadsOnRenewal: 50, impressions: 1000, impressionsOnRenewal: 1000, softwares: 1, waCast: false, tgCast: false, leadsCatcher: false, metaWa: false, giftProducts: 0, liveCoaching: "Yes", voucherCents: 2500, placement: "Normal", directCommissionCents: 1000, matrixDepth: 12, teamLeadLevels: 2 },
  { code: "PRO", name: "Pro", enrollmentCents: 8800, recurringCents: 1200, interval: "month", leads: 400, leadsOnRenewal: 100, impressions: 3500, impressionsOnRenewal: 1000, softwares: 2, waCast: true, tgCast: false, leadsCatcher: false, metaWa: false, giftProducts: 0, liveCoaching: "Yes", voucherCents: 10000, placement: "High", directCommissionCents: 3000, matrixDepth: 12, teamLeadLevels: 3 },
  { code: "ELITE", name: "Elite", enrollmentCents: 18800, recurringCents: 1200, interval: "month", leads: 800, leadsOnRenewal: 200, impressions: 7500, impressionsOnRenewal: 1000, softwares: 3, waCast: true, tgCast: true, leadsCatcher: false, metaWa: false, giftProducts: 3, liveCoaching: "Yes", voucherCents: 20000, placement: "Higher", directCommissionCents: 5000, matrixDepth: 13, teamLeadLevels: 4 },
  { code: "VIP", name: "VIP", enrollmentCents: 0, recurringCents: 50000, interval: "year", leads: 2000, leadsOnRenewal: 1000, impressions: 20000, impressionsOnRenewal: 20000, softwares: 5, waCast: true, tgCast: true, leadsCatcher: true, metaWa: true, giftProducts: 5, liveCoaching: "Yes + VIP Events", voucherCents: 50000, placement: "Highest", directCommissionCents: 12000, matrixDepth: 14, teamLeadLevels: 5 },
];

export const REPLAY_CENTS = 2000;
export const WITHDRAW_FEE_CENTS = 500;
export const WITHDRAW_DAILY_LIMIT_CENTS = 500_000;
export const AD_PACKS = [
  { id: "package-1", name: "Package 1", credits: 2500, cents: 2000 },
  { id: "package-2", name: "Package 2", credits: 6500, cents: 5000 },
  { id: "package-3", name: "Package 3", credits: 15000, cents: 10000 },
];

export const RANKS = [
  { name: "Bronze", directs: 2, bonusCents: 3000, extra: "Bronze Certificate" },
  { name: "Silver", directs: 5, bonusCents: 100_000, extra: "Silver Certificate" },
  { name: "Gold", directs: 10, bonusCents: 500_000, extra: "+Level 13" },
  { name: "Platinum", directs: 20, bonusCents: 2_000_000, extra: "+Level 14, +$500 Gift" },
  { name: "Diamond", directs: 50, bonusCents: 5_000_000, extra: "+4% Pool, +$2000 Gift" },
];

export const ACTIVE_UNTIL = "2026-11-17T04:29:40.000Z";
export const POSITIONING = {
  paidPending: 398,
  freeMembers: 1151,
  dailyCall: "Daily Live Call at 8:00 PM EET (7:00 PM UK Time)",
  meet: "https://meet.google.com/kzv-eicr-yxv",
};

export const ADDRESS = "1102 Al Zahra Techno Center, Bur Dubai, Dubai, UAE";
export const SUPPORT_WHATSAPP = "https://wa.me/35796919257";
export const NOTIFY_WHATSAPP = "https://wa.me/35796017098";
export const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.app.VateLife";
export const BOXOKO = "https://boxoko.com/login";

export const SOCIAL = [
  { label: "Facebook", href: "https://facebook.com/vatelife" },
  { label: "Facebook Mastermind", href: "https://facebook.com/onlinemastermind" },
  { label: "Telegram", href: "https://t.me/VateLife" },
  { label: "YouTube", href: "https://youtube.com/@VateLife" },
];

export const SPONSOR = {
  username: "vate",
  name: "Vate Team",
  country: "United Arab Emirates",
};

export const TRAFFIC = [
  "https://worldprofit.com/?id=6358715",
  "https://easyhits4u.com/?ref=vatelifeteam",
  "https://trafficadbar.com/vateteam?prof=1",
  "https://herculist.com/members/powerhub.cgi?vateteam",
  "https://leadsleap.com?r=vateteam",
  "https://infinitytrafficboost.com/vateteam",
  "https://vur.me/vateteam",
  "https://theleadmagnet.com/?rid=38162",
  "https://mistersafelist.com/?rid=34003",
  "https://adchiever.com/?a=497256",
  "https://referralfrenzy.com/?r=25619",
  "https://trafficera.com/?ref=vateteam",
  "https://trafficg.com/?member=vateteam",
  "https://hungryforhits.com/?rid=47420",
];

export const EMAIL_PROVIDERS = ["MailerLite", "Sender", "systeme.io", "Brevo", "Moosend", "SendPulse"];
export const VERIFIERS = ["ZeroBounce", "NeverBounce", "MailerCheck"];

export const TRAININGS = [
  { id: "Q5eedep18UM", note: "" },
  { id: "5oQ8tYzCOYo", note: "" },
  { id: "iPwlrPcNI4Y", note: "Arabic" },
  { id: "H-BtRSCCUNY", note: "" },
  { id: "i6XVwM53dRM", note: "" },
];

export type CourseSeed = {
  id: string;
  academy: "digital-marketing" | "crypto" | "ai";
  title: string;
  access: Access;
  modules: number;
  videos?: string[];
  summary?: string;
  sort: number;
};

export const COURSES: CourseSeed[] = [
  { id: "z1c", academy: "digital-marketing", title: "Facebook Marketing", access: "open", modules: 1, videos: ["E7aGW2rzdj4"], sort: 1 },
  { id: "z1d", academy: "digital-marketing", title: "X Marketing", access: "open", modules: 6, sort: 2 },
  { id: "z1e", academy: "digital-marketing", title: "Instagram Marketing", access: "open", modules: 1, sort: 3 },
  { id: "z1f", academy: "digital-marketing", title: "TikTok Marketing", access: "open", modules: 1, sort: 4 },
  { id: "z1b", academy: "digital-marketing", title: "Success Guide", access: "open", modules: 5, sort: 5 },
  { id: "z1a", academy: "digital-marketing", title: "Entrepreneurship", access: "open", modules: 1, summary: "Entrepreneurial Success Quotient", sort: 6 },
  { id: "z1g", academy: "digital-marketing", title: "Chatbots to Automate your Business", access: "pro", modules: 1, sort: 7 },
  { id: "z1o", academy: "digital-marketing", title: "AI bots to Automate your Business", access: "pro", modules: 1, sort: 8 },
  { id: "z1p", academy: "digital-marketing", title: "Closing on Autopilot", access: "pro", modules: 1, sort: 9 },
  { id: "z2a", academy: "crypto", title: "Blockchain Revolution", access: "open", modules: 1, sort: 1 },
  { id: "z2b", academy: "crypto", title: "Stablecoin Masterclass", access: "open", modules: 1, sort: 2 },
  { id: "z2c", academy: "crypto", title: "The Digital Fortress", access: "open", modules: 1, sort: 3 },
  { id: "z2f", academy: "crypto", title: "Crypto Trading", access: "open", modules: 1, videos: ["ioy9VPI1vWA", "MUICaDp5iX8", "sep7ret1LRM", "kAhzCvQSJvw"], sort: 4 },
  { id: "z2d", academy: "crypto", title: "DeFi 2.0 Passively", access: "open", modules: 1, videos: ["p9jWixcQY48", "kAhzCvQSJvw"], sort: 5 },
  { id: "z2e", academy: "crypto", title: "The Yield Revolution", access: "open", modules: 1, sort: 6 },
  { id: "z2g", academy: "crypto", title: "Finding Coins before Pump", access: "pro", modules: 1, sort: 7 },
  { id: "z2h", academy: "crypto", title: "Copy Trading", access: "pro", modules: 1, sort: 8 },
  { id: "z2i", academy: "crypto", title: "The Crypto Sovereign", access: "pro", modules: 1, sort: 9 },
  { id: "z2j", academy: "crypto", title: "Crypto Sniper", access: "elite", modules: 1, sort: 10 },
  { id: "z2k", academy: "crypto", title: "Crypto FVG Indicator", access: "elite", modules: 1, sort: 11 },
  { id: "z2m", academy: "crypto", title: "Risk & Reward Calculator", access: "elite", modules: 1, sort: 12 },
  { id: "z2l", academy: "crypto", title: "1-Minute Scalp Suite", access: "vip", modules: 1, sort: 13 },
  { id: "z2n", academy: "crypto", title: "Apex Challenge Suite", access: "vip", modules: 1, sort: 14 },
  { id: "z3a", academy: "ai", title: "The AI Awakening", access: "open", modules: 1, sort: 1 },
  { id: "z3b", academy: "ai", title: "The Architect's Toolkit", access: "open", modules: 1, sort: 2 },
  { id: "z3c", academy: "ai", title: "AI Ethical Leadership", access: "open", modules: 1, sort: 3 },
  { id: "z3d", academy: "ai", title: "The Toolchest", access: "open", modules: 1, sort: 4 },
  { id: "z3e", academy: "ai", title: "The Gemini Engine", access: "open", modules: 1, summary: "https://gemini.google.com", sort: 5 },
  { id: "z3f", academy: "ai", title: "The AI Studio", access: "open", modules: 1, summary: "https://aistudio.google.com", sort: 6 },
  { id: "z3g", academy: "ai", title: "Visual & Video Sovereignty", access: "pro", modules: 1, summary: "ImageFX / VideoFX", sort: 7 },
  { id: "z3h", academy: "ai", title: "The Automated Empire", access: "pro", modules: 1, sort: 8 },
  { id: "z3i", academy: "ai", title: "Live Leadership", access: "pro", modules: 1, sort: 9 },
];

export const ACADEMIES = [
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    intro: "Master the art of influence and conversion…",
    headings: ["Finding Unlimited Prospects Daily without Paid Ads", "Strategies to Succeed", "Automation"],
  },
  {
    id: "crypto",
    title: "Crypto Academy",
    intro: "Navigating the Future of Finance",
    headings: ["EXCLUSIVE PRO COURSES", "EXCLUSIVE ELITE APPS", "EXCLUSIVE VIP APPS"],
  },
  {
    id: "ai",
    title: "AI Academy",
    intro: "AI Mastery for Peak Productivity",
    headings: [],
    videos: [
      { id: "qAoIdCYqPjM", note: "AI Avatar" },
      { id: "7573m3H6pFE", note: "AI Avatar" },
    ],
  },
] as const;

export const TOOL_GROUPS: Array<{ title: string; tools: Array<{ id: string; title: string; videos?: string[]; href?: string }> }> = [
  {
    title: "Content & Viral Influence Bundle",
    tools: [
      { id: "z4a", title: "Fonts Generator" },
      { id: "z4b", title: "Subject & Headline Analyzer" },
      { id: "z4g", title: "Hook Generator" },
      { id: "z4h", title: "X Viral Thread Builder" },
      { id: "z4u", title: "Viral Content Generator" },
      { id: "z4v", title: "Remove background from images", videos: ["zSTxO6ZW4nI"] },
      { id: "z4w", title: "Paraphraser", videos: ["zUw8mLD8hkw"] },
      { id: "z4x", title: "Free Design Platform", videos: ["52IbrPkiGws"] },
      { id: "z4y", title: "Subtitles on Videos", videos: ["6L5Kohpopbo"], href: "https://www.veed.io/use-cases/subtitles-transcription" },
    ],
  },
  {
    title: "Leadership & Team Management Tools",
    tools: [
      { id: "z4d", title: "Instant Leader Alerts" },
      { id: "z4j", title: "Team Growth Calculator" },
      { id: "z4k", title: "Daily Success Tracker" },
      { id: "z4p", title: "Seniority Impact Visualizer" },
      { id: "z4r", title: "Momentum Heat-Map" },
      { id: "z4t", title: "Leader Performance Tracker" },
    ],
  },
  {
    title: "Conversion & Closing Command Center",
    tools: [
      { id: "z4c", title: "WhatsApp Link Generator" },
      { id: "z4e", title: "Momentum Story Builder" },
      { id: "z4f", title: "Facebook Post Creator" },
      { id: "z4i", title: "Objection Crusher" },
      { id: "z4m", title: "3-Way Call Briefing Tool" },
      { id: "z4n", title: "The Cut-Off Closer" },
      { id: "z4o", title: "AI Script Personalizer" },
      { id: "z4q", title: "Value Proposition Generator" },
    ],
  },
  {
    title: "Advanced AI Integration Tools",
    tools: [
      { id: "z4l", title: "Social Proof Snippets" },
      { id: "z4s", title: "Your AI Digital Twin" },
    ],
  },
];

export const EBOOKS = {
  category: "eBooks",
  groups: [
    { category: "BUSINESS", titles: ["Start Your Coaching Program", "12 eBusiness Models", "Branding Your E-Business", "Develop Your Financial IQ", "Creating Sales Videos", "Success With Affiliate Marketing", "Creating Your Digital Product", "Secrets Of High Ticket Sales"] },
    { category: "ONLINE MARKETING", titles: ["Telegram Marketing Secrets", "WhatsApp For Business", "LinkedIn Business Essentials", "Snapchat Traffic Booster"] },
    { category: "MINDSET", titles: ["Command Your Life and Mind", "Improve Your Memory", "Get Organized"] },
    { category: "HEALTH & WELLNESS", titles: ["Get Fit & Healthy", "Weight Loss Mastery", "Healthy Diet & Superfoods", "Drop The Fat Now", "101 Diet Tips", "Help Teenagers Lose Weight"] },
  ],
};

export const PHYSICAL: Array<{ title: string; priceCents: number; wasCents: number; memberCents: number; detail?: string }> = [
  { title: "Premium Diet Coffee", priceCents: 3500, wasCents: 5000, memberCents: 2500 },
  { title: "LEGEND Parfum Intense (men)", priceCents: 8000, wasCents: 10000, memberCents: 4000 },
  { title: "FABULOUS Parfum Intense (women)", priceCents: 8000, wasCents: 10000, memberCents: 4000 },
  { title: "Astaxanthin & Stem Cells Ampoules", priceCents: 8000, wasCents: 10000, memberCents: 4000 },
  { title: "Argireline & Stem Cells Ampoules", priceCents: 9000, wasCents: 12000, memberCents: 4500 },
  { title: "Day Cream", priceCents: 6500, wasCents: 10000, memberCents: 3600, detail: "50ml" },
  { title: "Night Cream", priceCents: 6500, wasCents: 10000, memberCents: 3600 },
  { title: "Face Serum", priceCents: 7700, wasCents: 12000, memberCents: 4000 },
  { title: "Skin Nectar", priceCents: 5500, wasCents: 6500, memberCents: 3500 },
  { title: "Body Active Care", priceCents: 6000, wasCents: 8000, memberCents: 3600 },
  { title: "Nootropic Mouth Spray", priceCents: 4000, wasCents: 5000, memberCents: 3000 },
  { title: "Melatonin Mouth Spray", priceCents: 4000, wasCents: 5000, memberCents: 3000 },
  { title: "5 Stages Water Filter", priceCents: 18000, wasCents: 20000, memberCents: 10000 },
];

export const OFFERS: Array<{ title: string; contents: string; priceCents: number; wasCents: number; memberCents: number }> = [
  { title: "OFFER 1", contents: "4 boxes of Premium Diet Coffee for the price of 3", priceCents: 10500, wasCents: 14000, memberCents: 7500 },
  { title: "OFFER 2", contents: "Day Cream + Night Cream + Face Serum", priceCents: 19000, wasCents: 20700, memberCents: 10000 },
  { title: "OFFER 3", contents: "LEGEND + FABULOUS", priceCents: 13000, wasCents: 16000, memberCents: 7500 },
  { title: "OFFER 4", contents: "Day + Night Cream + Face Serum + Astaxanthin + Body Active Care", priceCents: 28700, wasCents: 34700, memberCents: 14800 },
  { title: "OFFER 5", contents: "Day + Night Cream + Face Serum + Argireline + Body Active Care", priceCents: 29700, wasCents: 35700, memberCents: 15300 },
  { title: "OFFER 6", contents: "Total Transformation Bundle", priceCents: 70000, wasCents: 80200, memberCents: 40000 },
];

export const EMAIL_SEQUENCES = ["Cold Prospects", "Warm Market", "Team Leads", "Global Leads"];
export const CHAT_STRATEGIES = ["New Leads", "Engagement", "Follow-Up", "The Close"];
export const BRIDGE_STEPS = [
  { step: "01", title: "The Reply Protocol" },
  { step: "02", title: "Need Discovery" },
  { step: "03", title: "Solution Handoff" },
];
export const INVITE_PHASES = ["Pre-Launch", "Just Launched", "Cut-Off Day", "Evergreen"];
export const INVITE_CHANNELS = ["WhatsApp", "Telegram", "FB Messenger", "Instagram Stories", "TikTok", "FB Group Post", "X"];
export const MESSENGERS = ["Telegram", "WhatsApp", "WeChat", "Google Hangouts", "Viber", "LINE", "Band", "Snapchat", "Discord", "Slack", "Kik", "KakaoTalk", "Facebook Messenger"] as const;

export const NOTIFICATION_KEYS = [
  ["loginAttempt", "Login attempt"],
  ["rewards", "Rewards"],
  ["withdrawal", "Withdrawal"],
  ["customerUpgrades", "Customer upgrades"],
  ["prospect", "Prospect"],
  ["commission", "Commission"],
  ["admin", "Admin"],
] as const;

export const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/account", label: "My Account" },
  { href: "/app/wallet", label: "My Wallet" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/broadcast", label: "Emails/Chats Broadcast" },
  { href: "/app/inviting", label: "Inviting Tools" },
  { href: "/app/traffic", label: "Traffic Sources" },
  { href: "/app/learn/digital-marketing", label: "Digital Marketing" },
  { href: "/app/learn/crypto", label: "Crypto Academy" },
  { href: "/app/learn/ai", label: "AI Academy" },
  { href: "/app/coaching", label: "Live Coaching" },
  { href: "/app/trainings", label: "Live Trainings" },
  { href: "/app/tools", label: "Smart Tools" },
  { href: "/app/software/wizard", label: "Marketing Wizard" },
  { href: "/app/software/cast", label: "WhatsApp/Telegram Cast" },
  { href: "/app/software/leads", label: "Leads Catcher" },
  { href: "/app/shop", label: "eShop" },
  { href: "/app/ads", label: "Advertising Center" },
  { href: "/app/team", label: "My Team" },
  { href: "/app/support", label: "Support" },
] as const;

/** Grouped sidebar for the member SaaS shell. Labels/hrefs match NAV entries. */
export const NAV_GROUPS = [
  {
    id: "learn",
    label: "Learn",
    items: [
      { href: "/app/learn/digital-marketing", label: "Digital Marketing" },
      { href: "/app/learn/crypto", label: "Crypto Academy" },
      { href: "/app/learn/ai", label: "AI Academy" },
      { href: "/app/coaching", label: "Live Coaching" },
      { href: "/app/trainings", label: "Live Trainings" },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { href: "/app/leads", label: "Leads" },
      { href: "/app/broadcast", label: "Emails/Chats Broadcast" },
      { href: "/app/inviting", label: "Inviting Tools" },
      { href: "/app/traffic", label: "Traffic Sources" },
      { href: "/app/software/wizard", label: "Marketing Wizard" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    items: [
      { href: "/app/tools", label: "Smart Tools" },
      { href: "/app/software/cast", label: "WhatsApp/Telegram Cast" },
      { href: "/app/software/leads", label: "Leads Catcher" },
    ],
  },
  {
    id: "commerce",
    label: "Shop & Ads",
    items: [
      { href: "/app/shop", label: "eShop" },
      { href: "/app/ads", label: "Advertising Center" },
    ],
  },
  {
    id: "team",
    label: "Team",
    items: [{ href: "/app/team", label: "My Team" }],
  },
  {
    id: "account",
    label: "Account / Wallet",
    items: [
      { href: "/app/account", label: "My Account" },
      { href: "/app/wallet", label: "My Wallet" },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [{ href: "/app/support", label: "Support" }],
  },
] as const;

export const PUBLIC_STATS = [
  { value: String(PLANS.length), label: "Membership plans" },
  { value: String(COURSES.length), label: "Academy courses" },
  { value: String(TOOL_GROUPS.reduce((sum, group) => sum + group.tools.length, 0)), label: "Smart tools" },
] as const;

export const HOME_FEATURES = [
  {
    title: "Digital Marketing",
    href: "/app/learn/digital-marketing",
    body: ACADEMIES[0].intro,
    visual: "academy" as const,
  },
  {
    title: "Smart Tools",
    href: "/app/tools",
    body: TOOL_GROUPS.map((group) => group.title).join(" · "),
    visual: "tools" as const,
  },
  {
    title: "Marketing Softwares",
    href: "/app/software/wizard",
    body: "Marketing Wizard · WhatsApp/Telegram Cast · Leads Catcher",
    visual: "software" as const,
  },
  {
    title: "My Team",
    href: "/app/team",
    body: "Powerline · Pass-up · Unilevel",
    visual: "team" as const,
  },
] as const;

export const HOME_BENEFITS = [
  { title: "Leads", href: "/app/leads" },
  { title: "Advertising Airtime", href: "/app/ads" },
  { title: "Live Coaches", href: "/app/coaching" },
  { title: "Inviting Tools & Traffic Sources", href: "/app/inviting" },
] as const;

export const GLOBAL_LEAD_TOTAL = 200;
export const LEAD_LEGEND = ["Paid Member", "Free Member", "Trial Member", "Expired Member", "Disabled", "Pending activation members"];
export const REFERRAL_LEGEND = ["Free", "Paid-Pending", "Paid", "Expired"];

export function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function allProducts() {
  const ebooks = EBOOKS.groups.flatMap((group) =>
    group.titles.map((title) => ({
      id: slugify(title),
      kind: "EBOOK" as const,
      category: group.category,
      title,
      priceCents: 1000,
      wasCents: 2000,
      memberCents: 500,
      detail: "Digital delivery",
    })),
  );
  const physical = PHYSICAL.map((item) => ({
    id: slugify(item.title),
    kind: "PHYSICAL" as const,
    category: "Physical Products",
    title: item.title,
    priceCents: item.priceCents,
    wasCents: item.wasCents,
    memberCents: item.memberCents,
    detail: item.detail ?? "",
  }));
  const offers = OFFERS.map((item) => ({
    id: slugify(item.title),
    kind: "OFFER" as const,
    category: "Special Offers",
    title: item.title,
    priceCents: item.priceCents,
    wasCents: item.wasCents,
    memberCents: item.memberCents,
    detail: item.contents,
  }));
  return [...ebooks, ...physical, ...offers];
}
