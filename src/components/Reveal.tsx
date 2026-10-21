"use client";

import clsx from "clsx";
import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** "up" (default) slides up, "slap" lands like a sticker, "mask" wipes a headline in. */
  variant?: "up" | "slap" | "mask";
  delay?: number;
  /** Resting rotation in degrees (stickers, taped photos). */
  rotate?: number;
  as?: "div" | "span" | "li" | "figure" | "section" | "p";
  className?: string;
  style?: CSSProperties;
};

/**
 * Plays a one-shot entrance when the element scrolls into view.
 * The hidden state only applies once `html.js` is set (layout.tsx), and
 * prefers-reduced-motion shows everything immediately (globals.css).
 */
export function Reveal({ children, variant = "up", delay = 0, rotate, as = "div", className, style }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.shown = "";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.shown = "";
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      "data-reveal": variant,
      className: clsx(variant === "mask" && "block", className),
      style: {
        ...style,
        ...(delay ? { "--reveal-delay": `${delay}s` } : null),
        ...(rotate ? { rotate: `${rotate}deg` } : null),
      } as CSSProperties,
    },
    children,
  );
}

/** Back-compat wrapper for slices that still import SlideIn. */
export function SlideIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <Reveal delay={delay} className={className}>
      {children}
    </Reveal>
  );
}
