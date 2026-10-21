import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import Image from "next/image";

import { Heading, Kicker } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { MarkerNote } from "@/components/zine";
import { LazyYouTubePlayer } from "./LazyYoutubePlayer";

const MASK_CLASSES =
  "[mask-image:url(/video-mask.png)] [mask-mode:alpha] [mask-position:center_center] [mask-repeat:no-repeat] [mask-size:100%_auto]";

export type VideoBlockProps = SliceComponentProps<Content.VideoBlockSlice>;

/** The reel: a torn-paper frame around a muted, looping embed. */
const VideoBlock = ({ slice }: VideoBlockProps) => {
  const id = isFilled.keyText(slice.primary.youtube_video_id) ? slice.primary.youtube_video_id : "44I29krtxaw";
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="on-dark bg-texture relative bg-ink py-[clamp(4rem,9vw,8rem)] text-paper"
    >
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <Kicker index="06" className="[&>span:first-child]:bg-brand-lime [&>span:first-child]:text-ink">
                The reel
              </Kicker>
            </Reveal>
            <Reveal variant="mask" delay={0.05}>
              <Heading as="h2" size="xl" className="mt-4">
                Off the <span className="text-brand-lime">couch</span>
              </Heading>
            </Reveal>
          </div>
          <Reveal variant="slap" rotate={-5} delay={0.25}>
            <MarkerNote className="text-2xl text-brand-hot">sound off. loops forever.</MarkerNote>
          </Reveal>
        </div>

        <div className="relative aspect-video">
          <div className={clsx(MASK_CLASSES, "absolute inset-0 bg-brand-lime ~translate-x-2/3 ~translate-y-2/3")} />
          <div className={clsx(MASK_CLASSES, "absolute inset-0 bg-brand-hot ~translate-x-1/3 ~translate-y-1/2")} />
          <div className={clsx(MASK_CLASSES, "absolute inset-0 bg-white ~translate-x-1/2 ~-translate-y-1/3")} />
          <div className={clsx(MASK_CLASSES, "relative h-full")}>
            <LazyYouTubePlayer youTubeID={id} />
            <Image
              src="/image-texture.png"
              alt=""
              fill
              sizes="100vw"
              className="pointer-events-none object-cover opacity-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoBlock;
