"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";

import { useIsSafari } from "@/lib/useIsSafari";

gsap.registerPlugin(useGSAP);

interface WavyPathsProps {
  speed?: number;
  intensity?: number;
  colors?: string[];
  interactive?: boolean;
  pulseEffect?: boolean;
}

export function WavyPaths({ 
  speed = 1, 
  intensity = 1, 
  colors = ["#6B7280", "#9CA3AF", "#D1D5DB"],
  interactive = true,
  pulseEffect = true
}: WavyPathsProps) {
  const isSafari = useIsSafari(true);
  const root = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking for interactive effects
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!root.current) return;
      
      const rect = root.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const svg = root.current;
    if (svg) {
      svg.addEventListener('mousemove', handleMouseMove);
      svg.addEventListener('mouseenter', handleMouseEnter);
      svg.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (svg) {
        svg.removeEventListener('mousemove', handleMouseMove);
        svg.removeEventListener('mouseenter', handleMouseEnter);
        svg.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [interactive]);

  useGSAP(() => {
    if (!root.current) return;

    const paths = root.current.querySelectorAll(".wavy-path");
    const particles = root.current.querySelectorAll(".particle");
    
    // Initial setup with enhanced stroke effects
    gsap.set(paths, {
      strokeDasharray: "200, 1700",
      strokeDashoffset: 200,
      opacity: 0.7,
    });

    // Main path animation with speed control
    const mainTimeline = gsap.timeline({ repeat: -1 });
    
    mainTimeline.to(paths, {
      strokeDashoffset: 2200,
      duration: 2 / speed,
      stagger: { 
        each: 0.3 / speed, 
        from: "random" 
      },
      ease: "none",
    });

    // Pulse effect for enhanced visual appeal
    if (pulseEffect) {
      gsap.to(paths, {
        strokeWidth: 15 + (intensity * 5),
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.2, from: "random" },
        ease: "power2.inOut",
      });
    }

    // Interactive mouse effects
    if (interactive) {
      paths.forEach((path, index) => {
        const tl = gsap.timeline({ paused: true });
        
        tl.to(path, {
          strokeWidth: 20 + (intensity * 8),
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        // Store timeline for later use
        (path as any).hoverTimeline = tl;
      });
    }

    // Particle animation for extra visual flair
    if (particles.length > 0) {
      gsap.set(particles, {
        opacity: 0,
        scale: 0,
      });

      gsap.to(particles, {
        opacity: 0.6,
        scale: 1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.5, from: "random" },
        ease: "power2.inOut",
      });
    }

  }, [speed, intensity, interactive, pulseEffect]);

  // Handle hover effects
  useEffect(() => {
    if (!interactive || !root.current) return;

    const paths = root.current.querySelectorAll(".wavy-path");
    
    if (isHovered) {
      paths.forEach((path) => {
        (path as any).hoverTimeline?.play();
      });
    } else {
      paths.forEach((path) => {
        (path as any).hoverTimeline?.reverse();
      });
    }
  }, [isHovered, interactive]);

  // Dynamic color application
  const getPathColor = (index: number) => {
    return colors[index % colors.length];
  };

  return (
    <svg
      ref={root}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 1242 308"
      width={1242}
      height={308}
      className={clsx(
        "pointer-events-auto text-zinc-600 transition-all duration-300",
        !isSafari && "animate-squiggle",
        interactive && "cursor-pointer"
      )}
      style={{
        filter: isHovered ? 'brightness(1.2) saturate(1.3)' : 'none',
      }}
    >
      {/* Main wavy paths with enhanced styling */}
      <path
        stroke={getPathColor(0)}
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="15"
        d="M21 146c61-33 128-73 200-54 67 18 133 90 200 132s133 54 200 18S754 122 821 74s133-60 200-54c69 7 135 31 200 54"
        style={{
          filter: `drop-shadow(0 0 8px ${getPathColor(0)}40)`,
        }}
      />
      <path
        stroke={getPathColor(1)}
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="15"
        d="M21 115c58 43 124 97 200 90 67-6 133-66 200-102s133-48 200-42 133 30 200 72 133 102 200 126 133 12 167 6l33-6"
        style={{
          filter: `drop-shadow(0 0 8px ${getPathColor(1)}40)`,
        }}
      />
      <path
        stroke={getPathColor(2)}
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="15"
        d="M21 71c50 52 100 116 171 138 120 37 222-91 343-66 57 12 115 60 172 90s114 42 171 18 114-84 172-114c54-28 112-30 171-30"
        style={{
          filter: `drop-shadow(0 0 8px ${getPathColor(2)}40)`,
        }}
      />
      <path
        stroke={getPathColor(0)}
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="15"
        d="M21 289c50-52 100-116 171-138 120-37 222 91 343 66 57-12 115-60 172-90s114-42 171-18 114 84 172 114c54 28 112 30 171 30"
        style={{
          filter: `drop-shadow(0 0 8px ${getPathColor(0)}40)`,
        }}
      />
      <path
        stroke={getPathColor(1)}
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="15"
        d="M21 94c56-23 112-48 171-60 58-12 115-12 172 30s114 126 171 144 115-30 172-66 114-60 171-66 114 6 172 18l171 36"
        style={{
          filter: `drop-shadow(0 0 8px ${getPathColor(1)}40)`,
        }}
      />
      <path
        stroke={getPathColor(2)}
        className="wavy-path"
        strokeLinecap="round"
        strokeWidth="15"
        d="M21 207c56 23 112 47 171 60 58 12 115 12 172-30S478 111 535 93s115 30 172 66 114 60 171 66 114-6 172-18l171-36"
        style={{
          filter: `drop-shadow(0 0 8px ${getPathColor(2)}40)`,
        }}
      />

      {/* Interactive particles that follow mouse */}
      {interactive && (
        <>
          <circle
            className="particle"
            cx={mousePosition.x * 1242}
            cy={mousePosition.y * 308}
            r="3"
            fill={colors[0]}
            opacity="0.8"
          />
          <circle
            className="particle"
            cx={mousePosition.x * 1242 + 20}
            cy={mousePosition.y * 308 + 10}
            r="2"
            fill={colors[1]}
            opacity="0.6"
          />
          <circle
            className="particle"
            cx={mousePosition.x * 1242 - 15}
            cy={mousePosition.y * 308 - 5}
            r="2.5"
            fill={colors[2]}
            opacity="0.7"
          />
        </>
      )}

      {/* Subtle background glow effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
