"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { Draft, DraftKind } from "@/lib/workspace";

const KEY = "humanly.documents";
const LEGACY = "humanly.workspace";

type DocumentsState = {
  owner: string | null;
  drafts: Draft[];
  bind: (userId: string | null, local: boolean) => void;
  hydrate: (userId: string, drafts: Draft[]) => void;
  reloadLocal: () => void;
  save: (input: Omit<Draft, "id" | "at">) => Draft;
  remove: (id: string) => Promise<void>;
};

let ticket = 0;

function normalize(value: unknown): Draft[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Draft => {
      if (!item || typeof item !== "object") return false;
      const draft = item as Draft;
      return typeof draft.text === "string" && typeof draft.title === "string" && (draft.kind === "write" || draft.kind === "pdf");
    })
    .slice(0, 12);
}

function readLocal(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const direct = localStorage.getItem(KEY);
    if (direct) return normalize(JSON.parse(direct));
    const legacy = JSON.parse(localStorage.getItem(LEGACY) || "null") as { drafts?: unknown } | null;
    return normalize(legacy?.drafts);
  } catch {
    return [];
  }
}

function writeLocal(drafts: Draft[]) {
  localStorage.setItem(KEY, JSON.stringify(drafts));
}

export const useDocuments = create<DocumentsState>((set, get) => ({
  owner: null,
  drafts: [],
  bind: (userId, local) => {
    const mine = ++ticket;
    if (userId) {
      set({ owner: userId, drafts: [] });
      void api.drafts().then((data) => {
        if (mine !== ticket || get().owner !== userId) return;
        set({ drafts: normalize(data.drafts) });
      }).catch(() => {
        if (mine !== ticket || get().owner !== userId) return;
        set({ drafts: [] });
      });
      return;
    }
    if (local) {
      set({ owner: "local", drafts: readLocal() });
      return;
    }
    set({ owner: null, drafts: [] });
  },
  hydrate: (userId, drafts) => {
    if (get().owner !== userId) ticket += 1;
    set({ owner: userId, drafts: normalize(drafts) });
  },
  reloadLocal: () => {
    if (get().owner !== "local") return;
    set({ drafts: readLocal() });
  },
  save: (input) => {
    const owner = get().owner;
    const draft: Draft = {
      ...input,
      kind: input.kind as DraftKind,
      id: crypto.randomUUID(),
      at: Date.now(),
      text: input.text.slice(0, 12000),
    };
    const rest = get().drafts.filter((item) => !(item.kind === draft.kind && item.text === draft.text));
    if (owner === "local") {
      const drafts = [draft, ...rest].slice(0, 12);
      set({ drafts });
      try {
        writeLocal(drafts);
      } catch {
        /* storage is full or blocked; the list still lives in memory */
      }
      return draft;
    }
    if (!owner) return draft;
    const mine = ticket;
    const previous = get().drafts;
    set({ drafts: [draft, ...rest].slice(0, 12) });
    void api.saveDraft({ title: draft.title, text: draft.text, kind: draft.kind, score: draft.score }).then((data) => {
      if (mine !== ticket || get().owner !== owner) return;
      set({ drafts: normalize(data.drafts) });
    }).catch(() => {
      if (mine !== ticket || get().owner !== owner) return;
      set({ drafts: previous });
    });
    return draft;
  },
  remove: async (id) => {
    const owner = get().owner;
    const previous = get().drafts;
    const next = previous.filter((item) => item.id !== id);
    if (next.length === previous.length) return;
    set({ drafts: next });
    if (owner === "local") {
      try {
        writeLocal(next);
      } catch {
        /* keep the in-memory list */
      }
      return;
    }
    if (!owner) return;
    const mine = ticket;
    try {
      const data = await api.deleteDraft(id);
      if (mine !== ticket || get().owner !== owner) return;
      set({ drafts: normalize(data.drafts) });
    } catch (err) {
      if (mine === ticket && get().owner === owner) set({ drafts: previous });
      throw err;
    }
  },
}));

export function saveDraft(input: Omit<Draft, "id" | "at">) {
  return useDocuments.getState().save(input);
}

export function findDraft(id: string) {
  return useDocuments.getState().drafts.find((draft) => draft.id === id) ?? null;
}
