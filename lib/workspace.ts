export type PlanId = "free" | "pro" | "team";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  monthly: number;
  perRun: number;
  features: string[];
};

export type DraftKind = "write" | "pdf";

export type Draft = {
  id: string;
  title: string;
  text: string;
  kind: DraftKind;
  words: number;
  score: number | null;
  at: number;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "to start",
    monthly: 2000,
    perRun: 500,
    features: ["2,000 words each month", "500 words per run", "AI score and sentence markup", "Balanced tone"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month",
    monthly: 15000,
    perRun: 4000,
    features: ["15,000 words each month", "All three tones", "Original next to the rewrite", "4,000 words per run"],
  },
  team: {
    id: "team",
    name: "Team",
    price: "$29",
    period: "per seat / month",
    monthly: 40000,
    perRun: 8000,
    features: ["40,000 words each month", "8,000 words per run", "Usage on this workspace", "All three tones"],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.free, PLANS.pro, PLANS.team];

const COMPOSE = "humanly.compose.";

/** Billing months follow UTC, the same as the server. */
export function currentPeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type BillingView = {
  plan: PlanId;
  used: number;
  allowance?: number;
  perRun?: number;
  period: string;
};

export function wordsLeft(workspace: BillingView) {
  const allowance = workspace.allowance ?? PLANS[workspace.plan].monthly;
  return Math.max(0, allowance - workspace.used);
}

export function runLimit(workspace: BillingView, words: number) {
  const plan = PLANS[workspace.plan];
  const cap = workspace.perRun || plan.perRun;
  if (words > cap) {
    return `${plan.name} takes ${cap.toLocaleString("en-US")} words at a time. This draft is ${words.toLocaleString("en-US")}.`;
  }
  return "";
}

export function rewriteLimit(workspace: BillingView, words: number) {
  const capped = runLimit(workspace, words);
  if (capped) return capped;
  const left = wordsLeft(workspace);
  if (words > left) {
    return `${left.toLocaleString("en-US")} words left this month. This draft is ${words.toLocaleString("en-US")}.`;
  }
  return "";
}

export function queueCompose(text: string) {
  const id = crypto.randomUUID();
  sessionStorage.setItem(COMPOSE + id, text.slice(0, 12000));
  return id;
}

export function takeCompose(id: string) {
  const key = COMPOSE + id;
  const text = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  return text;
}

export function titleFrom(text: string) {
  const words = text.trim().split(/\s+/).slice(0, 6).join(" ");
  if (!words) return "Untitled";
  return words.length > 46 ? `${words.slice(0, 44)}…` : words;
}

export function formatWords(value: number) {
  return value.toLocaleString("en-US");
}

export function whenLabel(at: number) {
  const date = new Date(at);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function monthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return "";
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
}

/** The day the monthly allowance starts over, e.g. "Nov 1". */
export function resetLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return "";
  return new Date(Date.UTC(year, month, 1)).toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function relativeTime(at: number, now = Date.now()) {
  const diff = Math.max(0, now - at);
  const minute = 60_000;
  if (diff < minute) return "Just now";
  if (diff < 60 * minute) return `${Math.floor(diff / minute)} min ago`;
  const date = new Date(at);
  const today = new Date(now);
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now - 24 * 60 * minute);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function levelOf(score: number | null | undefined) {
  if (score == null) return "none" as const;
  if (score >= 50) return "ai" as const;
  if (score >= 25) return "mid" as const;
  return "ok" as const;
}

export const LEVEL_LABEL = { none: "Not scored", ai: "Reads as AI", mid: "Mixed", ok: "Reads as human" } as const;
