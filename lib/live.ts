"use client";

import type { GuestView, Usage } from "@/lib/api";
import { apiBase } from "@/lib/api";
import type { Sentence } from "@/lib/engine";
import type { Mode } from "@/lib/tokens";

export type LiveEvent = {
  op: "ready" | "progress" | "chunk" | "result" | "error";
  id?: string;
  phase?: string;
  score?: number;
  before?: number;
  label?: string;
  beforeLabel?: string;
  sentence?: Sentence;
  sentences?: Sentence[];
  original?: Sentence[];
  output?: string;
  chunk?: string;
  message?: string;
  code?: string;
  usage?: Usage;
  guest?: GuestView;
};

export class LiveError extends Error {
  code: string;
  guest?: GuestView;
  constructor(message: string, code = "", guest?: GuestView) {
    super(message);
    this.name = "LiveError";
    this.code = code;
    this.guest = guest;
  }
}

let onUsage: ((usage: Usage) => void) | null = null;

export function bindUsage(fn: ((usage: Usage) => void) | null) {
  onUsage = fn;
}

export function liveSocketURL() {
  const base = apiBase();
  if (base.startsWith("/")) {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${window.location.host}${base}/v1/live`;
  }
  return `${base.replace(/^http/i, "ws")}/v1/live`;
}

type Waiter = {
  onEvent: (ev: LiveEvent) => void;
  resolve: () => void;
  reject: (err: Error) => void;
  timer: number;
};

let socket: WebSocket | null = null;
let opening: Promise<WebSocket> | null = null;
const waiters = new Map<string, Waiter>();

function failAll(err: Error) {
  for (const [id, waiter] of waiters) {
    window.clearTimeout(waiter.timer);
    waiter.reject(err);
    waiters.delete(id);
  }
}

function attach(sock: WebSocket) {
  sock.onmessage = (event) => {
    let msg: LiveEvent;
    try {
      msg = JSON.parse(String(event.data)) as LiveEvent;
    } catch {
      return;
    }
    if (!msg.id || msg.op === "ready") return;
    const waiter = waiters.get(msg.id);
    if (!waiter) return;
    if (msg.op === "error") {
      window.clearTimeout(waiter.timer);
      waiters.delete(msg.id);
      waiter.reject(new LiveError(msg.message || "Humanora could not finish that", msg.code || "", msg.guest));
      return;
    }
    if (msg.usage) onUsage?.(msg.usage);
    waiter.onEvent(msg);
    if (msg.op === "result") {
      window.clearTimeout(waiter.timer);
      waiters.delete(msg.id);
      waiter.resolve();
    }
  };
  sock.onclose = () => {
    if (socket === sock) socket = null;
    failAll(new LiveError("Connection to Humanora dropped"));
  };
}

function connect(): Promise<WebSocket> {
  if (socket && socket.readyState === WebSocket.OPEN) return Promise.resolve(socket);
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    const sock = new WebSocket(liveSocketURL());
    attach(sock);
    const timer = window.setTimeout(() => {
      sock.close();
      if (opening) {
        opening = null;
        reject(new LiveError("Humanora is offline"));
      }
    }, 4000);
    sock.onopen = () => {
      window.clearTimeout(timer);
      socket = sock;
      opening = null;
      resolve(sock);
    };
    sock.onerror = () => {
      if (sock.readyState === WebSocket.OPEN) return;
      window.clearTimeout(timer);
      opening = null;
      reject(new LiveError("Humanora is offline"));
    };
  });
  return opening;
}

/** Drop the socket so the next job picks up a new session cookie. */
export function resetLive() {
  if (socket) {
    socket.onclose = null;
    socket.close();
  }
  socket = null;
  opening = null;
}

/** Open the live socket early so the first scan does not wait on a handshake. */
export function warmLive() {
  if (typeof window === "undefined") return;
  void connect().catch(() => {});
}

export async function liveJob(
  op: "scan" | "humanize",
  text: string,
  mode: Mode | undefined,
  onEvent: (ev: LiveEvent) => void,
  consent = false,
) {
  const sock = await connect();
  const id = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      waiters.delete(id);
      reject(new LiveError("Humanora took too long"));
    }, 130_000);
    waiters.set(id, { onEvent, resolve, reject, timer });
    sock.send(JSON.stringify({ op, id, text, mode, consent }));
  });
}
