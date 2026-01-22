/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mint": "#e2f2e8",
        "sage": "#a5c4ad",
        "leaf": "#5eb56e",
        "leaf-hover": "#4ea55e",
        "moss": "#2d4030",
        "pastel-sphere": "#c6e6d1",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}