"use client";

import { KeyTextField } from "@prismicio/client";
import { useState, useRef, useEffect } from "react";


type VideoProps = {
  youTubeID: KeyTextField;
};

export function LazyYouTubePlayer({ youTubeID }: VideoProps) {
 const [isINView, setIsInView] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
    const current = containerRef.current;
    if (current) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                console.log("In view");
                setIsInView(true);
            }
        }, { threshold: 0, rootMargin: "1500px" });
        
        observer.observe(current);
        
        return () => {
            observer.unobserve(current);
        };
    }
 }, []);
  return (
    <div ref={containerRef} className="relative h-full w-full">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youTubeID}?autoplay=1&mute=1&loop=1&playlist=${youTubeID}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="pointer-events-none h-full w-full border-0"
      />
    </div>
  );
}