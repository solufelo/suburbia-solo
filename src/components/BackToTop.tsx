"use client";

import { FaArrowUp } from "react-icons/fa";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className="group flex min-h-11 items-center gap-2 uppercase text-brand-lime"
    >
      Back to top
      <FaArrowUp aria-hidden="true" className="transition-transform duration-300 ease-slap group-hover:-translate-y-1" />
    </button>
  );
}
