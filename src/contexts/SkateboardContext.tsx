"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SkateboardCustomization {
  deckTextureURL: string;
  wheelTextureURL: string;
  truckColor: string;
  boltColor: string;
  gripTapeColor?: string;
}

interface SkateboardContextType {
  customization: SkateboardCustomization;
  updateCustomization: (updates: Partial<SkateboardCustomization>) => void;
  resetCustomization: () => void;
}

const defaultCustomization: SkateboardCustomization = {
  deckTextureURL: "https://images.prismic.io/suburbia-solo/aLfc4mGNHVfTOjM6_thank-you-deck.png",
  wheelTextureURL: "/skateboard/SkateWheel1.png",
  truckColor: "#6F6E6A",
  boltColor: "#6F6E6A",
  gripTapeColor: "#555555",
};

const SkateboardContext = createContext<SkateboardContextType | undefined>(undefined);

export function SkateboardProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomization] = useState<SkateboardCustomization>(defaultCustomization);

  const updateCustomization = (updates: Partial<SkateboardCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };

  const resetCustomization = () => {
    setCustomization(defaultCustomization);
  };

  return (
    <SkateboardContext.Provider value={{
      customization,
      updateCustomization,
      resetCustomization,
    }}>
      {children}
    </SkateboardContext.Provider>
  );
}

export function useSkateboard() {
  const context = useContext(SkateboardContext);
  if (context === undefined) {
    throw new Error('useSkateboard must be used within a SkateboardProvider');
  }
  return context;
}
