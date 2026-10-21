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
    "grid size-9 place-items-center transition-colors hover:bg-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx("inline-flex items-center border-2 border-black bg-white", className)}
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
      <output aria-live="polite" className="w-8 text-center tabular-nums">
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
