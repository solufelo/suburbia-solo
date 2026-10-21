/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import type { CSSProperties } from "react";

import { DECKS } from "@/lib/customizer-options";

/** A hand of deck graphics fanned out like cards; spreads further on hover. */
export function DeckFan({ className, count = 7 }: { className?: string; count?: number }) {
  const decks = DECKS.slice(0, count);
  const mid = (decks.length - 1) / 2;
  return (
    <div aria-hidden="true" className={clsx("group/fan relative flex items-end justify-center", className)}>
      {decks.map((deck, i) => {
        const offset = i - mid;
        return (
          <img
            key={deck.id}
            src={deck.thumb}
            alt=""
            width={160}
            height={632}
            loading="lazy"
            className="-mx-[3.2%] h-auto w-[16%] origin-bottom drop-shadow-[6px_8px_0_rgba(21,19,20,0.35)] transition-transform duration-700 ease-snap [rotate:calc(var(--o)*7deg)] [translate:0_calc(var(--a)*0.9rem)] group-hover/fan:[rotate:calc(var(--o)*11deg)] group-hover/fan:[translate:calc(var(--o)*0.6rem)_calc(var(--a)*1.2rem)]"
            style={{ "--o": offset, "--a": Math.abs(offset) } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
