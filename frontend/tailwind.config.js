/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lula: {
          DEFAULT: '#E53935',
          dark: '#C62828',
          light: '#EF5350'
        },
        bolsonaro: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}
