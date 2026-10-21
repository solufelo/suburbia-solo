"use client";

import { useEffect, useState } from "react";

import { Logo } from "./Logo";

// First paint is left alone (nothing should sit between a visitor and the
// content); every in-app navigation after that gets the wipe.
let hasNavigated = false;

/**
 * Page transition: a torn sheet of ink covers the new page for a beat and
 * tears away upwards. Pointer-transparent, skipped for reduced motion.
 */
export function PageWipe() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasNavigated) {
      hasNavigated = true;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div
      aria-hidden="true"
      className="torn-bottom pointer-events-none fixed inset-x-0 -top-4 z-[120] grid h-[calc(100%+2rem)] place-items-center bg-ink [animation:wipe-up_0.8s_0.08s_var(--ease-snap)_both]"
    >
      <Logo className="h-20 w-auto text-brand-lime [animation:slap_0.4s_var(--ease-slap)_both] md:h-28" />
    </div>
  );
}
