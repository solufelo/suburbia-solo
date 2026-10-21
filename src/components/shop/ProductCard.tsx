"use client";

import Link from "next/link";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { FaArrowRight } from "react-icons/fa";

import { designHref } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/catalog";
import { AddToCartButton } from "./AddToCartButton";

// Each card leans a little differently so a row reads like a pinned-up wall.
const LEAN = [-7, 5, -4, 8, -6, 4];

/**
 * Product tile used by the homepage grid, the shop index and "more boards":
 * the board taped over a swatch of its accent colour, a price sticker, and
 * Add to cart / Customize always visible (no hover-only controls).
 */
export function ProductCard({
  product,
  priority = false,
  index = 0,
}: {
  product: Product;
  priority?: boolean;
  index?: number;
}) {
  const lean = LEAN[index % LEAN.length];
  return (
    <article
      className="group relative flex h-full flex-col"
      data-testid="product-card"
      style={{ "--lean": `${lean}deg`, "--accent": product.accent } as CSSProperties}
    >
      <div className="relative aspect-[4/5] w-full">
        {/* Paint swatch in the board's accent colour. */}
        <div
          aria-hidden="true"
          className="absolute inset-[6%_4%] bg-[var(--accent)] transition-transform duration-500 ease-snap [mask-image:url(/Images/web/paint-background.webp)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [rotate:calc(var(--lean)*-0.6)] group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="halftone absolute inset-[14%_12%] text-ink/15 [mask-image:url(/Images/web/paint-background.webp)] [mask-size:100%_100%]"
        />
        <span aria-hidden="true" className="tape left-1/2 top-[3%] -translate-x-1/2 rotate-[-3deg]" />
        <span aria-hidden="true" className="absolute left-0 top-0 z-[2] font-mono text-xs font-medium text-ink/70">
          No.{String(index + 1).padStart(2, "0")}
        </span>

        <div className="absolute inset-0 flex items-center justify-center">
          <PrismicNextImage
            alt=""
            field={product.image}
            width={220}
            priority={priority}
            className="h-[86%] w-auto drop-shadow-[10px_14px_0_rgba(21,19,20,0.22)] transition-transform duration-700 ease-snap [rotate:var(--lean)] group-hover:-translate-y-2 group-hover:[rotate:calc(var(--lean)*0.2)] group-hover:scale-[1.03]"
          />
        </div>

        <span
          aria-hidden="true"
          className="sticker absolute -right-1 bottom-[10%] z-[2] size-[4.6rem] rotate-[10deg] rounded-full bg-brand-lime font-mono text-[0.95rem] font-medium tracking-tight transition-transform duration-500 ease-slap group-hover:rotate-[-4deg] group-hover:scale-110"
        >
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 border-t-2 border-ink pt-3">
        <h3 className="font-display t-xs uppercase leading-[0.95]">
          {/* Stretched link: the whole tile opens the product page. */}
          <Link
            href={product.href}
            className="after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:shadow-none focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:outline-offset-4 focus-visible:after:outline-ink"
          >
            {product.name}
          </Link>
        </h3>
        {/* Phones drop the label so two-up names stay on one line. */}
        <p className="shrink-0 pt-0.5 font-mono text-[0.7rem] uppercase tracking-widest text-ink/60">
          <span className="sr-only">Price: {formatPrice(product.price)}</span>
          <span aria-hidden="true" className="max-sm:hidden">
            {" "}
            Complete
          </span>
        </p>
      </div>

      {/* Pinned to the card's foot so a row's buttons line up even when a name wraps. */}
      <div className="relative z-[2] mt-auto flex flex-wrap items-center gap-x-6 gap-y-1 pt-3">
        <AddToCartButton product={product} size="sm" compact className="!ml-3.5 !mr-2" />
        <Link
          href={designHref({ deck: product.deck ?? undefined })}
          className={clsx(
            "group/c flex min-h-11 items-center gap-1.5 font-mono text-[0.78rem] font-medium uppercase tracking-widest",
          )}
        >
          <span className="link-hl">Customize</span>
          <FaArrowRight aria-hidden="true" className="size-3 transition-transform duration-300 ease-slap group-hover/c:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
