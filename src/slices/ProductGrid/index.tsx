import { FC } from "react";
import Link from "next/link";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps, PrismicText, PrismicRichText } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { SlideIn } from "@/components/SlideIn";
import { ProductCard } from "@/components/shop/ProductCard";
import type { SliceContext } from "@/slices/context";

/**
 * Props for `ProductGrid`.
 */
export type ProductGridProps = SliceComponentProps<Content.ProductGridSlice, SliceContext>;

/**
 * Component for "ProductGrid" Slices.
 * Boards are fetched once on the server (see app/(site)/page.tsx) and passed
 * in through the slice context, so the grid renders with the page.
 */
const ProductGrid: FC<ProductGridProps> = ({ slice, context }) => {
  const products = context?.products ?? [];
  const picked = slice.primary.product
    .map((item) => {
      const link = item.skateboard;
      if (!isFilled.contentRelationship(link)) return undefined;
      return products.find((p) => p.id === link.id);
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-texture bg-brand-gray"
    >
      <SlideIn>
        <Heading className="text-center ~mb-4/6" as="h2">
          <PrismicText field={slice.primary.heading} />
        </Heading>
      </SlideIn>

      <SlideIn>
        <div className="text-center ~mb-6/10">
          <PrismicRichText field={slice.primary.body} />
        </div>
      </SlideIn>

      <div className="grid w-full grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {picked.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <p className="mt-12 text-center">
        <Link href="/boards" className="underline decoration-brand-orange decoration-4 underline-offset-8 ~text-base/lg hover:text-brand-purple">
          Shop every board
        </Link>
      </p>
    </Bounded>
  );
};

export default ProductGrid;
