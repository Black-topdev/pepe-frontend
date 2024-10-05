/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'sm': '640px',
      'xl': '1024px',
    },
    extend: {
      fontFamily: {
        sans : ['"Pixelify Sans"' , defaultTheme.fontFamily.sans],
        jua: ['"Jua"' , defaultTheme.fontFamily.sans]
      }
    },
  },
  plugins: [],
}

