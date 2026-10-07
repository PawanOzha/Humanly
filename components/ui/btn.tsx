"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE, INK, LINE } from "@/lib/tokens";

const MotionLink = motion.create(Link);

export function Btn({ children, onClick, variant = "primary", disabled, full, href }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "light"; disabled?: boolean; full?: boolean; href?: string;
}) {
  const s = variant === "primary" ? { background: INK, color: "#fff", border: `1px solid ${INK}` }
    : variant === "light" ? { background: "#fff", color: INK, border: "1px solid #fff" }
    : { background: "transparent", color: INK, border: `1px solid ${LINE}` };
  const motionProps = {
    whileHover: disabled ? undefined : { y: -1 },
    whileTap: disabled ? undefined : { scale: 0.985 },
    transition: { type: "tween" as const, duration: 0.16, ease: EASE },
    style: { ...s, width: full ? "100%" : undefined, padding: "12px 20px", borderRadius: 12, fontSize: 14.5, fontWeight: 500, fontFamily: "inherit", textDecoration: "none",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, display: "inline-flex" as const, alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap" as const },
  };
  if (href?.startsWith("/")) {
    return (
      <MotionLink href={href} onClick={onClick} {...motionProps}>
        {children}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a href={href} onClick={onClick} {...motionProps}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button onClick={onClick} disabled={disabled} {...motionProps}>
      {children}
    </motion.button>
  );
}
