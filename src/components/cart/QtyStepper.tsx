"use client";

import clsx from "clsx";
import { FaMinus, FaPlus } from "react-icons/fa";

import { MAX_QTY } from "@/lib/cart";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  label: string;
  /** Allow going down to 0 (removes the line in the cart). */
  min?: number;
  className?: string;
};

export function QtyStepper({ value, onChange, label, min = 1, className }: Props) {
  const btn =
    "grid h-full min-h-10 w-10 place-items-center transition-colors duration-200 hover:bg-brand-lime active:bg-brand-orange disabled:opacity-25 disabled:hover:bg-transparent focus-visible:shadow-none focus-visible:-outline-offset-4";
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx("inline-flex h-11 items-stretch border-2 border-ink bg-white shadow-[3px_3px_0_#151314]", className)}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <FaMinus className="size-3" aria-hidden="true" />
      </button>
      <output aria-live="polite" className="grid w-9 place-items-center border-x-2 border-dashed border-ink/20 font-mono font-medium tabular-nums">
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Increase ${label}`}
      >
        <FaPlus className="size-3" aria-hidden="true" />
      </button>
    </div>
  );
}
