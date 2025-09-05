"use client";

import React, { FC, useEffect, useState } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicText } from "@prismicio/react";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { createClient } from "@/lib/prismicio";
import { Skater } from "./Skater";
import { SlideIn } from "@/components/SlideIn";

/**
 * Props for `TeamGrid`.
 */
export type TeamGridProps = SliceComponentProps<Content.TeamGridSlice>;

/**
 * Component for "TeamGrid" Slices.
 */
const TeamGrid: FC<TeamGridProps> = ({ slice }) => {
  const [skaters, setSkaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkaters() {
      const client = createClient();
      const data = await client.getAllByType("skater");
      const sorted = [...data].sort((a: any, b: any) => {
        const nameA = `${a?.data?.first_name ?? ""} ${a?.data?.last_name ?? ""}`.trim().toLowerCase();
        const nameB = `${b?.data?.first_name ?? ""} ${b?.data?.last_name ?? ""}`.trim().toLowerCase();
        const aIsSophia = nameA === "sophia castillo";
        const bIsSophia = nameB === "sophia castillo";
        if (aIsSophia && !bIsSophia) return -1;
        if (!aIsSophia && bIsSophia) return 1;
        return 0;
      });
      setSkaters(sorted);
      setLoading(false);
    }
    fetchSkaters();
  }, []);
  // Prevent hydration mismatch by not rendering until data is loaded
  if (loading) {
    return (
      <Bounded
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className="bg-texture bg-brand-navy"
      >
        <SlideIn>

        <Heading as="h2" size="lg" className="text-white mb-8 text-center">
          <PrismicText field={slice.primary.heading} />
        </Heading>
        </SlideIn>
        <div className="text-white text-center">Loading skaters...</div>
      </Bounded>
    );
  }

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-texture bg-brand-navy"
    >
      <SlideIn>
      <Heading as="h2" size="lg" className="text-white mb-8 text-center">
        <PrismicText field={slice.primary.heading} />
      </Heading>
      </SlideIn>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
        {skaters.map((skater: any, index: number) => (
          skater?.data?.first_name ? (
            <SlideIn key={skater.id ?? index} delay={index * 0.1}>
              <Skater index={index} skater={skater} />
            </SlideIn>
          ) : null
        ))}
      </div>
    </Bounded>
  );
};

export default TeamGrid;
