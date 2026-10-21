"use client";

import { FC, type CSSProperties } from "react";
import Link from "next/link";
import { asText, Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { FaArrowRight } from "react-icons/fa";

import { ButtonLink } from "@/components/ButtonLink";
import { Kicker } from "@/components/Heading";
import { Marquee, MarkerNote, RansomWord, ScribbleArrow, Sticker } from "@/components/zine";
import { useSkateboard } from "@/contexts/SkateboardContext";
import { CUSTOM_BOARD_PRICE_CENTS, DECKS, METALS, WHEELS } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { priceLine, splitLastWord } from "@/lib/zine";
import type { SliceContext } from "@/slices/context";
import { InteractiveSkateboard } from "./InteractiveSkateboard";

export type HeroProps = SliceComponentProps<Content.HeroSlice, SliceContext>;

/**
 * Homepage hero: a cut-and-paste headline over the live 3D board (click the
 * dots for tricks), with the copy and the call to action kept above the fold.
 */
const Hero: FC<HeroProps> = ({ slice, context }) => {
  const { customization } = useSkateboard();
  const heading = asText(slice.primary.heading) || "Escape the cul-de-sac";
  const { lead, last } = splitLastWord(heading);
  const body = asText(slice.primary.body).trim();
  const price = priceLine((context?.products ?? []).map((p) => p.price), CUSTOM_BOARD_PRICE_CENTS, formatPrice);

  return (
    <>
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className="bg-texture relative isolate min-h-[max(100svh,40rem)] overflow-hidden bg-brand-pink"
      >
        {/* Print texture: a halftone bloom behind the board. */}
        <div
          aria-hidden="true"
          className="halftone absolute -right-[10%] top-[8%] h-[70%] w-[60%] text-brand-hot/45 [mask-image:radial-gradient(closest-side,#000_30%,transparent)]"
        />

        <InteractiveSkateboard
          deckTextureURL={customization.deckTextureURL}
          wheelTextureURL={customization.wheelTextureURL}
          truckColor={customization.truckColor}
          boltColor={customization.boltColor}
        />

        <div className="wrap pointer-events-none relative z-20 flex min-h-[max(100svh,40rem)] flex-col pb-[clamp(1.5rem,4vh,3rem)] pt-[calc(var(--header-h)+env(safe-area-inset-top)+clamp(1rem,3vh,2rem))]">
          <Kicker className="anim-fade-up text-ink/80" index="★">
            Completes + a 3D board builder
          </Kicker>

          <h1 className="font-display mt-4 uppercase leading-[0.8] md:mt-5">
            <span className="block overflow-hidden pb-[0.04em]">
              <span className="anim-rise t-mega block" style={{ "--d": "0.05s" } as CSSProperties}>
                {lead}
              </span>
            </span>{" "}
            <RansomWord
              word={last}
              animate
              baseDelay={0.35}
              className="mt-[0.12em] text-[clamp(2.7rem,8.6vw,8.75rem)]"
            />
          </h1>

          {/* Notes pinned around the board. */}
          <div className="relative grow" aria-hidden="true">
            {/* Low on the right, clear of the board's wavy trail, pointing back up at it. */}
            <div className="absolute bottom-[6%] right-[3%] flex flex-col items-end gap-1 max-md:hidden">
              <ScribbleArrow className="mr-24 h-14 w-24 rotate-[-150deg] text-brand-hot" />
              <MarkerNote className="anim-fade-up rotate-[-5deg] text-[1.6rem] text-ink [--d:1.4s]">
                tap the dots.
                <br />
                it does tricks.
              </MarkerNote>
            </div>
          </div>

          <div className="grid items-end gap-6 md:grid-cols-12">
            <div className="anim-fade-up md:col-span-5 [--d:0.8s]">
              {/* A paper scrap, so the board's wavy trail never runs through the text. */}
              <p className="lede inline-block max-w-[34ch] -rotate-1 bg-paper px-4 py-3 font-medium shadow-[4px_5px_0_#151314]">
                {/[.!?]$/.test(body) ? body : `${body}.`}
              </p>
            </div>
            <div className="anim-fade-up pointer-events-auto flex flex-wrap items-center gap-x-6 gap-y-4 md:col-span-7 md:justify-end [--d:0.95s]">
              <ButtonLink field={slice.primary.button} icon="skateboard" size="lg" className="!ml-4">
                {slice.primary.button.text || "Build your board"}
              </ButtonLink>
              <Link
                href="/boards"
                className="group flex min-h-11 items-center gap-2 font-display text-[1.5rem] uppercase leading-none"
              >
                <span className="link-hl [--hl:#ffffff]">Shop completes</span>
                <FaArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 ease-slap group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <Sticker
          shape="star"
          color="lime"
          rotate={12}
          animate
          delay={1.1}
          className="pointer-events-none absolute right-1 top-[24%] z-20 size-[4.6rem] text-[0.9rem] md:right-[7%] md:top-[calc(var(--header-h)+2rem)] md:size-36 md:text-[1.75rem]"
        >
          Spin it
          <br />
          in 3D
        </Sticker>
        <Sticker
          shape="rect"
          color="paper"
          rotate={-6}
          animate
          delay={1.25}
          className="pointer-events-none absolute bottom-[28%] left-[5%] z-20 text-[1.25rem] max-md:hidden"
        >
          <span className="font-mono text-[0.65rem] font-medium tracking-widest">{price.label}</span>
          <span className="text-[2rem]">{price.amount}</span>
        </Sticker>
      </section>

      <Marquee
        items={[
          "Escape the cul-de-sac",
          `${DECKS.length} deck graphics`,
          `${WHEELS.length} wheel colours`,
          `${METALS.length} hardware finishes`,
          "Spin it in 3D",
          `${price.label} ${price.amount}`,
        ]}
        className="relative z-20 -mt-px border-y-2 border-ink bg-ink py-3 font-display text-[1.9rem] uppercase leading-none text-brand-lime md:text-[2.4rem]"
      />
    </>
  );
};

export default Hero;
