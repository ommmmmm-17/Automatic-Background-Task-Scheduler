/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff", 100: "#dbe6ff", 500: "#5b8def", 600: "#3a6fe0", 700: "#2c55b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(91,141,239,0.45)",
      },
    },
  },
  plugins: [],
};
