"use client";

import { create } from "zustand";
import { api, type AccountUser, type Me, type Usage } from "@/lib/api";
import { useBilling } from "@/lib/stores/billing";
import { useDocuments } from "@/lib/stores/documents";
import { resetLive } from "@/lib/live";
import type { Draft } from "@/lib/workspace";

export type Session = AccountUser;

/**
 * Only who is signed in and how many words they have. Documents are never
 * written to browser storage for an account; they come from the server.
 */
const CACHE = "humanly.account";

type CachedAccount = {
  user: Session;
  subscription: Usage;
};

type AuthState = {
  status: "loading" | "ready";
  /** The server has accounts switched on. */
  configured: boolean;
  /** The server could not be reached and nobody is signed in. */
  offline: boolean;
  user: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

/**
 * `epoch` moves whenever the signed-in account changes on purpose. A check of
 * the session that began before the change is stale and is dropped, so a slow
 * `/me` can never undo a sign-in or bring a signed-out account back.
 */
let epoch = 0;
/** Only the newest check of the session is allowed to land. */
let checkSeq = 0;
let lastCheck = 0;

function remember(account: CachedAccount) {
  try {
    sessionStorage.setItem(CACHE, JSON.stringify(account));
  } catch {
    /* the session still lives in the cookie */
  }
}

function forget() {
  try {
    sessionStorage.removeItem(CACHE);
  } catch {
    /* ignore */
  }
}

export function applyCachedAccount() {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.parse(sessionStorage.getItem(CACHE) || "null") as CachedAccount | null;
    if (!raw?.user?.id || !raw.subscription) return;
    useBilling.getState().replace(raw.subscription, "server");
    useDocuments.getState().hydrate(raw.user.id, []);
    useAuth.setState({ status: "ready", configured: true, offline: false, user: raw.user });
  } catch {
    forget();
  }
}

function showAccount(user: Session, subscription: Usage, drafts: Draft[]) {
  if (useAuth.getState().user?.id !== user.id) resetLive();
  useBilling.getState().replace(subscription, "server");
  useDocuments.getState().hydrate(user.id, drafts);
  useAuth.setState({ status: "ready", configured: true, offline: false, user });
  remember({ user, subscription });
}

function showGuest(configured: boolean, offline = false) {
  if (useAuth.getState().user) resetLive();
  forget();
  useBilling.getState().loadLocal();
  useDocuments.getState().bind(null, !configured);
  useAuth.setState({ status: "ready", configured, offline, user: null });
}

export const useAuth = create<AuthState>(() => ({
  status: "loading",
  configured: false,
  offline: false,
  user: null,
  login: async (email, password) => {
    const mine = ++epoch;
    const data = await api.login(email, password);
    if (mine !== epoch) return;
    epoch += 1;
    showAccount(data.user, data.subscription, data.drafts || []);
  },
  signup: async (name, email, password) => {
    const mine = ++epoch;
    const data = await api.signup(name, email, password);
    if (mine !== epoch) return;
    epoch += 1;
    showAccount(data.user, data.subscription, data.drafts || []);
  },
  logout: async () => {
    const mine = ++epoch;
    await api.logout().catch(() => undefined);
    if (mine !== epoch) return;
    epoch += 1;
    showGuest(true);
  },
}));

export function useSession() {
  return useAuth((state) => state.user);
}

function settle(me: Me) {
  if (me.user && me.subscription) {
    showAccount(me.user, me.subscription, me.drafts || []);
    return;
  }
  showGuest(me.ready);
}

/** Ask the server who is signed in. Safe to call as often as you like. */
export async function bootstrapAccount() {
  const mine = ++checkSeq;
  const at = epoch;
  lastCheck = Date.now();
  const me = await api.me().catch(() => null);
  if (mine !== checkSeq || at !== epoch) return;
  if (!me) {
    // The server did not answer. Keep whoever is shown; otherwise say so.
    if (useAuth.getState().user) {
      useAuth.setState({ status: "ready", configured: true, offline: false });
      return;
    }
    showGuest(false, true);
    return;
  }
  settle(me);
}

/** Re-check when the window returns, but not on every flicker of focus. */
export function refreshAccount() {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  if (Date.now() - lastCheck < 20_000) return;
  void bootstrapAccount();
}
