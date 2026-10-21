"use client";

import { useState } from "react";
import { asImageSrc } from "@prismicio/client";

import { Button } from "@/components/ButtonLink";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/catalog";

type Props = {
  product: Pick<Product, "uid" | "name" | "price" | "image">;
  qty?: number;
  size?: "sm" | "md" | "lg";
  /** Short "Add" label for tight tiles; the accessible name stays full. */
  compact?: boolean;
  className?: string;
  testId?: string;
};

export function AddToCartButton({ product, qty = 1, size = "md", compact = false, className, testId }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      icon="cart"
      size={size}
      color={added ? "lime" : "orange"}
      className={className}
      data-testid={testId ?? `add-${product.uid}`}
      aria-label={compact ? `Add ${product.name} to cart` : undefined}
      onClick={() => {
        add(
          {
            kind: "board",
            uid: product.uid,
            name: product.name,
            image: asImageSrc(product.image, { h: 400 }) ?? "",
            unitPrice: product.price,
          },
          qty,
        );
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <span aria-live="polite">{added ? "Added!" : compact ? "Add" : "Add to cart"}</span>
    </Button>
  );
}
