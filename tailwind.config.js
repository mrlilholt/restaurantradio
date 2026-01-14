/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#38bdf8', // Sky-400
          dark: '#0284c7',    // Sky-600
          light: '#e0f2fe',   // Sky-100
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        title: ['Montserrat', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}