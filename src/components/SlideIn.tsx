"use client";

import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'

type Props = {
    children: React.ReactNode
    delay?: number
    direction?: 'left' | 'right' | 'up' | 'down'
    duration?: number
    easing?: string
    className?: string
    style?: React.CSSProperties
    once?: boolean
}

export function SlideIn({ children, delay = 0, direction = 'left', duration = 0.5, easing = 'ease-in-out', className, style, once = false }: Props) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('slide-in-visible')
                    if (once) {
                        observer.unobserve(element);
                    }
                } else if (!once) {
                    entry.target.classList.remove('slide-in-visible')
                }
            });
        }, { threshold: 0, rootMargin: '0px' });

        observer.observe(element);

        return () => observer.disconnect();
    }, [once]);
  return (
    <div ref={elementRef} className={clsx('slide-in-hidden', className)} style={{ ...style, transition: `transform ${duration}s ${easing}, opacity ${duration}s ${easing}`, transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}