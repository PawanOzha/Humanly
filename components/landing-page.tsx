"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { FooterReveal } from "@/components/layout/footer-reveal";
import { Navbar } from "@/components/layout/navbar";
import { ScrollBar } from "@/components/layout/scroll-bar";
import { Api } from "@/components/sections/api";
import { Compare } from "@/components/sections/compare";
import { FAQ } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Marquee } from "@/components/sections/marquee";
import { Pricing } from "@/components/sections/pricing";
import { Statement } from "@/components/sections/statement";
import { Tool } from "@/components/sections/tool";
import { bindLenis } from "@/lib/smooth-scroll";

function pinToTop(lenis: Lenis | null) {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.closest("#tool")) active.blur();
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function LandingPage() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const reloaded = nav?.type === "reload";
    if (reloaded && location.hash) history.replaceState(null, "", location.pathname + location.search);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (reloaded) {
        pinToTop(null);
        const timers = [0, 80, 240].map((ms) => window.setTimeout(() => pinToTop(null), ms));
        return () => timers.forEach(clearTimeout);
      }
      return;
    }
    const lenis = new Lenis({
      lerp: 0.1,
      anchors: true,
      overscroll: false,
      naiveDimensions: true,
      syncTouch: false,
      stopInertiaOnNavigate: true,
      prevent: (node) => {
        const scroller = node.closest("[data-lenis-prevent]");
        return !!scroller && scroller.scrollHeight > scroller.clientHeight + 2;
      },
    });
    bindLenis(lenis);
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    let detachPin = () => {};
    if (reloaded) {
      pinToTop(lenis);
      const onFocus = (event: FocusEvent) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("#tool")) pinToTop(lenis);
      };
      document.addEventListener("focusin", onFocus, true);
      const timers = [0, 80, 240].map((ms) => window.setTimeout(() => pinToTop(lenis), ms));
      const stop = window.setTimeout(() => {
        document.removeEventListener("focusin", onFocus, true);
      }, 700);
      detachPin = () => {
        document.removeEventListener("focusin", onFocus, true);
        timers.forEach(clearTimeout);
        clearTimeout(stop);
      };
    }

    return () => {
      detachPin();
      cancelAnimationFrame(id);
      bindLenis(null);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="hm-root">
      <ScrollBar />
      <Navbar />
      <Hero />
      <Tool />
      <Marquee />
      <Compare />
      <Statement />
      <HowItWorks />
      <Features />
      <Api />
      <Pricing />
      <FAQ />
      <FooterReveal />
    </div>
  );
}
