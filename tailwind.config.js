/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arena': {
          'bg': '#0a0a0f',
          'surface': '#12121a',
          'card': '#1a1a2e',
          'border': '#2a2a40',
          'accent': '#00f0ff',
          'accent2': '#ff00e5',
          'accent3': '#f0ff00',
          'success': '#00ff88',
          'danger': '#ff3366',
          'warning': '#ffaa00',
          'text': '#e0e0e8',
          'muted': '#6b6b8d',
        }
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 0, 229, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'brutal': '4px 4px 0px #00f0ff',
        'brutal-pink': '4px 4px 0px #ff00e5',
        'brutal-yellow': '4px 4px 0px #f0ff00',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.5)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
