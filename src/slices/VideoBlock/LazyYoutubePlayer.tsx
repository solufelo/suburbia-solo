"use client";

import { KeyTextField } from "@prismicio/client";
import { useEffect, useRef, useState } from "react";

type VideoProps = {
  youTubeID: KeyTextField;
};

/** Muted looping YouTube embed that only loads when it gets near the viewport. */
export function LazyYouTubePlayer({ youTubeID }: VideoProps) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = containerRef.current;
    if (!current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-zinc-800">
      {inView ? (
        <iframe
          title="Suburbia skate reel (muted, loops)"
          src={`https://www.youtube-nocookie.com/embed/${youTubeID}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&playlist=${youTubeID}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="lazy"
          className="pointer-events-none h-full w-full border-0"
        />
      ) : (
        <div className="grid h-full w-full place-items-center font-mono text-sm uppercase tracking-widest text-white/50">
          Loading the reel…
        </div>
      )}
    </div>
  );
}
