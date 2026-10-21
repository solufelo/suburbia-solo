import React, { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicText } from "@prismicio/react";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { SlideIn } from "@/components/SlideIn";
import type { SliceContext } from "@/slices/context";
import { Skater } from "./Skater";

/**
 * Props for `TeamGrid`.
 */
export type TeamGridProps = SliceComponentProps<Content.TeamGridSlice, SliceContext>;

const fullName = (s: Content.SkaterDocument) =>
  `${s.data.first_name ?? ""} ${s.data.last_name ?? ""}`.trim().toLowerCase();

/**
 * Component for "TeamGrid" Slices.
 * Skaters come from the server through the slice context (no client fetch,
 * no loading flash). Sophia/Sophie Castillo leads the grid, as before.
 */
const TeamGrid: FC<TeamGridProps> = ({ slice, context }) => {
  const skaters = [...(context?.skaters ?? [])]
    .filter((s) => s.data.first_name)
    .sort((a, b) => {
      const lead = (s: Content.SkaterDocument) => /^soph(ia|ie) castillo$/.test(fullName(s));
      return Number(lead(b)) - Number(lead(a));
    });

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-texture bg-brand-navy"
    >
      <SlideIn>
        <Heading as="h2" size="lg" className="mb-8 text-center text-white">
          <PrismicText field={slice.primary.heading} />
        </Heading>
      </SlideIn>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {skaters.map((skater, index) => (
          <SlideIn key={skater.id} delay={index * 0.1}>
            <Skater index={index} skater={skater} />
          </SlideIn>
        ))}
      </div>
    </Bounded>
  );
};

export default TeamGrid;
