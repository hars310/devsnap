/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        bg: '#0a0b0e',
        surface: '#111318',
        border: '#1e2130',
        accent: '#00e5a0',
        'accent-dim': '#00e5a015',
        muted: '#3d4466',
        text: '#e2e8f0',
        subtle: '#8892b0',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.8)' },
        },
      },
    },
  },
  plugins: [],
};