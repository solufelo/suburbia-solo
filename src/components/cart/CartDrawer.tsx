"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { FaArrowRight, FaTimes, FaTrashAlt } from "react-icons/fa";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { MarkerNote } from "@/components/zine";
import { useCart } from "@/contexts/CartContext";
import { DECKS, describeDesign, designHref } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { LineThumb } from "./LineThumb";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, close, setQty, remove, lastAdded } = useCart();
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

  // A line only flashes if it was added in the last couple of seconds.
  const fresh = lastAdded && Date.now() - lastAdded.at < 2500 ? lastAdded : null;

  return (
    <div
      className={clsx("fixed inset-0 z-[100]", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        onClick={close}
        className={clsx(
          "absolute inset-0 bg-ink/55 backdrop-blur-[3px] transition-opacity duration-500",
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
          "bg-texture absolute inset-y-0 right-0 flex w-full max-w-[29rem] origin-bottom-right flex-col border-l-2 border-ink bg-paper shadow-[-10px_0_0_0_#151314] transition-[transform] duration-[650ms] ease-snap",
          isOpen ? "translate-x-0 rotate-0" : "translate-x-[112%] rotate-[4deg]",
        )}
      >
        <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
          <div className="flex items-center gap-3">
            <h2 id="cart-title" className="font-display t-sm uppercase">
              Your cart<span className="sr-only">, {count} {count === 1 ? "item" : "items"}</span>
            </h2>
            <span
              key={count}
              className={clsx(
                "grid h-8 min-w-8 place-items-center rounded-full border-2 border-ink bg-brand-lime px-1.5 font-mono text-sm font-medium tabular-nums",
                isOpen && "anim-pop",
              )}
              aria-hidden="true"
            >
              {count}
            </span>
          </div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close cart" className="icon-btn">
            <FaTimes aria-hidden="true" />
          </button>
        </header>
        <div aria-hidden="true" className="h-0.5 bg-ink" />

        {lines.length === 0 ? (
          <div className="flex grow flex-col items-center justify-center gap-6 px-8 text-center">
            <div className="relative h-44 w-full">
              {[DECKS[2], DECKS[1], DECKS[4]].map((d, i) => (
                <img
                  key={d.id}
                  src={d.thumb}
                  alt=""
                  width={160}
                  height={632}
                  className={clsx(
                    "absolute left-1/2 top-0 h-44 w-auto origin-bottom drop-shadow-[5px_6px_0_rgba(21,19,20,0.3)] transition-transform duration-700 ease-snap",
                    isOpen ? "" : "translate-y-8 opacity-0",
                  )}
                  style={{ translate: `${(i - 1) * 38 - 50}% 0`, rotate: `${(i - 1) * 14}deg`, transitionDelay: `${0.15 + i * 0.07}s` }}
                />
              ))}
            </div>
            <p className="font-display t-md uppercase">
              Nothing here <span className="riso">yet</span>
            </p>
            <p className="max-w-[30ch] text-ink/70">Grab a complete off the rack, or build one that is all yours.</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-5">
              <Link href="/boards" className={buttonClasses({ color: "orange", size: "sm" })}>
                Shop boards
              </Link>
              <Link href="/build" className={buttonClasses({ color: "lime", size: "sm" })}>
                Build your own
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grow overflow-y-auto overscroll-contain px-5 sm:px-6">
            {lines.map((line, i) => (
              <li
                key={line.key}
                data-testid="cart-line"
                className={clsx(
                  "-mx-2 flex gap-4 border-b-2 border-dashed border-ink/20 px-2 py-5",
                  isOpen && "anim-fade-up",
                )}
                style={{ "--d": `${0.12 + i * 0.06}s` } as CSSProperties}
              >
                <div
                  key={fresh?.key === line.key ? fresh.at : "still"}
                  className={clsx(
                    "relative grid h-28 w-20 shrink-0 place-items-center border-2 border-ink bg-white",
                    fresh?.key === line.key && "anim-flash",
                  )}
                >
                  <LineThumb line={line} className="h-24 w-12" />
                </div>
                <div className="flex min-w-0 grow flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-[1.45rem] uppercase leading-[0.95]">{line.name}</p>
                      <p className="mt-1.5 font-mono text-[0.7rem] leading-snug text-ink/60">
                        {line.kind === "custom" ? describeDesign(line.design) : "Complete board"}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-medium tabular-nums">
                      {formatPrice(line.unitPrice * line.qty)}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2">
                    <QtyStepper
                      value={line.qty}
                      min={1}
                      onChange={(q) => setQty(line.key, q)}
                      label={`quantity of ${line.name}`}
                    />
                    {line.kind === "custom" ? (
                      <Link
                        href={designHref(line.design)}
                        className="flex min-h-11 items-center px-1 font-mono text-xs font-medium uppercase tracking-widest"
                      >
                        <span className="link-hl">Edit</span>
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      aria-label={`Remove ${line.name}`}
                      className="ml-auto grid size-11 place-items-center text-ink/60 transition-[color,transform] duration-200 hover:-rotate-12 hover:text-brand-orange"
                    >
                      <FaTrashAlt aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            <li aria-hidden="true" className="py-6 text-center">
              <MarkerNote className="text-lg text-ink/45">that&rsquo;s the lot.</MarkerNote>
            </li>
            {lines.every((l) => l.kind !== "custom") ? (
              <li className="pb-6">
                <Link
                  href="/build"
                  className="group flex items-center gap-4 border-2 border-ink bg-ink py-3 pl-3 pr-5 text-paper shadow-[5px_6px_0_#d9f154] transition-transform duration-300 ease-slap hover:-translate-y-0.5 hover:-rotate-1 active:translate-y-0.5"
                >
                  <span aria-hidden="true" className="relative h-20 w-16 shrink-0">
                    {[DECKS[5], DECKS[0], DECKS[3]].map((d, i) => (
                      <img
                        key={d.id}
                        src={d.thumb}
                        alt=""
                        width={160}
                        height={632}
                        className="absolute left-1/2 top-0 h-20 w-auto origin-bottom transition-transform duration-500 ease-slap group-hover:[rotate:calc(var(--o)*18deg)]"
                        style={{ translate: `${(i - 1) * 40 - 50}% 0`, rotate: `${(i - 1) * 10}deg`, "--o": i - 1 } as CSSProperties}
                      />
                    ))}
                  </span>
                  <span className="grow">
                    <span className="block font-display text-[1.35rem] uppercase leading-none">Or build one from scratch</span>
                    <span className="mt-1.5 block font-mono text-[0.68rem] uppercase tracking-widest text-paper/60">
                      {DECKS.length} graphics · spin it in 3D
                    </span>
                  </span>
                  <FaArrowRight aria-hidden="true" className="size-4 shrink-0 text-brand-lime transition-transform duration-300 ease-slap group-hover:translate-x-1" />
                </Link>
              </li>
            ) : null}
          </ul>
        )}

        {lines.length > 0 ? (
          <footer className="relative border-t-2 border-ink bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
            <div className="flex items-baseline justify-between font-mono text-sm uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-display text-[2.4rem] normal-case leading-none tracking-normal tabular-nums" data-testid="cart-subtotal">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 font-mono text-[0.7rem] text-ink/55">Demo store: nothing is charged, taxed or shipped.</p>
            <Link
              href="/checkout"
              className={buttonClasses({
                color: "orange",
                size: "lg",
                className: "mx-4 mt-5 flex w-[calc(100%-2rem)] justify-center",
              })}
            >
              <ButtonIcon icon="cart" size="lg" />
              Checkout
            </Link>
            <button
              type="button"
              onClick={close}
              className="mt-3 flex min-h-11 w-full items-center justify-center font-mono text-xs font-medium uppercase tracking-widest"
            >
              <span className="link-hl">Keep shopping</span>
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
