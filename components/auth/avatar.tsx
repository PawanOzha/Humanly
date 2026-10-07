"use client";

import { useState } from "react";
import type { Session } from "@/lib/session";
import { INK } from "@/lib/tokens";

export function Avatar({ session, size = 28 }: { session: Session; size?: number }) {
  const [broken, setBroken] = useState(false);
  const initial = session.name.trim().charAt(0).toUpperCase() || "H";
  if (session.picture && !broken) {
    return (
      <img
        src={session.picture}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#d4f26a",
        color: INK,
        display: "grid",
        placeItems: "center",
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}
