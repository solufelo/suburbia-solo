"use client";

import { ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import clsx from "clsx";
import React, { useEffect, useRef } from "react";

type Props = {
  foregroundImage: ImageField;
  backgroundImage: ImageField;
  className?: string;
};

export function ParallaxImage({
  foregroundImage,
  backgroundImage,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);

  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const bgAnimation = useRef<Animation | null>(null);
  const fgAnimation = useRef<Animation | null>(null);
  const hasPointerMoved = useRef(false);

  useEffect(() => {
    let rafId = 0;
    const media = window.matchMedia("(min-width: 768px)");

    function animationFrame() {
      let { x: targetX, y: targetY } = targetPosition.current;
      const { x: currentX, y: currentY } = currentPosition.current;

      // Disable motion below md
      if (!media.matches) {
        targetX = 0;
        targetY = 0;
      } else if (!hasPointerMoved.current) {
        const t = performance.now() / 1000;
        targetX = Math.sin(t) * 10;
        targetY = Math.cos(t) * 10;
      }

      const newX = currentX + (targetX - currentX) * 0.12;
      const newY = currentY + (targetY - currentY) * 0.12;

      currentPosition.current = { x: newX, y: newY };

      const bgEffect = (bgAnimation.current?.effect as any) || null;
      const fgEffect = (fgAnimation.current?.effect as any) || null;
      if (bgEffect && typeof bgEffect.setKeyframes === "function") {
        bgEffect.setKeyframes([{ transform: `translate3d(${newX}px, ${newY}px, 0)` }]);
      } else if (backgroundRef.current) {
        // Fallback
        backgroundRef.current.animate(
          [{ transform: `translate3d(${newX}px, ${newY}px, 0)` }],
          { duration: 0, fill: "forwards" }
        );
      }
      if (fgEffect && typeof fgEffect.setKeyframes === "function") {
        fgEffect.setKeyframes([{ transform: `translate3d(${newX * 2.5}px, ${newY * 2.5}px, 0)` }]);
      } else if (foregroundRef.current) {
        // Fallback
        foregroundRef.current.animate(
          [{ transform: `translate3d(${newX * 2.5}px, ${newY * 2.5}px, 0)` }],
          { duration: 0, fill: "forwards" }
        );
      }

      rafId = requestAnimationFrame(animationFrame);
    }

    function updateFromClientPoint(clientX: number, clientY: number) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const relX = (clientX - centerX) / (rect.width / 2); // -1..1
      const relY = (clientY - centerY) / (rect.height / 2); // -1..1
      targetPosition.current = {
        x: Math.max(-1, Math.min(1, -relX)) * 30,
        y: Math.max(-1, Math.min(1, -relY)) * 30,
      };
    }

    function onMouseMove(e: MouseEvent) {
      hasPointerMoved.current = true;
      updateFromClientPoint(e.clientX, e.clientY);
    }

    function onTouchMove(e: TouchEvent) {
      if (!e.touches || !e.touches[0]) return;
      hasPointerMoved.current = true;
      updateFromClientPoint(e.touches[0].clientX, e.touches[0].clientY);
    }

    // Initialize Web Animations to avoid inline styles
    if (backgroundRef.current && !bgAnimation.current) {
      try {
        const effect = new (window as any).KeyframeEffect(
          backgroundRef.current,
          [{ transform: "translate3d(0px, 0px, 0)" }],
          { duration: 0, fill: "forwards" }
        );
        bgAnimation.current = new Animation(effect, (document as any).timeline);
        bgAnimation.current.play();
      } catch {
        bgAnimation.current = backgroundRef.current.animate(
          [{ transform: "translate3d(0px, 0px, 0)" }],
          { duration: 0, fill: "forwards" }
        );
      }
    }
    if (foregroundRef.current && !fgAnimation.current) {
      try {
        const effect = new (window as any).KeyframeEffect(
          foregroundRef.current,
          [{ transform: "translate3d(0px, 0px, 0)" }],
          { duration: 0, fill: "forwards" }
        );
        fgAnimation.current = new Animation(effect, (document as any).timeline);
        fgAnimation.current.play();
      } catch {
        fgAnimation.current = foregroundRef.current.animate(
          [{ transform: "translate3d(0px, 0px, 0)" }],
          { duration: 0, fill: "forwards" }
        );
      }
    }

    rafId = requestAnimationFrame(animationFrame);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    const onChange = () => {
      // Reset targets when breakpoint changes to avoid jump
      targetPosition.current = { x: 0, y: 0 };
    };
    media.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("mousemove", onMouseMove as EventListener);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      media.removeEventListener?.("change", onChange as any);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "grid grid-cols-1 place-items-center",
        className
      )}
    >
      <div
        ref={backgroundRef}
        className="col-start-1 row-start-1 will-change-transform flex items-center justify-center"
      >
        <PrismicNextImage field={backgroundImage} alt="" className="w-11/12 md:w-11/12" />
      </div>

      <div
        ref={foregroundRef}
        className="col-start-1 row-start-1 will-change-transform h-full w-full flex items-center justify-center"
      >
        <PrismicNextImage
          field={foregroundImage}
          alt=""
          imgixParams={{ height: 800 }}
          className="h-auto w-auto max-h-[600px] md:max-h-[700px] max-w-[100%] md:max-w-none"
        />
      </div>
    </div>
  );
}