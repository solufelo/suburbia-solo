"use client";

import clsx from "clsx";

import { ButtonIcon, buttonClasses } from "@/components/ButtonLink";
import { useCart } from "@/contexts/CartContext";

export function CartButton({ className }: { className?: string }) {
  const { count, ready, open, isOpen } = useCart();
  const label = ready ? `Cart (${count} ${count === 1 ? "item" : "items"})` : "Cart";

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      data-testid="cart-button"
      className={buttonClasses({ color: "purple", className })}
    >
      <ButtonIcon icon="cart" />
      <span className="md:hidden" aria-hidden="true">
        {ready ? count : " "}
      </span>
      <span className="hidden md:inline" aria-hidden="true">
        Cart
        <span
          className={clsx(
            "ml-1 inline-block min-w-[2ch] tabular-nums transition-transform",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          ({count})
        </span>
      </span>
    </button>
  );
}
