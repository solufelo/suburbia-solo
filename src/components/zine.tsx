/**
 * Zine kit: the small collage pieces that give Suburbia its look.
 * All decorative pieces are aria-hidden; real text stays real text.
 */
import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

import { ransomTiles } from "@/lib/zine";

/** Round or star sticker with die-cut border. */
export function Sticker({
  children,
  shape = "circle",
  color = "lime",
  rotate = 0,
  className,
  style,
  animate,
  delay = 0,
}: {
  children: ReactNode;
  shape?: "circle" | "star" | "rect";
  color?: "lime" | "pink" | "orange" | "blue" | "paper" | "ink";
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  /** Slap the sticker on at first paint (CSS animation, reduced-motion safe). */
  animate?: boolean;
  delay?: number;
}) {
  const bg = {
    lime: "bg-brand-lime text-ink",
    pink: "bg-brand-hot text-ink",
    orange: "bg-brand-orange text-ink",
    blue: "bg-brand-blue text-white",
    paper: "bg-paper text-ink",
    ink: "bg-ink text-brand-lime",
  }[color];
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "sticker select-none text-center",
        shape === "circle" && "rounded-full",
        shape === "rect" && "px-3 py-2",
        shape === "star" && "!border-0 ![box-shadow:none] [filter:drop-shadow(0_0_0_#fff)_drop-shadow(5px_6px_0_rgba(0,0,0,.85))]",
        animate && "anim-slap",
        shape !== "star" && bg,
        className,
      )}
      style={{ ...style, "--r": `${rotate}deg`, rotate: animate ? undefined : `${rotate}deg`, "--d": `${delay}s` } as CSSProperties}
    >
      {shape === "star" ? (
        <span
          className={clsx("grid size-full place-items-center p-[18%]", bg)}
          style={{
            clipPath:
              "polygon(50% 0,61% 18%,82% 8%,80% 30%,100% 38%,85% 54%,98% 74%,76% 76%,70% 98%,52% 84%,32% 100%,27% 78%,4% 76%,15% 56%,0 38%,20% 30%,17% 8%,39% 17%)",
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </span>
  );
}

/** Endless ticker strip. Duplicated once for a seamless loop. */
export function Marquee({
  items,
  className,
  speed = 38,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <StarGlyph className="size-5 shrink-0" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={clsx("marquee relative flex overflow-hidden", className)}>
      <div className="marquee-track flex w-max" style={{ "--marquee-speed": `${speed}s` } as CSSProperties}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function StarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 0l2.6 8.2L23 7l-6.6 5.5L21 20l-7.6-3.8L9 24l-1-8.6L0 13.4 7.4 9.6 5.3 1.5l5.2 6.3z" />
    </svg>
  );
}

/**
 * A word cut out of magazine scraps. Screen readers get the plain word;
 * the tiles are decoration. `animate` drops the tiles in at first paint.
 */
export function RansomWord({
  word,
  className,
  tileClassName,
  animate = false,
  baseDelay = 0,
}: {
  word: string;
  className?: string;
  tileClassName?: string;
  animate?: boolean;
  baseDelay?: number;
}) {
  const tiles = ransomTiles(word);
  return (
    <span className={clsx("relative inline-block", className)}>
      <span className="sr-only">{word}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap items-end">
        {tiles.map((t, i) =>
          t.char === " " ? (
            <span key={i} className="inline-block w-[0.25em]" />
          ) : (
            <span
              key={i}
              className={clsx(
                "relative mx-[0.015em] inline-block px-[0.06em] pb-[0.02em] pt-[0.1em] leading-[0.82] shadow-[0.04em_0.05em_0_rgba(0,0,0,0.85)]",
                t.className,
                animate && "anim-tile",
                tileClassName,
              )}
              style={
                {
                  "--r": `${t.rotate}deg`,
                  rotate: animate ? undefined : `${t.rotate}deg`,
                  "--d": `${baseDelay + i * 0.05}s`,
                  translate: `0 ${t.shift}em`,
                } as CSSProperties
              }
            >
              {t.char}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

/** Hand-drawn arrow for marker notes. Draws itself in once. */
export function ScribbleArrow({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 70"
      fill="none"
      aria-hidden="true"
      className={clsx(className, flip && "-scale-x-100")}
    >
      <path
        d="M4 10c18 30 52 46 98 40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:1] [animation:draw_.9s_.9s_var(--ease-snap)_forwards]"
      />
      <path
        d="M88 36l16 14-20 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:1] [animation:draw_.35s_1.6s_var(--ease-snap)_forwards]"
      />
    </svg>
  );
}

/** Marker scrawl in the margins. */
export function MarkerNote({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx("font-marker leading-tight", className)}>{children}</span>;
}
