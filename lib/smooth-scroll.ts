import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function bindLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Scroll the document. Dragging uses an immediate jump so the thumb stays under the pointer. */
export function scrollToY(y: number, immediate = false) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const top = Math.min(max, Math.max(0, y));
  if (lenis) {
    lenis.scrollTo(top, { immediate, force: true });
    return;
  }
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}
