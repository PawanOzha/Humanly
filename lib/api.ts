import type { Draft, PlanId } from "@/lib/workspace";

export type AccountUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "email";
};

export type Usage = {
  plan: PlanId;
  used: number;
  allowance: number;
  period: string;
  perRun: number;
};

export type Me = {
  ready: boolean;
  user: AccountUser | null;
  subscription: Usage | null;
  drafts?: Draft[];
};

export type GuestView = {
  signedIn?: boolean;
  used: number;
  allowance: number;
  left: number;
};

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function apiBase() {
  const configured = process.env.NEXT_PUBLIC_HUMANLY_API?.replace(/\/$/, "");
  if (configured) return configured;
  return "/api";
}

export function googleStartURL(next: string) {
  return `${apiBase()}/v1/auth/google?next=${encodeURIComponent(next)}`;
}

async function send<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : init?.headers),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) throw new ApiError(data.error || "Something went wrong.", res.status, data.code || "");
  return data as T;
}

export const api = {
  me: () => send<Me>("/v1/auth/me"),
  signup: (name: string, email: string, password: string) =>
    send<{ user: AccountUser; subscription: Usage; drafts?: Draft[] }>("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    send<{ user: AccountUser; subscription: Usage; drafts?: Draft[] }>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => send<void>("/v1/auth/logout", { method: "POST" }),
  setPlan: (plan: PlanId) =>
    send<Usage>("/v1/billing/plan", { method: "POST", body: JSON.stringify({ plan }) }),
  guest: () => send<GuestView>("/v1/guest"),
  drafts: () => send<{ drafts: Draft[] }>("/v1/drafts"),
  deleteDraft: (id: string) =>
    send<{ drafts: Draft[] }>(`/v1/drafts/${encodeURIComponent(id)}`, { method: "DELETE" }),
  saveDraft: (draft: Pick<Draft, "title" | "text" | "kind" | "score">) =>
    send<{ drafts: Draft[] }>("/v1/drafts", { method: "POST", body: JSON.stringify(draft) }),
};
