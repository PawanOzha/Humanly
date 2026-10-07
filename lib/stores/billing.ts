"use client";

import { create } from "zustand";
import { api, type Usage } from "@/lib/api";
import { useShallow } from "zustand/react/shallow";
import { currentPeriod, PLANS, type BillingView, type PlanId } from "@/lib/workspace";

const KEY = "humanly.billing";
const LEGACY = "humanly.workspace";

export type BillingSource = "local" | "server";

type BillingState = {
  source: BillingSource;
  plan: PlanId;
  used: number;
  allowance: number;
  perRun: number;
  period: string;
  loadLocal: () => void;
  replace: (usage: Usage, source?: BillingSource) => void;
  apply: (usage: Usage) => void;
  setPlan: (plan: PlanId) => Promise<void>;
  spendLocal: (words: number) => void;
};

type Stored = Partial<Pick<BillingState, "plan" | "used" | "period">>;

let planTicket = 0;

function isPlan(value: unknown): value is PlanId {
  return value === "free" || value === "pro" || value === "team";
}

function fromUsage(usage: Usage, source: BillingSource): Pick<BillingState, "source" | "plan" | "used" | "allowance" | "perRun" | "period"> {
  const spec = PLANS[isPlan(usage.plan) ? usage.plan : "free"];
  return {
    source,
    plan: spec.id,
    used: Math.max(0, usage.used || 0),
    allowance: usage.allowance || spec.monthly,
    perRun: usage.perRun || spec.perRun,
    period: usage.period || currentPeriod(),
  };
}

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const direct = JSON.parse(localStorage.getItem(KEY) || "null") as Stored | null;
    if (direct && typeof direct === "object") return direct;
    const legacy = JSON.parse(localStorage.getItem(LEGACY) || "null") as Stored | null;
    if (legacy && typeof legacy === "object") return legacy;
  } catch {
    return null;
  }
  return null;
}

function persist(state: BillingState) {
  if (state.source !== "local" || typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ plan: state.plan, used: state.used, period: state.period }));
}

export const useBilling = create<BillingState>((set, get) => ({
  source: "local",
  plan: "free",
  used: 0,
  allowance: PLANS.free.monthly,
  perRun: PLANS.free.perRun,
  period: "",
  loadLocal: () => {
    const period = currentPeriod();
    const raw = readStored();
    const plan = isPlan(raw?.plan) ? raw.plan : "free";
    const spec = PLANS[plan];
    const used = raw?.period === period && typeof raw.used === "number" ? Math.max(0, raw.used) : 0;
    const next = { source: "local" as const, plan, used, allowance: spec.monthly, perRun: spec.perRun, period };
    set(next);
    persist({ ...get(), ...next });
  },
  replace: (usage, source = "server") => set(fromUsage(usage, source)),
  apply: (usage) => set(fromUsage(usage, "server")),
  setPlan: async (plan) => {
    const ticket = ++planTicket;
    const prev = get();
    const spec = PLANS[plan];
    if (prev.source !== "server") {
      const next = { ...prev, plan, allowance: spec.monthly, perRun: spec.perRun, period: prev.period || currentPeriod() };
      set(next);
      persist({ ...get(), ...next });
      return;
    }
    set({ ...prev, plan, allowance: spec.monthly, perRun: spec.perRun });
    try {
      const usage = await api.setPlan(plan);
      if (ticket !== planTicket) return;
      set(fromUsage(usage, "server"));
    } catch (err) {
      if (ticket !== planTicket) return;
      set(prev);
      throw err;
    }
  },
  spendLocal: (words) => {
    const current = get();
    if (current.source !== "local") return;
    const period = currentPeriod();
    const used = (current.period === period ? current.used : 0) + Math.max(0, words);
    const next = { ...current, used, period, allowance: PLANS[current.plan].monthly, perRun: PLANS[current.plan].perRun };
    set(next);
    persist({ ...get(), ...next });
  },
}));

/** The usage numbers every screen shows, in one subscription. */
export function useBillingView(): BillingView {
  return useBilling(useShallow((state): BillingView => ({
    plan: state.plan,
    used: state.used,
    allowance: state.allowance,
    perRun: state.perRun,
    period: state.period,
  })));
}
