"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface CascadeContainerProps {
  children: ReactNode;
  className?: string;
  cascadeSpeed?: number;
  preserveIntegrity?: boolean;
}

export function CascadeContainer({ 
  children, 
  className,
  cascadeSpeed = 0.1,
  preserveIntegrity = true
}: CascadeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative",
        preserveIntegrity && "min-h-screen",
        className
      )}
      style={{
        transform: `translateY(${scrollY * cascadeSpeed}px)`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}
