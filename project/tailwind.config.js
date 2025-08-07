/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'dark-gray': '#121212',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14',
        'neon-sm': '0 0 5px #39FF14, 0 0 10px #39FF14',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14' },
          '100%': { boxShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14' },
        }
      }
    },
  },
  plugins: [],
};
