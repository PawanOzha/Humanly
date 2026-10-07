"use client";

import { create } from "zustand";
import { api, type GuestView } from "@/lib/api";
import { bootstrapAccount, useAuth } from "@/lib/stores/auth";

export const GUEST_WORDS = 500;

const CHOICE_KEY = "humanly.consent";
const COOKIE = "humanly_consent";

export type GuestChoice = "unknown" | "accepted" | "declined";
export type GuestGate = "words" | "login" | null;

type GuestState = {
  choice: GuestChoice;
  used: number;
  allowance: number;
  left: number;
  loaded: boolean;
  gate: GuestGate;
  choose: (choice: Exclude<GuestChoice, "unknown">) => void;
  refresh: () => Promise<void>;
  apply: (pass: GuestView, remote?: boolean) => void;
  open: (gate: Exclude<GuestGate, null>) => void;
  close: () => void;
};

let refreshTicket = 0;
let listening = false;
let channel: BroadcastChannel | null = null;

function readChoice(): GuestChoice {
  try {
    const value = localStorage.getItem(CHOICE_KEY);
    if (value === "accepted" || value === "declined") return value;
  } catch {
    /* private mode */
  }
  return "unknown";
}

function setCookie(choice: Exclude<GuestChoice, "unknown">) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${choice}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
}

function writeChoice(choice: Exclude<GuestChoice, "unknown">) {
  try {
    localStorage.setItem(CHOICE_KEY, choice);
  } catch {
    /* the cookie still travels with the request */
  }
  setCookie(choice);
}

function publish(message: { type: "choice"; choice: GuestChoice } | { type: "pass"; pass: GuestView }) {
  try {
    channel?.postMessage(message);
  } catch {
    /* another tab will refresh on focus */
  }
}

function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  try {
    channel = new BroadcastChannel("humanly-guest");
    channel.onmessage = (event) => {
      const data = event.data as { type?: string; choice?: GuestChoice; pass?: GuestView };
      if (data?.type === "choice" && (data.choice === "accepted" || data.choice === "declined")) {
        writeChoice(data.choice);
        useGuest.setState({ choice: data.choice });
        void useGuest.getState().refresh();
      }
      if (data?.type === "pass" && data.pass) useGuest.getState().apply(data.pass, true);
    };
  } catch {
    channel = null;
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== CHOICE_KEY) return;
    const choice = readChoice();
    if (choice === "unknown" || choice === useGuest.getState().choice) return;
    setCookie(choice);
    useGuest.setState({ choice });
    void useGuest.getState().refresh();
  });
  window.addEventListener("focus", () => {
    void useGuest.getState().refresh();
  });
}

export function hydrateGuest() {
  listen();
  const choice = readChoice();
  if (choice !== "unknown") {
    writeChoice(choice);
    useGuest.setState({ choice });
  }
  void useGuest.getState().refresh();
}

export function firstWords(text: string, count: number) {
  if (count < 1) return "";
  const pattern = /\S+/g;
  let seen = 0;
  let end = text.length;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    seen += 1;
    if (seen >= count) {
      end = match.index + match[0].length;
      break;
    }
  }
  return text.slice(0, end).trimEnd();
}

export const useGuest = create<GuestState>((set, get) => ({
  choice: "unknown",
  used: 0,
  allowance: 1,
  left: 1,
  loaded: false,
  gate: null,
  choose: (choice) => {
    writeChoice(choice);
    set({ choice });
    publish({ type: "choice", choice });
    void get().refresh();
  },
  refresh: async () => {
    const ticket = ++refreshTicket;
    const data = await api.guest().catch(() => null);
    if (ticket !== refreshTicket || !data) return;
    if (data.signedIn) {
      if (!useAuth.getState().user && useAuth.getState().status === "ready") void bootstrapAccount();
      return;
    }
    set({
      used: data.used || 0,
      allowance: data.allowance || 1,
      left: typeof data.left === "number" ? data.left : 0,
      loaded: true,
    });
  },
  apply: (pass, remote = false) => {
    if (pass.signedIn) return;
    refreshTicket += 1;
    set({
      used: pass.used || 0,
      allowance: pass.allowance || 1,
      left: typeof pass.left === "number" ? pass.left : 0,
      loaded: true,
    });
    if (!remote) publish({ type: "pass", pass });
  },
  open: (gate) => set({ gate }),
  close: () => set({ gate: null }),
}));
