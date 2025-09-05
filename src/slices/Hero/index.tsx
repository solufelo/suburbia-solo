import { FC } from "react";
import { Content, asImageSrc } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText, PrismicText } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { ButtonLink } from "@/components/ButtonLink";
import { WideLogo } from "./WideLogo";
import { TallLogo } from "./TallLogo";
import { InteractiveSkateboard } from "./InteractiveSkateboard";
import { useSkateboard } from "@/contexts/SkateboardContext";

const DEFAULT_DECK_TEXTURE = "/skateboard/Deck.webp";
const DEFAULT_WHEEL_TEXTURE = "/skateboard/SkateWheel1.png";
const DEFAULT_TRUCK_COLOR = "#6F6E6A";
const DEFAULT_BOLT_COLOR = "#6F6E6A";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  // Use dynamic skateboard customization from context
  const { customization } = useSkateboard();
  
  const deckTextureURLs = [
    customization.deckTextureURL,
    // Add more textures here for multiple overlays
  ];
  const deckTextureURL = deckTextureURLs[0];
  
  const wheelTextureURLs = [
    customization.wheelTextureURL,
  ];
  const wheelTextureURL = wheelTextureURLs[0];
  
  const truckColor = customization.truckColor;
  const boltColor = customization.boltColor;

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-brand-pink relative min-h-[110vh] overflow-hidden text-zinc-800 bg-texture"
    >
      <div className="absolute inset-0 flex items-center pt-20">
        <WideLogo className="w-full text-brand-purple hidden 
        opacity-20 mix-blend-multiply lg:block" />
        <TallLogo className="w-full text-brand-purple 
        opacity-20 mix-blend-multiply lg:hidden" />
      </div>
      <div className="mx-auto w-full max-w-6xl">
        <div className="absolute inset-x-0 bottom-0 top-24 md:top-20 lg:top-16 mx-auto grid max-w-6xl grid-rows-[1fr_auto] place-items-end px-6 ~py-10/16">
          <Heading className="relative max-w-2xl place-self-start z-20">
            <PrismicText field={slice.primary.heading} />
          </Heading>
          
          <div className="flex relative w-full flex-col items-center justify-between ~gap-2/4 lg:flex-row z-20">
            <div className="max-w-[45ch] font-DMMono font-semibold ~text-lg/xl [&_*]:font-DMMono">
              <PrismicRichText field={slice.primary.body} />
            </div>
            <ButtonLink 
              field={slice.primary.button}
              icon="skateboard"
              size="lg"
              className="z-20 mt-2 block"
            >
              {slice.primary.button.text}
            </ButtonLink>
          </div>
        </div>
      </div>
      <InteractiveSkateboard
        deckTextureURL={deckTextureURL}
        wheelTextureURL={wheelTextureURL}
        truckColor={truckColor}
        boltColor={boltColor}
      />
    </Bounded>
  );
};

export default Hero;
