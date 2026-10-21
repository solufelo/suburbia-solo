"use client";

import { KeyTextField } from "@prismicio/client";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type VideoProps = {
  youTubeID: KeyTextField;
};

/**
 * Muted looping YouTube embed over a printed still. The embed (and YouTube's
 * own requests) only start once the frame is actually on screen, and it fades
 * in over the poster when it has loaded, so a slow or blocked YouTube leaves
 * the still in place instead of a blank frame. Reduced motion keeps the still.
 */
export function LazyYouTubePlayer({ youTubeID }: VideoProps) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = containerRef.current;
    if (!current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-ink">
      <Image
        src="/reel-poster.webp"
        alt="Two skaters sitting against a wall, one holding his board"
        fill
        sizes="(min-width: 1440px) 1280px, 100vw"
        className="object-cover"
      />
      {inView ? (
        <iframe
          title="Suburbia skate reel (muted, loops)"
          src={`https://www.youtube-nocookie.com/embed/${youTubeID}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&playlist=${youTubeID}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={() => setLoaded(true)}
          className={clsx(
            "pointer-events-none absolute inset-0 h-full w-full border-0 transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </div>
  );
}
