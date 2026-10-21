import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import Image from "next/image";
import type { CSSProperties } from "react";

import { ButtonLink, type ButtonProps } from "@/components/ButtonLink";
import { Heading, Kicker } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { MarkerNote } from "@/components/zine";
import { CUSTOM_BOARD_PRICE_CENTS, DECKS, METALS, WHEELS } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { COMPLETE_SPECS } from "@/lib/site";
import { ParallaxImage } from "./ParallaxImage";

declare module "react" {
  interface CSSProperties {
    "--index"?: number;
  }
}

export type TextAndImageProps = SliceComponentProps<Content.TextAndImageSlice>;

// Each colour gets its own ink pairing so text always clears contrast.
const THEMES = {
  Blue: { section: "bg-brand-blue text-white on-dark", riso: "#151314", note: "text-brand-lime", button: "lime" },
  Orange: { section: "bg-brand-orange text-ink", riso: "#f7d0e9", note: "text-white", button: "purple" },
  Navy: { section: "bg-brand-navy text-white on-dark", riso: "#ff4fa3", note: "text-brand-lime", button: "lime" },
  Lime: { section: "bg-brand-lime text-ink", riso: "#ff4fa3", note: "text-brand-navy", button: "orange" },
} as const;

const { deck, trucks, wheels } = COMPLETE_SPECS;

type Chapter = {
  kicker: string;
  heading: string;
  body: string;
  note: string;
  cta?: { href: string; label: string; icon: NonNullable<ButtonProps["icon"]> };
  /** Swap the photo layout for the spec sheet. */
  specs?: boolean;
};

/**
 * The story, in the order the panels appear. Owned by code rather than Prismic
 * because it quotes catalogue numbers (deck count, wheel size, price) that must
 * match customizer-options and COMPLETE_SPECS; Prismic still supplies each
 * panel's colour, layout and photos.
 */
const STORY: Chapter[] = [
  {
    kicker: "The deck",
    heading: "Seven plies of pop",
    body: `Every complete starts on the same deck: ${deck.plies}-ply ${deck.wood}, ${deck.size}, grip already on. Wide enough to land on, light enough to flip.`,
    note: "ready out of the box",
  },
  {
    kicker: "The graphics",
    heading: `${DECKS.length} graphics. Your call.`,
    body: `Pick a deck, then ${WHEELS.length} wheel colours and ${METALS.length} hardware finishes. It spins in 3D while you build, and lands in the cart exactly as you left it.`,
    note: "draw on it. we did.",
    cta: { href: "/build", label: "Open the builder", icon: "skateboard" },
  },
  {
    kicker: "The parts",
    heading: "Made to take the slam",
    body: "Off the wall or out of the builder, every board ships with the same parts.",
    note: "scuffs = character",
    cta: { href: "/boards", label: "Shop completes", icon: "arrow" },
    specs: true,
  },
  {
    kicker: "The crew",
    heading: "Ride what the team rides",
    body: "Four riders, four very different setups. Meet them, then open any board in the builder and make it yours.",
    note: "say hi to the crew",
    cta: { href: "/#team", label: "Meet the team", icon: "arrow" },
  },
];

/**
 * Story panels: they stack as you scroll (sticky). Most are a taped cut-out
 * photo with one marker note in the margin; the parts panel breaks the
 * pattern with a dimensioned deck and the spec sheet.
 */
const TextAndImage = ({ slice, index = 0 }: TextAndImageProps & { index?: number }) => {
  const theme = THEMES[(slice.primary.theme as keyof typeof THEMES) ?? "Blue"] ?? THEMES.Blue;
  const chapter = STORY[index % STORY.length];
  const imageLeft = slice.variation === "imgOnLeft";

  const text = (
    <>
      <Reveal>
        <Kicker index={String(index + 2).padStart(2, "0")}>
          <span className="sr-only">Story, part {index + 1}: </span>
          {chapter.kicker}
        </Kicker>
      </Reveal>
      <Reveal variant="mask" delay={0.05}>
        <Heading as="h2" size="lg">
          <span className="riso" style={{ "--riso": theme.riso } as CSSProperties}>
            {chapter.heading}
          </span>
        </Heading>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="lede max-w-[38ch] font-medium">{chapter.body}</p>
      </Reveal>
    </>
  );
  const cta = chapter.cta ? (
    <Reveal delay={0.2}>
      <ButtonLink href={chapter.cta.href} color={theme.button} icon={chapter.cta.icon} className="!ml-4">
        {chapter.cta.label}
      </ButtonLink>
    </Reveal>
  ) : null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={clsx(
        "bg-texture top-[calc(var(--index)*1.5rem)] overflow-hidden py-[clamp(3.5rem,8vw,7rem)] shadow-[0_-2px_0_#151314]",
        // A stuck panel never shows what hangs below the fold, and the spec
        // sheet is taller than a phone screen: there it scrolls over the stack.
        chapter.specs ? "relative md:sticky" : "sticky",
        theme.section,
      )}
      style={{ "--index": index }}
    >
      {chapter.specs ? (
        <div className="wrap">
          <div className="grid items-center gap-x-12 gap-y-10 md:grid-cols-12">
            <div className="flex flex-col items-start gap-6 md:col-span-5">
              {text}
              {cta}
            </div>
            <div className="relative md:col-span-7">
              <DeckDiagram />
              <Reveal variant="slap" rotate={-5} delay={0.3} className="absolute -bottom-4 left-0 md:-bottom-8 md:left-4">
                <MarkerNote className={clsx("text-[clamp(1.3rem,2vw,1.9rem)]", theme.note)}>{chapter.note}</MarkerNote>
              </Reveal>
            </div>
          </div>
          <SpecStrip />
        </div>
      ) : (
        <div className="wrap grid items-center gap-x-16 gap-y-8 md:grid-cols-12">
          <div className={clsx("relative md:col-span-6", imageLeft ? "md:order-1" : "md:order-2")}>
            <span aria-hidden="true" className="tape left-[12%] top-[6%] z-10 rotate-[-12deg] max-md:hidden" />
            <span aria-hidden="true" className="tape bottom-[10%] right-[10%] z-10 rotate-[9deg] max-md:hidden" />
            <ParallaxImage foregroundImage={slice.primary.foregroundimg} backgroundImage={slice.primary.bg_img} />
            <Reveal
              variant="slap"
              delay={0.3}
              rotate={imageLeft ? 6 : -6}
              className={clsx("absolute bottom-[6%] z-10", imageLeft ? "right-0" : "left-0")}
            >
              <MarkerNote className={clsx("text-[clamp(1.4rem,2.2vw,2rem)]", theme.note)}>{chapter.note}</MarkerNote>
            </Reveal>
          </div>

          <div
            className={clsx(
              "flex flex-col items-start gap-6 md:col-span-5",
              imageLeft ? "md:order-2 md:col-start-8" : "md:order-1",
            )}
          >
            {text}
            {cta}
          </div>
        </div>
      )}
    </section>
  );
};

/** A complete laid on its side with its two key dimensions ruled on. */
function DeckDiagram() {
  const [width, length] = deck.size.split(" × ");
  return (
    <Reveal as="figure" variant="slap" rotate={-3} className="relative pr-8 md:pr-12">
      <figcaption className="sr-only">
        Deck: {deck.size}, {deck.plies}-ply {deck.wood}.
      </figcaption>
      {/* Length: a ruled line with end ticks, label punched through the middle. */}
      <div aria-hidden="true" className="mb-3 flex items-center gap-3 font-mono text-xs font-medium tracking-widest">
        <span className="h-3 w-0.5 bg-ink" />
        <span className="h-0.5 grow bg-ink" />
        <span>{length}</span>
        <span className="h-0.5 grow bg-ink" />
        <span className="h-3 w-0.5 bg-ink" />
      </div>
      <div className="relative aspect-[1600/448] w-full">
        <Image
          src="/Images/web/onimask-complete.webp"
          alt=""
          width={448}
          height={1600}
          sizes="(min-width: 768px) 13rem, 25vw"
          className="absolute left-1/2 top-1/2 w-[28%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 drop-shadow-[0_-10px_0_rgba(21,19,20,0.25)]"
        />
        {/* Width: same rule, stood up at the nose. */}
        <div
          aria-hidden="true"
          className="absolute -right-8 inset-y-0 flex flex-col items-center gap-2 font-mono text-xs font-medium md:-right-12"
        >
          <span className="h-0.5 w-3 bg-ink" />
          <span className="w-0.5 grow bg-ink" />
          <span className="[writing-mode:vertical-rl]">{width}</span>
          <span className="w-0.5 grow bg-ink" />
          <span className="h-0.5 w-3 bg-ink" />
        </div>
      </div>
    </Reveal>
  );
}

/** Four numbers that every board shares, printed big. */
function SpecStrip() {
  const cells = [
    { value: String(deck.plies), unit: "ply", label: `${deck.wood} deck, grip on` },
    { value: String(trucks.mm), unit: "mm", label: `Trucks, ${trucks.note}` },
    { value: String(wheels.mm), unit: "mm", label: `Wheels, ${wheels.duro}, ${wheels.note}` },
    { value: formatPrice(CUSTOM_BOARD_PRICE_CENTS), unit: "", label: "Every complete, custom or not" },
  ];
  return (
    <dl className="mt-[clamp(2rem,4vw,3.5rem)] grid grid-cols-2 border-t-2 border-ink md:grid-cols-4">
      {cells.map((c, i) => (
        <Reveal
          key={c.label}
          delay={0.1 + i * 0.07}
          className={clsx(
            "flex flex-col gap-2 border-ink pt-4 md:px-6 md:first:pl-0",
            i % 2 === 1 && "border-l-2 pl-4 max-md:pr-0",
            i >= 2 && "max-md:mt-6 max-md:border-t-2",
            i === 2 && "md:border-l-2 max-md:pr-4",
            i === 0 && "pr-4",
          )}
        >
          <dt className="order-2 font-mono text-[0.7rem] font-medium uppercase leading-snug tracking-widest">{c.label}</dt>
          <dd className="order-1 font-display text-[clamp(2.6rem,5vw,4.5rem)] uppercase leading-[0.85] tabular-nums">
            {c.value}
            {c.unit ? <span className="ml-1 text-[0.45em]">{c.unit}</span> : null}
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}

export default TextAndImage;
