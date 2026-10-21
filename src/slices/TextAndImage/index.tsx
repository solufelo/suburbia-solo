import { asText, Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import type { CSSProperties } from "react";

import { ButtonLink } from "@/components/ButtonLink";
import { Heading, Kicker } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { MarkerNote } from "@/components/zine";
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

// Margin scrawls, one per panel, in the order the panels appear.
const NOTES = ["tested on real curbs", "draw on it. we did.", "scuffs = character", "local kids first"];

/**
 * Story panels: they stack as you scroll (sticky), each with a taped cut-out
 * photo and one marker note in the margin.
 */
const TextAndImage = ({ slice, index = 0 }: TextAndImageProps & { index?: number }) => {
  const theme = THEMES[(slice.primary.theme as keyof typeof THEMES) ?? "Blue"] ?? THEMES.Blue;
  const imageLeft = slice.variation === "imgOnLeft";
  const button = slice.primary.button;
  // Prismic points most of these buttons at "/" or nowhere; send them to the shop.
  const buttonGoesSomewhere =
    isFilled.link(button) && !("url" in button && (button.url === "/" || !button.url));

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={clsx(
        "bg-texture sticky top-[calc(var(--index)*1.5rem)] overflow-hidden py-[clamp(3.5rem,8vw,7rem)] shadow-[0_-2px_0_#151314]",
        theme.section,
      )}
      style={{ "--index": index }}
    >
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
            <MarkerNote className={clsx("text-[clamp(1.4rem,2.2vw,2rem)]", theme.note)}>
              {NOTES[index % NOTES.length]}
            </MarkerNote>
          </Reveal>
        </div>

        <div
          className={clsx(
            "flex flex-col items-start gap-6 md:col-span-5",
            imageLeft ? "md:order-2 md:col-start-8" : "md:order-1",
          )}
        >
          <Reveal>
            <Kicker index={String(index + 2).padStart(2, "0")}>
              <span className="sr-only">Story, part {index + 1}: </span>
              {["The deck", "The graphics", "The abuse", "The scene"][index % 4]}
            </Kicker>
          </Reveal>
          <Reveal variant="mask" delay={0.05}>
            <Heading as="h2" size="lg">
              <span className="riso" style={{ "--riso": theme.riso } as CSSProperties}>
                {asText(slice.primary.heading)}
              </span>
            </Heading>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="lede max-w-[38ch] font-medium">{asText(slice.primary.body)}</p>
          </Reveal>
          <Reveal delay={0.2}>
            {buttonGoesSomewhere ? (
              <ButtonLink field={button} color={theme.button} icon="arrow" className="!ml-4">
                {button.text || "Shop boards"}
              </ButtonLink>
            ) : (
              <ButtonLink href="/boards" color={theme.button} icon="arrow" className="!ml-4">
                {button.text || "Shop boards"}
              </ButtonLink>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default TextAndImage;
