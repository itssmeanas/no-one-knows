// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050308",
          900: "#0a0610",
          850: "#100a18",
          800: "#171020",
          700: "#22172f"
        },
        veil: {
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd"
        },
        confession: {
          pink: "#ec4899",
          rose: "#fb7185",
          violet: "#7c3aed",
          glow: "#d946ef"
        }
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],
        serif: [
          "var(--font-serif)",
          "ui-serif",
          "Georgia",
          "serif"
        ]
      },
      boxShadow: {
        glow: "0 0 40px rgba(168, 85, 247, 0.24)",
        "glow-pink": "0 0 48px rgba(236, 72, 153, 0.22)",
        "inner-secret": "inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      },
      backgroundImage: {
        "radial-doorway":
          "radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.22), rgba(124, 58, 237, 0.12) 32%, transparent 62%)",
        "midnight-noise":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      keyframes: {
        "slow-pulse": {
          "0%, 100%": {
            opacity: "0.55",
            transform: "scale(1)"
          },
          "50%": {
            opacity: "0.9",
            transform: "scale(1.04)"
          }
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        }
      },
      animation: {
        "slow-pulse": "slow-pulse 7s ease-in-out infinite",
        float: "float 8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;