/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06090e',
          900: '#0b0f19',
          800: '#111827',
          700: '#1f293d',
          600: '#334155',
        },
        primary: {
          DEFAULT: '#10b981', // emerald
          glow: 'rgba(16, 185, 129, 0.35)',
          light: '#34d399',
          dark: '#059669',
        },
        cyan: {
          accent: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.3)',
        },
        macro: {
          protein: '#f97316', // orange
          carbs: '#38bdf8',   // light blue
          fat: '#fbbf24',     // amber
          fiber: '#34d399',   // emerald mint
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
