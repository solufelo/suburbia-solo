"use client";

import { useRef, useEffect } from "react";
import clsx from "clsx";

import { useIsSafari } from "@/lib/useIsSafari";

export function WavyPaths() {
  const isSafari = useIsSafari(true);
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!root.current || isSafari) return;

    const paths = root.current.querySelectorAll(".wavy-path");
    
    // Set initial state
    paths.forEach((path) => {
      (path as SVGPathElement).style.strokeDasharray = "200, 1700";
      (path as SVGPathElement).style.strokeDashoffset = "200";
    });

    // Create smooth animation
    let animationId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      
      paths.forEach((path, index) => {
        const delay = index * 200; // 200ms stagger
        const adjustedTime = Math.max(0, elapsed - delay);
        const progress = (adjustedTime % 3000) / 3000; // 3 second loop
        
        // Smooth flow from right to left (along the board)
        const offset = 200 + (progress * 1900);
        (path as SVGPathElement).style.strokeDashoffset = offset.toString();
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isSafari]);

  return (
    <svg
      ref={root}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 1242 308"
      width={1242}
      height={308}
      className={clsx(
        "pointer-events-none text-zinc-600",
        !isSafari && "animate-squiggle"
      )}
    >
      <path
        stroke="currentColor"
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="12"
        d="M21 146c61-33 128-73 200-54 67 18 133 90 200 132s133 54 200 18S754 122 821 74s133-60 200-54c69 7 135 31 200 54"
      />
      <path
        stroke="currentColor"
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="12"
        d="M21 115c58 43 124 97 200 90 67-6 133-66 200-102s133-48 200-42 133 30 200 72 133 102 200 126 133 12 167 6l33-6"
      />
      <path
        stroke="currentColor"
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="12"
        d="M21 71c50 52 100 116 171 138 120 37 222-91 343-66 57 12 115 60 172 90s114 42 171 18 114-84 172-114c54-28 112-30 171-30"
      />
    </svg>
  );
}
