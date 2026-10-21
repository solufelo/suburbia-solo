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
  className?: string;
};

export function AddToCartButton({ product, qty = 1, size = "md", className }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      icon="cart"
      size={size}
      color="orange"
      className={className}
      data-testid={`add-${product.uid}`}
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
      <span aria-live="polite">{added ? "Added!" : "Add to cart"}</span>
    </Button>
  );
}
