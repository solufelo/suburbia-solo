import { Content } from "@prismicio/client";
import {
  PrismicRichText,
  PrismicText,
  SliceComponentProps,
} from "@prismicio/react";
import clsx from "clsx";

import { Bounded } from "@/components/Bounded";
import { ButtonLink } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";
import { ParallaxImage } from "./ParallaxImage";
import { SlideIn } from "@/components/SlideIn";

declare module "react" {
  interface CSSProperties {
    "--index"?: number;
  }
}

/**
 * Props for `TextAndImage`.
 */
export type TextAndImageProps = SliceComponentProps<Content.TextAndImageSlice>;

/**
 * Component for "TextAndImage" Slices.
 */
const TextAndImage = ({ slice, index }: TextAndImageProps & { index?: number }) => {
  const theme = slice.primary.theme;
  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={clsx(
        "sticky top-[calc(var(--index)*2rem)]",
        theme === "Blue" && "bg-texture bg-brand-blue text-white",
        theme === "Orange" && "bg-texture bg-brand-orange text-white",
        theme === "Navy" && "bg-texture bg-brand-navy text-white",
        theme === "Lime" && "bg-texture bg-brand-lime"
      )}
      style={{ "--index": index }}
    >
      {/* Container div for the entire slice with parallax effect */}
      <div className="relative w-full h-full">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2 md:gap-24 md:items-center">
          {/* Text content - hidden on mobile, shown on desktop */}
          <div
            className={clsx(
              "hidden md:flex flex-col items-center gap-8 text-center md:items-start md:text-left",
              slice.variation === "imgOnLeft" && "md:order-2"
            )}
          >
            <SlideIn>

            <Heading size="lg" as="h2">
              <PrismicText field={slice.primary.heading} />
            </Heading>
            </SlideIn>
            <SlideIn>
              
            <div className="max-w-md text-lg leading-relaxed">
              <PrismicRichText field={slice.primary.body} />
            </div>
            </SlideIn>
            <SlideIn>

            <ButtonLink
              field={slice.primary.button}
              color={theme === "Lime" ? "orange" : "lime"}
              >
              {slice.primary.button.text}
            </ButtonLink>
              </SlideIn>
          </div>

          {/* Image container with parallax effect */}
          <div className="w-full relative">
            <ParallaxImage
              foregroundImage={slice.primary.foregroundimg}
              backgroundImage={slice.primary.bg_img}
            />
          </div>

          {/* Mobile text and button - shown below image on mobile */}
          <div className="md:hidden flex flex-col items-center gap-3 text-center px-4 pb-4">
            <Heading size="lg" as="h2">
              <PrismicText field={slice.primary.heading} />
            </Heading>
            <div className="max-w-md text-sm leading-relaxed">
              <PrismicRichText field={slice.primary.body} />
            </div>
            <ButtonLink
              field={slice.primary.button}
              color={theme === "Lime" ? "orange" : "lime"}
            >
              {slice.primary.button.text}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Bounded>
  );
};

export default TextAndImage;