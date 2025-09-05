import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicImage, SliceComponentProps, PrismicText } from "@prismicio/react";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import SkateboardProduct from "./SkateboardProduct";
import { isFilled } from "@prismicio/client";
import { createClient } from "@/lib/prismicio";
import { SlideIn } from "@/components/SlideIn";
  
/**
 * Props for `ProductGrid`.
 */
export type ProductGridProps = SliceComponentProps<Content.ProductGridSlice>;

/**
 * Component for "ProductGrid" Slices.
 */
const ProductGrid: FC<ProductGridProps> = ({ slice }) => {
  return (
    <Bounded
    data-slice-type={slice.slice_type}
    data-slice-variation={slice.variation}
    className="bg-texture"
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
      
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {slice.primary.product.map((skateboard, index) => (
          isFilled.contentRelationship(skateboard.skateboard) && (
            <SkateboardProduct key={index} id={skateboard.skateboard.id} />
          )
        ))}
      </div>
    </Bounded>
  );
};

export default ProductGrid;
