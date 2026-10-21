"use client";

import Link from "next/link";
import clsx from "clsx";
import { PrismicNextImage } from "@prismicio/next";

import { buttonClasses } from "@/components/ButtonLink";
import { HorizontalLine, VerticalLine } from "@/components/Line";
import { Scribble } from "@/slices/ProductGrid/Scribble";
import { designHref } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/catalog";
import { AddToCartButton } from "./AddToCartButton";

const VERTICAL_LINE_STROKE =
  "absolute top-0 h-full stroke-2 text-stone-300 transition-colors duration-300 group-hover:text-stone-400";
// Overlay buttons only take clicks while the overlay is visible.
const REVEAL =
  "[@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-focus-within:pointer-events-auto";
const HORIZONTAL_LINE_STROKE =
  "-mx-8 stroke-2 text-stone-300 transition-colors duration-300 group-hover:text-stone-400";

/**
 * Product tile used by the homepage grid, the shop index and "more boards".
 * The whole tile opens the product page; on hover (or always, on touch
 * screens) it offers Add to cart and Customise.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group relative mx-auto w-full max-w-72 px-8" data-testid="product-card">
      <HorizontalLine className={HORIZONTAL_LINE_STROKE} />
      <VerticalLine className={clsx(VERTICAL_LINE_STROKE, "left-4")} />
      <VerticalLine className={clsx(VERTICAL_LINE_STROKE, "right-4")} />

      <div className="flex items-center justify-between ~text-sm/2xl">
        <span className="tabular-nums">{formatPrice(product.price)}</span>
        <span className="-rotate-2 bg-zinc-900 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-white">
          Complete
        </span>
      </div>

      <div className="-mb-1 flex justify-center overflow-hidden py-4">
        <Scribble className="absolute inset-0 h-full w-full" color={product.accent} />
        <PrismicNextImage
          alt=""
          field={product.image}
          width={150}
          priority={priority}
          className="mx-auto w-[58%] origin-top transform-gpu transition-transform duration-500 group-hover:scale-150"
        />
      </div>

      <HorizontalLine className={HORIZONTAL_LINE_STROKE} />

      <h3 className="my-2 text-center font-bowlby leading-tight ~text-lg/xl">
        {/* Stretched link: the whole tile opens the product page. */}
        <Link href={product.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-black">
          {product.name}
        </Link>
      </h3>

      {/* Hover overlay on devices with a mouse; a plain row on touch screens.
          The overlay itself never takes clicks (so the tile link still works);
          only its buttons do, and only while it is shown. */}
      <div
        className={clsx(
          "relative z-10 flex flex-col items-center gap-3 pb-4 pt-1",
          "[@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:absolute [@media(hover:hover)]:inset-0 [@media(hover:hover)]:justify-center [@media(hover:hover)]:p-0",
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-200",
          "[@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
        )}
      >
        <AddToCartButton product={product} size="sm" className={REVEAL} />
        <Link
          href={designHref({ deck: product.deck ?? undefined })}
          className={buttonClasses({ color: "lime", size: "sm", className: REVEAL })}
        >
          Customize
        </Link>
      </div>
    </article>
  );
}
