/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tally: {
          bg: '#0B1120',
          sidebar: '#0F1A2E',
          panel: '#1A2744',
          border: '#243358',
          hover: '#1E2F4D',
          accent: '#FCAF1E',
          text: '#E2E8F0',
          muted: '#8B9DC3',
          dr: '#F87171',
          cr: '#34D399',
          input: '#0D1B33',
        },
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
