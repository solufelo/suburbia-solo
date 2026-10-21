import { FC } from "react";
import Link from "next/link";
import { asText, Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { FaArrowRight } from "react-icons/fa";

import { Heading, Kicker } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { MarkerNote } from "@/components/zine";
import { ProductCard } from "@/components/shop/ProductCard";
import type { SliceContext } from "@/slices/context";

export type ProductGridProps = SliceComponentProps<Content.ProductGridSlice, SliceContext>;

/**
 * Homepage board wall. Boards are fetched once on the server (see
 * app/(site)/page.tsx) and passed in through the slice context.
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

  const heading = asText(slice.primary.heading) || "Latest drop";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-texture relative overflow-hidden bg-paper py-[clamp(4rem,9vw,8rem)]"
    >
      <div className="wrap">
        <div className="grid items-end gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal>
              <Kicker index="01">The board wall</Kicker>
            </Reveal>
            <Reveal variant="mask" delay={0.05}>
              <Heading as="h2" size="xl" className="mt-4">
                {heading}
              </Heading>
            </Reveal>
          </div>
          <div className="md:col-span-4 md:pb-3">
            <Reveal delay={0.15}>
              <p className="lede max-w-[32ch] text-ink/80">
                Fresh off the press: {picked.length} completes, built and ready to roll. Add one in a tap, or open
                it in the builder and make it yours.
              </p>
            </Reveal>
            <Reveal variant="slap" delay={0.35} rotate={-4} className="mt-4 inline-block">
              <MarkerNote className="text-2xl text-brand-hot">every one&rsquo;s a complete</MarkerNote>
            </Reveal>
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,5vw,4.5rem)] grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 lg:grid-cols-4">
          {picked.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.08}>
              <ProductCard product={product} index={i} />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/boards"
            className="group flex min-h-11 items-center gap-3 font-display text-[1.8rem] uppercase leading-none"
          >
            <span className="link-hl">Shop every board</span>
            <FaArrowRight aria-hidden="true" className="size-5 transition-transform duration-300 ease-slap group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
