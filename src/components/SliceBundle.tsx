"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface SliceBundleProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
  stickyOffset?: number;
  bundleId?: string;
  peekHeight?: number;
}

export function SliceBundle({ 
  children, 
  className, 
  sticky = false, 
  stickyOffset = 0,
  bundleId,
  peekHeight = 0
}: SliceBundleProps) {
  const bundleRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!sticky || !bundleRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: `${stickyOffset}px 0px 0px 0px`
      }
    );

    observer.observe(bundleRef.current);

    return () => observer.disconnect();
  }, [sticky, stickyOffset]);

  return (
    <div
      ref={bundleRef}
      id={bundleId}
      className={clsx(
        "relative",
        sticky && "sticky",
        sticky && `top-[${stickyOffset}px]`,
        className
      )}
      style={{
        top: sticky ? `${stickyOffset}px` : undefined,
        zIndex: sticky ? 10 : 'auto',
        marginTop: peekHeight > 0 ? `-${peekHeight}px` : undefined,
        paddingTop: peekHeight > 0 ? `${peekHeight}px` : undefined
      }}
    >
      {children}
    </div>
  );
}
