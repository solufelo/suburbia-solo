"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

import { useCart } from "@/contexts/CartContext";

/**
 * Header cart: an ink ticket with a lime count sticker that pops whenever
 * something lands in the cart.
 */
export function CartButton({ className, tone = "ink" }: { className?: string; tone?: "ink" | "lime" }) {
  const { count, ready, open, isOpen } = useCart();
  const label = ready ? `Cart (${count} ${count === 1 ? "item" : "items"})` : "Cart";

  // Pop the badge when the count goes up (not on first load).
  const prev = useRef<number | null>(null);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (!ready) return;
    if (prev.current !== null && count > prev.current) setBump((b) => b + 1);
    prev.current = count;
  }, [count, ready]);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      data-testid="cart-button"
      className={clsx(
        "group relative flex h-11 items-center gap-2.5 border-2 border-ink pl-3 pr-4 shadow-[3px_3px_0_#151314] transition-[transform,box-shadow] duration-200 ease-snap hover:-rotate-2 hover:shadow-[1px_1px_0_#151314] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        tone === "ink" ? "bg-ink text-paper" : "bg-brand-lime text-ink",
        className,
      )}
    >
      <FaShoppingCart
        aria-hidden="true"
        key={`icon-${bump}`}
        className={clsx("size-[1.1rem]", bump > 0 && "anim-wiggle")}
      />
      <span aria-hidden="true" className="font-display hidden text-[1.3rem] uppercase leading-none sm:inline">
        Cart
      </span>
      <span
        aria-hidden="true"
        key={`badge-${bump}`}
        className={clsx(
          "absolute -right-3 -top-3 grid h-7 min-w-7 place-items-center rounded-full border-2 border-ink px-1 font-mono text-[0.8rem] font-medium tabular-nums leading-none transition-opacity",
          tone === "ink" ? "bg-brand-lime text-ink" : "bg-ink text-brand-lime",
          ready ? "opacity-100" : "opacity-0",
          // Empty cart: no "0" sticker at all.
          count === 0 && "!opacity-0",
          bump > 0 && "anim-pop",
        )}
      >
        {ready ? count : 0}
      </span>
    </button>
  );
}
