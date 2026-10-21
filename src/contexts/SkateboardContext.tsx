"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_DESIGN,
  isValidDesign,
  resolveDesign,
  type BoardDesign,
} from "@/lib/customizer-options";

const STORAGE_KEY = "suburbia:design:v1";

export interface SkateboardCustomization {
  deckTextureURL: string;
  wheelTextureURL: string;
  truckColor: string;
  boltColor: string;
}

interface SkateboardContextType {
  /** The board being designed, as option ids (see lib/customizer-options). */
  design: BoardDesign;
  /** Texture URLs and colours for the 3D model, derived from `design`. */
  customization: SkateboardCustomization;
  updateDesign: (updates: Partial<BoardDesign>) => void;
  resetDesign: () => void;
}

const SkateboardContext = createContext<SkateboardContextType | undefined>(undefined);

/**
 * Holds the board design shared by the homepage hero and the /build page, and
 * remembers it between visits.
 */
export function SkateboardProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<BoardDesign>(DEFAULT_DESIGN);
  const [loaded, setLoaded] = useState(false);
  // Changes made before the saved design is read (e.g. a ?deck= preset applied
  // by /build, whose effect runs before this provider's) win over storage.
  const earlyUpdates = useRef<Partial<BoardDesign>>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    let saved: unknown = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      // Ignore unreadable storage.
    }
    if (isValidDesign(saved)) {
      const merged = { ...saved, ...earlyUpdates.current };
      setDesign(isValidDesign(merged) ? merged : saved);
    }
    loadedRef.current = true;
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    } catch {
      // Storage unavailable: the design still works for this visit.
    }
  }, [design, loaded]);

  const updateDesign = useCallback((updates: Partial<BoardDesign>) => {
    if (!loadedRef.current) Object.assign(earlyUpdates.current, updates);
    setDesign((prev) => {
      const next = { ...prev, ...updates };
      return isValidDesign(next) ? next : prev;
    });
  }, []);

  const resetDesign = useCallback(() => setDesign(DEFAULT_DESIGN), []);

  const value = useMemo(() => {
    const r = resolveDesign(design);
    return {
      design,
      customization: {
        deckTextureURL: r.deckTextureURL,
        wheelTextureURL: r.wheelTextureURL,
        truckColor: r.truckColor,
        boltColor: r.boltColor,
      },
      updateDesign,
      resetDesign,
    };
  }, [design, updateDesign, resetDesign]);

  return <SkateboardContext.Provider value={value}>{children}</SkateboardContext.Provider>;
}

export function useSkateboard() {
  const context = useContext(SkateboardContext);
  if (context === undefined) {
    throw new Error("useSkateboard must be used within a SkateboardProvider");
  }
  return context;
}
