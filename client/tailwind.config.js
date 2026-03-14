/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {  
        'jg-navy': '#0B1C2C',
        'jg-navy-light': '#0f2240',
        'jg-gold': '#D4A455',
        'jg-gold-light': '#f1d97c',
        'jg-cream': '#F6F2ED',
      },
    },
  },
  plugins: [],
}