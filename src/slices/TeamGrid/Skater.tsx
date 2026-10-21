import Link from "next/link";
import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import clsx from "clsx";
import { FaArrowRight } from "react-icons/fa";

import { SkaterScribble } from "./SkaterScribble";

type Props = {
  skater: Content.SkaterDocument;
  index: number;
};

const SCRIBBLES = ["text-brand-lime", "text-brand-hot", "text-brand-orange", "text-brand-blue"];

/**
 * A taped Polaroid of a team rider; hover draws a scribble behind them. The
 * whole card is the link (a stretched hit area), so phones get a big target.
 */
export function Skater({ skater, index }: Props) {
  const link = skater.data.customizer_link;
  // Most skaters have no customizer link in Prismic yet; send those to the builder.
  const href =
    isFilled.link(link) && "url" in link && link.url && link.url !== "/" ? link.url : "/build";

  return (
    <div className="skater group relative">
      <span aria-hidden="true" className="tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[4deg]" />
      <div className="bg-paper p-2.5 pb-3 text-ink shadow-[6px_8px_0_rgba(0,0,0,0.45)] transition-transform duration-500 ease-snap group-hover:-translate-y-1.5 group-hover:rotate-[-1.5deg]">
        <div className="stack-layout relative overflow-hidden bg-ink">
          <PrismicNextImage
            field={skater.data.photo_bg}
            width={500}
            imgixParams={{ q: 30 }}
            alt=""
            className="h-auto w-full scale-110 object-contain grayscale transition-all duration-1000 ease-snap group-hover:scale-100 group-hover:grayscale-0"
          />
          <SkaterScribble className={clsx("absolute inset-0 h-full w-full", SCRIBBLES[index % SCRIBBLES.length])} />
          <PrismicNextImage
            field={skater.data.photo_fg}
            width={500}
            alt=""
            className="absolute inset-0 h-auto w-full object-contain transition-transform duration-1000 ease-snap group-hover:scale-110"
          />
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] uppercase leading-[0.85]">
            <span className="block">{skater.data.first_name}</span>
            <span className="block">{skater.data.last_name}</span>
          </h3>
          <span aria-hidden="true" className="font-mono text-[0.65rem] text-ink/50">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
      <Link
        href={href}
        className="group/l mt-4 flex min-h-11 items-center gap-2 font-mono text-[0.75rem] font-medium uppercase tracking-widest after:absolute after:inset-0 after:z-[3] after:content-[''] focus-visible:shadow-none focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:outline-offset-4 focus-visible:after:outline-brand-lime"
      >
        <span className="link-hl [--hl:#ff4fa3]">Build their board</span>
        <span className="sr-only">: {`${skater.data.first_name ?? ""} ${skater.data.last_name ?? ""}`.trim()}</span>
        <FaArrowRight aria-hidden="true" className="size-3 transition-transform duration-300 ease-slap group-hover/l:translate-x-1" />
      </Link>
    </div>
  );
}
