"use client";

import { SliceZone } from "@prismicio/react";
// import { SliceBundle, CascadeContainer } from "@/components";
import type { SliceLike } from "@prismicio/react";
import dynamic from "next/dynamic";

// Import components directly to avoid serialization issues
const Hero = dynamic(() => import("@/slices/Hero"));
const ProductGrid = dynamic(() => import("@/slices/ProductGrid"));
const TeamGrid = dynamic(() => import("@/slices/TeamGrid"));
const TextAndImage = dynamic(() => import("@/slices/TextAndImage"));
const VideoBlock = dynamic(() => import("@/slices/VideoBlock"));

const components = {
  hero: Hero,
  product_grid: ProductGrid,
  team_grid: TeamGrid,
  text_and_image: TextAndImage,
  video_block: VideoBlock,
};

interface StickySliceZoneProps {
  slices: SliceLike[];
  className?: string;
  cascadeSpeed?: number;
  preserveIntegrity?: boolean;
}

export function StickySliceZone({ 
  slices, 
  className,
  cascadeSpeed = 0.05,
  preserveIntegrity = true
}: StickySliceZoneProps) {
  // Bundle TextAndImage slices like the original project
  const bundledSlices = bundleTextAndImageSlices(slices);

  return (
    <div className={className}>
      <SliceZone 
        slices={bundledSlices} 
        components={{
          ...components,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          text_and_image_bundle: ({ slice }: { slice: any }) => (
            <div>
              <SliceZone slices={slice.slices} components={components} />
            </div>
          ),
        }}
      />
    </div>
  );
}

// Bundle TextAndImage slices together like the original project
function bundleTextAndImageSlices(slices: SliceLike[]): SliceLike[] {
  const res: SliceLike[] = [];

  for (const slice of slices) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sliceAny = slice as any;
    if (sliceAny.slice_type !== "text_and_image") {
      res.push(slice);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bundle = res.at(-1) as any;
    if (bundle?.slice_type === "text_and_image_bundle") {
      bundle.slices.push(slice);
    } else {
      res.push({
        id: `${sliceAny.id}-bundle`,
        slice_type: "text_and_image_bundle",
        slices: [slice],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
  }
  return res;
}
