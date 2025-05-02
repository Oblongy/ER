/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'ken-burns': 'kenBurns 30s ease-in-out infinite',
        'title-slide': 'titleSlide 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1.05) translate(0, 0)' },
          '25%': { transform: 'scale(1.15) translate(-2%, -2%)' },
          '50%': { transform: 'scale(1.1) translate(2%, 2%)' },
          '75%': { transform: 'scale(1.15) translate(2%, -2%)' },
          '100%': { transform: 'scale(1.05) translate(0, 0)' },
        },
        titleSlide: {
          '0%': { opacity: '0', transform: 'translateY(-100px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}