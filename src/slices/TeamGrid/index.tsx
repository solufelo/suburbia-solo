import React, { FC } from "react";
import { asText, Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

import { Heading, Kicker } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { MarkerNote } from "@/components/zine";
import type { SliceContext } from "@/slices/context";
import { Skater } from "./Skater";

export type TeamGridProps = SliceComponentProps<Content.TeamGridSlice, SliceContext>;

const fullName = (s: Content.SkaterDocument) =>
  `${s.data.first_name ?? ""} ${s.data.last_name ?? ""}`.trim().toLowerCase();

/**
 * Team wall. Skaters come from the server through the slice context.
 * Sophie Castillo leads the grid, as before.
 */
const TeamGrid: FC<TeamGridProps> = ({ slice, context }) => {
  const skaters = [...(context?.skaters ?? [])]
    .filter((s) => s.data.first_name)
    .sort((a, b) => {
      const lead = (s: Content.SkaterDocument) => /^soph(ia|ie) castillo$/.test(fullName(s));
      return Number(lead(b)) - Number(lead(a));
    });

  return (
    <section
      id="team"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="on-dark bg-texture scroll-mt-16 overflow-hidden bg-brand-navy py-[clamp(4rem,9vw,8rem)] text-white"
    >
      <div className="wrap">
        <div className="mb-12 grid items-end gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal>
              <Kicker index="07" className="[&>span:first-child]:bg-brand-lime [&>span:first-child]:text-ink">
                Who rides them
              </Kicker>
            </Reveal>
            <Reveal variant="mask" delay={0.05}>
              <Heading as="h2" size="xl" className="mt-4">
                {asText(slice.primary.heading) || "The team"}
              </Heading>
            </Reveal>
          </div>
          <Reveal variant="slap" rotate={-4} delay={0.25} className="md:col-span-4 md:justify-self-end">
            <MarkerNote className="text-2xl text-brand-lime">scribbles included</MarkerNote>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {skaters.map((skater, index) => (
            <Reveal key={skater.id} delay={index * 0.08} rotate={index % 2 ? 1.5 : -1.5}>
              <Skater index={index} skater={skater} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamGrid;
