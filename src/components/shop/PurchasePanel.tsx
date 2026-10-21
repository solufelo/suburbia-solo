"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaSlidersH } from "react-icons/fa";

import type { Product } from "@/lib/catalog";
import { designHref } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { QtyStepper } from "@/components/cart/QtyStepper";
import { AddToCartButton } from "./AddToCartButton";

export function PurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const [offscreen, setOffscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Phones: once the main buy row scrolls away, a bar keeps Add to cart under the thumb.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setOffscreen(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={ref} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-5">
          <QtyStepper value={qty} onChange={setQty} label="quantity" className="mr-1 h-14" />
          <AddToCartButton product={product} qty={qty} size="lg" />
        </div>
        {product.deck ? (
          <Link
            href={designHref({ deck: product.deck })}
            className="group flex min-h-11 items-center gap-3 self-start"
            data-testid="customize-link"
          >
            <span className="grid size-10 place-items-center border-2 border-ink bg-brand-lime transition-transform duration-300 ease-slap group-hover:-rotate-12">
              <FaSlidersH aria-hidden="true" className="size-4" />
            </span>
            <span>
              <span className="font-display block text-[1.35rem] uppercase leading-none">Customize this board</span>
              <span className="block text-sm text-ink/60">Swap wheels, trucks and bolts in 3D</span>
            </span>
          </Link>
        ) : null}
      </div>

      {/* Portalled to <body>: an animated (transformed) ancestor would trap position: fixed. */}
      {mounted ? createPortal(
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-500 ease-snap lg:hidden",
          offscreen ? "translate-y-0" : "pointer-events-none translate-y-[110%]",
        )}
        aria-hidden={!offscreen}
        inert={!offscreen}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display truncate text-[1.4rem] uppercase leading-none">{product.name}</p>
            <p className="mt-1 font-mono text-sm tabular-nums">{formatPrice(product.price)}</p>
          </div>
          <AddToCartButton product={product} qty={qty} size="md" testId={`sticky-add-${product.uid}`} className="!mr-3 shrink-0" />
        </div>
      </div>,
        document.body,
      ) : null}
    </>
  );
}
