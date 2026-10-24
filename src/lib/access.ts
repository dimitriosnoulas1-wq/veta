export type PlanCode = "BASIC" | "PRO" | "ELITE" | "VIP";
export type Access = "open" | "pro" | "elite" | "vip";

const RANK: Record<PlanCode, number> = { BASIC: 0, PRO: 1, ELITE: 2, VIP: 3 };

export function planRank(plan: PlanCode | null | undefined) {
  if (!plan) return -1;
  return RANK[plan];
}

/** "open" means included from Basic upward, as verified for a Basic paid account. */
export function canAccess(plan: PlanCode | null | undefined, access: Access) {
  const need = access === "open" ? 0 : access === "pro" ? 1 : access === "elite" ? 2 : 3;
  return planRank(plan) >= need;
}

export function requiredPlan(access: Access): PlanCode {
  if (access === "vip") return "VIP";
  if (access === "elite") return "ELITE";
  if (access === "pro") return "PRO";
  return "BASIC";
}

export function accessLabel(access: Access) {
  if (access === "open") return "Basic & above";
  if (access === "pro") return "PRO & above";
  if (access === "elite") return "ELITE & above";
  return "VIP";
}
