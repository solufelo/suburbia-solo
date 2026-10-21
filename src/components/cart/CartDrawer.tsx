"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FaTimes } from "react-icons/fa";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { HorizontalLine } from "@/components/Line";
import { useCart } from "@/contexts/CartContext";
import { describeDesign, designHref } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { LineThumb } from "./LineThumb";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, close, setQty, remove } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close when the route changes (e.g. after clicking Checkout).
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Keep Tab inside the drawer while it is open.
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, close]);

  return (
    <div
      className={clsx("fixed inset-0 z-[100]", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        onClick={close}
        className={clsx(
          "absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        data-testid="cart-drawer"
        className={clsx(
          "bg-texture absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l-4 border-black bg-brand-gray shadow-[-12px_0_0_0_rgba(0,0,0,0.85)] transition-transform duration-500 ease-[cubic-bezier(.2,.9,.25,1)]",
          isOpen ? "translate-x-0" : "translate-x-[110%]",
        )}
      >
        <header className="flex items-center justify-between gap-4 px-6 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
          <h2 id="cart-title" className="font-bowlby text-3xl uppercase leading-none">
            Your cart
            <span className="ml-3 inline-grid min-w-8 -translate-y-1 rotate-3 place-items-center bg-brand-lime px-2 py-1 align-middle text-base ring-2 ring-black">
              {count}
            </span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="grid size-10 place-items-center border-2 border-black bg-white transition hover:-rotate-6 hover:bg-brand-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </header>
        <HorizontalLine className="h-2 w-full stroke-2 text-black" />

        {lines.length === 0 ? (
          <div className="flex grow flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="font-bowlby text-4xl uppercase leading-none">
              Nothing here
              <br />
              <span className="text-brand-orange">yet</span>
            </p>
            <p className="max-w-[30ch] text-zinc-600">
              Grab a complete from the latest drop, or build one that is all yours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/boards" className={buttonClasses({ color: "orange", size: "sm" })}>
                Shop boards
              </Link>
              <Link href="/build" className={buttonClasses({ color: "lime", size: "sm" })}>
                Build your own
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grow divide-y-2 divide-dashed divide-zinc-300 overflow-y-auto overscroll-contain px-6">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-5" data-testid="cart-line">
                <LineThumb line={line} className="h-28 w-14 shrink-0" />
                <div className="flex min-w-0 grow flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bowlby text-lg leading-tight">{line.name}</p>
                      <p className="mt-1 text-xs leading-snug text-zinc-600">
                        {line.kind === "custom" ? describeDesign(line.design) : "Complete board"}
                      </p>
                    </div>
                    <p className="shrink-0 tabular-nums">{formatPrice(line.unitPrice * line.qty)}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                    <QtyStepper
                      value={line.qty}
                      min={1}
                      onChange={(q) => setQty(line.key, q)}
                      label={`quantity of ${line.name}`}
                    />
                    {line.kind === "custom" ? (
                      <Link href={designHref(line.design)} className="text-sm underline underline-offset-4 hover:text-brand-orange">
                        Edit
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      className="text-sm underline underline-offset-4 hover:text-brand-orange"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 ? (
          <footer className="border-t-4 border-black bg-white/70 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-baseline justify-between">
              <span className="font-bowlby text-xl uppercase">Subtotal</span>
              <span className="font-bowlby text-2xl tabular-nums" data-testid="cart-subtotal">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-600">Demo store: no shipping or tax is charged.</p>
            <Link
              href="/checkout"
              className={buttonClasses({ color: "orange", size: "lg", className: "mx-4 mt-5 flex w-[calc(100%-2rem)] justify-center" })}
            >
              <ButtonIcon icon="cart" size="lg" />
              Checkout
            </Link>
            <button
              type="button"
              onClick={close}
              className="mt-4 w-full text-center text-sm underline underline-offset-4 hover:text-brand-orange"
            >
              Keep shopping
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
