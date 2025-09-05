/** @type {import('tailwindcss').Config} */
import fluid, { extract, screens, fontSize } from 'fluid-tailwind'

module.exports = {
  // Content paths for Tailwind to scan for classes
  content: {files: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/slices/**/*.{js,ts,jsx,tsx,mdx}",
  ],
extract
},
  theme: {
    // Fluid typography configuration
    fluid: ({ theme }) => ({
      defaultScreens: ['20rem', theme('screens.lg')]
    }),
    screens,
    fontSize,
    extend: {
      // Custom font families
      fontFamily: {
        bowlby: ["var(--font-bowlby-sc)"],  // Display font for headings
        DMMono: ["var(--font-DM-mono)"],    // Monospace font for body text
      },
      // Brand color palette
      colors: {
        "brand-blue": "#4876ff",    // Primary blue
        "brand-lime": "#d9f154",    // Accent lime
        "brand-navy": "#2e3192",    // Dark navy
        "brand-orange": "#ff7347",  // Warm orange
        "brand-pink": "#f7d0e9",    // Soft pink
        "brand-purple": "#692e54",  // Deep purple
        "brand-gray": "#fffdf9",    // Off-white
      },
      keyframes: {
        squiggle: {
          "0%": { filter: 'url("#squiggle-0")' },
          "25%": { filter: 'url("#squiggle-1")' },
          "50%": { filter: 'url("#squiggle-2")' },
          "75%": { filter: 'url("#squiggle-3")' },
          "100%": { filter: 'url("#squiggle-4")' },
        },
      },
      animation: {
        squiggle: "squiggle .5s infinite",
      },
    },
  },
  plugins: [fluid],
}

