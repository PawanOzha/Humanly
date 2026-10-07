"use client";

import { useEffect, useState } from "react";

export function useWide(px: number) {
  const [w, setW] = useState(true);
  useEffect(() => {
    const m = window.matchMedia(`(min-width:${px}px)`);
    const f = () => setW(m.matches); f();
    m.addEventListener("change", f); return () => m.removeEventListener("change", f);
  }, [px]);
  return w;
}
