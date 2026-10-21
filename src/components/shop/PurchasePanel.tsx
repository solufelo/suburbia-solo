"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClasses } from "@/components/ButtonLink";
import type { Product } from "@/lib/catalog";
import { designHref } from "@/lib/customizer-options";
import { QtyStepper } from "@/components/cart/QtyStepper";
import { AddToCartButton } from "./AddToCartButton";

export function PurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-8 flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-5">
        <QtyStepper value={qty} onChange={setQty} label="quantity" className="mr-2 h-12" />
        <AddToCartButton product={product} qty={qty} size="lg" />
      </div>
      {product.deck ? (
        <p className="text-sm">
          Want different wheels or hardware?{" "}
          <Link
            href={designHref({ deck: product.deck })}
            className={buttonClasses({ color: "lime", size: "sm", className: "ml-3 mt-2" })}
            data-testid="customize-link"
          >
            Customize this board
          </Link>
        </p>
      ) : null}
    </div>
  );
}
