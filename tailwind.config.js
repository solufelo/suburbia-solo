/** @type {import('tailwindcss').Config} */
import fluid, { extract, screens, fontSize } from 'fluid-tailwind'

module.exports = {
  content: {
    files: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/slices/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    extract,
  },
  // Display sizes are picked by prop in <Heading size="..."> (t-${size}).
  safelist: ["t-mega", "t-xl", "t-lg", "t-md", "t-sm", "t-xs"],
  theme: {
    fluid: ({ theme }) => ({
      defaultScreens: ['20rem', theme('screens.lg')]
    }),
    screens,
    fontSize,
    extend: {
      fontFamily: {
        // Text face. Display type is the same family at 62% width / 900 weight (.font-display).
        sans: ["var(--font-archivo)", "Arial Narrow", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        marker: ["var(--font-marker)", "Comic Sans MS", "cursive"],
      },
      colors: {
        ink: "#151314",
        paper: "#f3eee4",
        kraft: "#e6dcc8",
        "brand-blue": "#4876ff",
        "brand-lime": "#d9f154",
        "brand-navy": "#2e3192",
        "brand-orange": "#ff7347",
        "brand-pink": "#f7d0e9",
        "brand-hot": "#ff4fa3",
        "brand-purple": "#692e54",
        "brand-gray": "#f3eee4",
      },
      transitionTimingFunction: {
        // Fast out, soft landing: the house curve for anything that moves.
        snap: "cubic-bezier(.2,.9,.25,1)",
        slap: "cubic-bezier(.34,1.56,.64,1)",
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
  // hover: styles only on devices that can hover, so a tap on a phone does not leave buttons stuck mid-hover.
  future: { hoverOnlyWhenSupported: true },
  plugins: [fluid],
}
