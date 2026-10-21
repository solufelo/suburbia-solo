"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "./Logo";
import { CartButton } from "./cart/CartButton";
import { NAV } from "@/lib/site";

/**
 * Fixed header: transparent over the top of the page, paper once you scroll,
 * tucks away while scrolling down and comes back on the way up.
 * Phones get a full-screen menu instead of a second row of links.
 */
export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 240 && y > lastY.current + 4);
        if (y < lastY.current - 4 || y <= 240) setHidden(false);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the menu on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[transform,background-color,box-shadow] duration-500 ease-snap",
          scrolled && !menuOpen ? "bg-paper/95 shadow-[0_2px_0_#151314] backdrop-blur-sm" : "bg-transparent",
          hidden && !menuOpen && "-translate-y-[calc(100%+4px)]",
        )}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Suburbia Skate home"
            className={clsx(
              "relative z-10 -ml-1 shrink-0 p-1 transition-transform duration-300 ease-slap hover:-rotate-3 hover:scale-105",
              menuOpen ? "text-brand-lime" : "text-ink",
            )}
          >
            <Logo className="h-11 w-auto md:h-12" />
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group relative flex items-baseline gap-1.5 px-3 py-2"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-1 inset-y-1.5 origin-left -rotate-1 scale-x-0 bg-brand-lime transition-transform duration-300 ease-snap group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                    <span aria-hidden="true" className="relative font-mono text-[0.65rem] text-ink/60">
                      0{i + 1}
                    </span>
                    <span className="font-display relative text-[1.45rem] uppercase leading-none">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-3">
            <CartButton tone={menuOpen ? "lime" : "ink"} />
            <button
              type="button"
              className="icon-btn md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true" className="relative block h-3.5 w-5">
                <span
                  className={clsx(
                    "absolute left-0 top-0 h-[3px] w-full bg-ink transition-transform duration-300 ease-snap",
                    menuOpen && "translate-y-[5.5px] rotate-45",
                  )}
                />
                <span
                  className={clsx(
                    "absolute bottom-0 left-0 h-[3px] w-full bg-ink transition-transform duration-300 ease-snap",
                    menuOpen && "-translate-y-[5.5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </>
  );
}

function MobileMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      className={clsx(
        "on-dark bg-texture fixed inset-0 z-40 flex flex-col bg-ink px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(var(--header-h)+env(safe-area-inset-top)+1.5rem)] text-paper transition-[clip-path] duration-700 ease-snap md:hidden",
        open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
      )}
      inert={!open}
      aria-hidden={!open}
    >
      <nav aria-label="Mobile" className="grow">
        <ul className="flex flex-col">
          {NAV.map((item, i) => (
            <li
              key={item.href}
              className={clsx(
                "border-b border-white/15 transition-[transform,opacity] duration-700 ease-snap",
                open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
              style={{ transitionDelay: open ? `${0.12 + i * 0.06}s` : "0s" }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="group flex items-end justify-between gap-4 py-3"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-brand-lime">0{i + 1}</span>
                  <span className="font-display text-[4.25rem] uppercase leading-[0.85] transition-colors group-hover:text-brand-lime group-aria-[current=page]:text-brand-lime">
                    {item.label}
                  </span>
                </span>
                <span className="pb-2 font-mono text-xs uppercase tracking-widest text-white/50">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p
        className={clsx(
          "font-marker text-xl text-brand-hot transition-opacity delay-500 duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        Escape the cul-de-sac.
      </p>
      <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-widest text-white/45">
        Fictional brand · demo shop · nothing ships
      </p>
    </div>
  );
}
