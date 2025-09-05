"use client";

import React from 'react';
import { useSkateboard } from '@/contexts/SkateboardContext';

// Available texture options from your Prismic gallery
const DECK_TEXTURES = [
  {
    id: 'thank-you',
    name: 'Thank You Deck',
    url: 'https://images.prismic.io/suburbia-solo/aLfc4mGNHVfTOjM6_thank-you-deck.png'
  },
  {
    id: 'yellow-black',
    name: 'Yellow & Black',
    url: 'https://images.prismic.io/suburbia-solo/aLfc6mGNHVfTOjNC_yellow-and-black.png'
  },
  // Add more textures here as you get them from Prismic
];

const TRUCK_COLORS = [
  { name: 'Silver', value: '#6F6E6A' },
  { name: 'Black', value: '#000000' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Red', value: '#FF0000' },
];

export function BoardBuilder() {
  const { customization, updateCustomization } = useSkateboard();

  return (
    <div className="space-y-6">
      {/* Deck Texture Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Deck Design</h3>
        <div className="grid grid-cols-2 gap-3">
          {DECK_TEXTURES.map((texture) => (
            <button
              key={texture.id}
              onClick={() => updateCustomization({ deckTextureURL: texture.url })}
              className={`p-3 border-2 rounded-lg transition-colors ${
                customization.deckTextureURL === texture.url
                  ? 'border-lime-500 bg-lime-500/20'
                  : 'border-zinc-600 hover:border-zinc-500 bg-zinc-800/50'
              }`}
            >
              <div className="w-full h-16 bg-zinc-700 rounded mb-2 flex items-center justify-center text-xs text-zinc-300">
                {texture.name}
              </div>
              <span className="text-xs text-zinc-300">{texture.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Truck Color Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Truck Color</h3>
        <div className="flex gap-3">
          {TRUCK_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateCustomization({ truckColor: color.value })}
              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                customization.truckColor === color.value
                  ? 'border-lime-500'
                  : 'border-zinc-600 hover:border-zinc-500'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Bolt Color Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Bolt Color</h3>
        <div className="flex gap-3">
          {TRUCK_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateCustomization({ boltColor: color.value })}
              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                customization.boltColor === color.value
                  ? 'border-lime-500'
                  : 'border-zinc-600 hover:border-zinc-500'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="text-sm text-zinc-400">
        <p>Changes will appear on the skateboard in real-time!</p>
      </div>
    </div>
  );
}
