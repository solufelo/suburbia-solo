/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { Kicker } from "@/components/Heading";
import { FaArrowRight } from "react-icons/fa";

import { MarkerNote, RansomWord, ScribbleArrow } from "@/components/zine";
import { DECKS } from "@/lib/customizer-options";

// Jagged crack across the middle of the deck; the two halves share it.
const CRACK = "0 47%, 14% 51%, 27% 45%, 41% 53%, 55% 46%, 68% 54%, 82% 47%, 100% 52%";
const TOP = `polygon(0 0, 100% 0, 100% 52%, ${CRACK.split(", ").reverse().join(", ")})`;
const BOTTOM = `polygon(${CRACK}, 100% 100%, 0 100%)`;

/** Branded 404: a snapped deck and three ways back. */
export function NotFoundView() {
  const deck = DECKS.find((d) => d.id === "red-black") ?? DECKS[0];
  return (
    <section className="bg-texture page-top relative min-h-[88svh] overflow-hidden bg-paper pb-20">
      <div className="wrap grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Kicker index="404" className="anim-fade-up">
            Page not found
          </Kicker>
          <h1 className="font-display t-mega mt-5 uppercase">
            {/* Phones: the cut-out word runs the full width instead of half of it. */}
            <RansomWord word="Bailed." animate baseDelay={0.1} className="text-[21vw] md:text-[0.7em]" />
          </h1>
          <p className="lede anim-fade-up mt-8 max-w-[38ch] [--d:0.5s]">
            That page doesn&apos;t exist, or it snapped on the way down. Dust yourself off and pick a line.
          </p>
          <div className="anim-fade-up mt-10 flex flex-wrap items-center gap-x-4 gap-y-6 [--d:0.65s]">
            <Link href="/boards" className={buttonClasses({ size: "md" })}>
              <ButtonIcon icon="arrow" size="md" />
              Shop boards
            </Link>
            <Link href="/build" className={buttonClasses({ color: "lime", size: "md" })}>
              <ButtonIcon icon="skateboard" size="md" />
              Build one
            </Link>
            <Link
              href="/"
              className="group flex min-h-12 items-center gap-2 px-2 font-display text-[1.4rem] uppercase leading-none"
            >
              <span className="link-hl">Back home</span>
              <FaArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 ease-slap group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto h-[26rem] w-56 md:col-span-5 md:h-[34rem] md:w-72">
          <img
            src={deck.thumb}
            alt=""
            width={160}
            height={632}
            className="anim-slap absolute inset-0 m-auto h-full w-auto drop-shadow-[8px_10px_0_rgba(21,19,20,0.25)] [--d:0.35s] [--r:-22deg] [translate:-14%_-6%]"
            style={{ clipPath: TOP } as CSSProperties}
          />
          <img
            src={deck.thumb}
            alt=""
            width={160}
            height={632}
            className="anim-slap absolute inset-0 m-auto h-full w-auto drop-shadow-[8px_10px_0_rgba(21,19,20,0.25)] [--d:0.5s] [--r:14deg] [translate:10%_2%]"
            style={{ clipPath: BOTTOM } as CSSProperties}
          />
          {/* Pinned to the break: left of the crack on desktop, under the tail on phones. */}
          <div className="anim-fade-up absolute inset-x-0 -bottom-12 flex items-center justify-center gap-1 [--d:1s] md:bottom-auto md:left-auto md:right-[78%] md:top-[44%] md:justify-end">
            <MarkerNote className="rotate-[-8deg] whitespace-nowrap text-2xl text-brand-hot">RIP, sweet board</MarkerNote>
            <ScribbleArrow className="h-10 w-16 rotate-[-10deg] text-brand-hot max-md:hidden" />
          </div>
        </div>
      </div>
    </section>
  );
}
