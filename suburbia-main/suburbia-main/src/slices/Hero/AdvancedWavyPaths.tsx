"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";

import { useIsSafari } from "@/lib/useIsSafari";

gsap.registerPlugin(useGSAP);

interface AdvancedWavyPathsProps {
  speed?: number;
  intensity?: number;
  colors?: string[];
  interactive?: boolean;
  morphing?: boolean;
  particleCount?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
}

export function AdvancedWavyPaths({ 
  speed = 1, 
  intensity = 1, 
  colors = ["#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6"],
  interactive = true,
  morphing = true,
  particleCount = 8,
  waveAmplitude = 20,
  waveFrequency = 0.02
}: AdvancedWavyPathsProps) {
  const isSafari = useIsSafari(true);
  const root = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(0);

  // Generate dynamic wavy paths
  const generateWavyPath = useCallback((startY: number, amplitude: number, frequency: number, phase: number = 0) => {
    const points = [];
    const width = 1242;
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const y = startY + Math.sin((x * frequency) + phase + time) * amplitude;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    
    return points.join(' ');
  }, [time]);

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

  // Animation loop for morphing paths
  useEffect(() => {
    if (!morphing) return;

    const interval = setInterval(() => {
      setTime(prev => prev + 0.1);
    }, 50);

    return () => clearInterval(interval);
  }, [morphing]);

  useGSAP(() => {
    if (!root.current) return;

    const paths = root.current.querySelectorAll(".wavy-path");
    const particles = root.current.querySelectorAll(".particle");
    const morphingPaths = root.current.querySelectorAll(".morphing-path");
    
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

    // Enhanced pulse effect
    gsap.to(paths, {
      strokeWidth: 15 + (intensity * 5),
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      stagger: { each: 0.2, from: "random" },
      ease: "power2.inOut",
    });

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

        (path as any).hoverTimeline = tl;
      });
    }

    // Particle animation with more complex movement
    if (particles.length > 0) {
      gsap.set(particles, {
        opacity: 0,
        scale: 0,
      });

      particles.forEach((particle, index) => {
        gsap.to(particle, {
          opacity: 0.6,
          scale: 1,
          duration: 2 + (index * 0.2),
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: index * 0.1,
        });

        // Orbital motion for particles
        gsap.to(particle, {
          rotation: 360,
          duration: 8 + (index * 0.5),
          repeat: -1,
          ease: "none",
          transformOrigin: "center center",
        });
      });
    }

    // Morphing path animation
    if (morphing && morphingPaths.length > 0) {
      morphingPaths.forEach((path, index) => {
        gsap.to(path, {
          strokeDashoffset: 1000,
          duration: 3 + (index * 0.5),
          repeat: -1,
          ease: "none",
          stagger: { each: 0.3, from: "random" },
        });
      });
    }

  }, [speed, intensity, interactive, morphing, particleCount]);

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

  // Generate particles
  const generateParticles = () => {
    return Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 50 + (i % 3) * 20;
      const x = mousePosition.x * 1242 + Math.cos(angle + time) * radius;
      const y = mousePosition.y * 308 + Math.sin(angle + time) * radius;
      
      return (
        <circle
          key={i}
          className="particle"
          cx={x}
          cy={y}
          r={2 + (i % 3)}
          fill={getPathColor(i % colors.length)}
          opacity={0.6 + (i % 3) * 0.1}
        />
      );
    });
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
      {/* Static wavy paths */}
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

      {/* Morphing paths */}
      {morphing && (
        <>
          <path
            stroke={getPathColor(3)}
            className="morphing-path"
            strokeLinecap="round"
            strokeWidth="12"
            strokeDasharray="100, 500"
            d={generateWavyPath(100, waveAmplitude, waveFrequency, 0)}
            style={{
              filter: `drop-shadow(0 0 6px ${getPathColor(3)}30)`,
            }}
          />
          <path
            stroke={getPathColor(0)}
            className="morphing-path"
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray="80, 400"
            d={generateWavyPath(200, waveAmplitude * 0.8, waveFrequency * 1.2, Math.PI / 2)}
            style={{
              filter: `drop-shadow(0 0 6px ${getPathColor(0)}30)`,
            }}
          />
          <path
            stroke={getPathColor(1)}
            className="morphing-path"
            strokeLinecap="round"
            strokeWidth="8"
            strokeDasharray="60, 300"
            d={generateWavyPath(250, waveAmplitude * 0.6, waveFrequency * 1.5, Math.PI)}
            style={{
              filter: `drop-shadow(0 0 6px ${getPathColor(1)}30)`,
            }}
          />
        </>
      )}

      {/* Interactive particles */}
      {interactive && generateParticles()}

      {/* Enhanced glow effects */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
