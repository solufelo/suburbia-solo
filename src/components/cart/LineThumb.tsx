/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";

import type { CartLine } from "@/lib/cart";
import { resolveDesign } from "@/lib/customizer-options";

/** Small picture of a cart line: the board photo, or the custom deck + parts. */
export function LineThumb({ line, className }: { line: CartLine; className?: string }) {
  if (line.kind === "board") {
    return (
      <div className={clsx("relative flex items-center justify-center", className)}>
        <img src={line.image} alt="" className="h-full w-auto -rotate-6 object-contain drop-shadow-md" />
      </div>
    );
  }

  const r = resolveDesign(line.design);
  return (
    <div className={clsx("relative flex items-center justify-center", className)}>
      <img src={r.deck.thumb} alt="" className="h-full w-auto -rotate-6 object-contain drop-shadow-md" />
      <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-white px-1 py-0.5 shadow ring-1 ring-black/10">
        <img src={r.wheel.texture} alt="" className="size-4 rounded-full object-cover" />
        <span className="size-3 rounded-full ring-1 ring-black/20" style={{ backgroundColor: r.truck.color }} />
        <span className="size-2 rounded-full ring-1 ring-black/20" style={{ backgroundColor: r.bolt.color }} />
      </div>
    </div>
  );
}
