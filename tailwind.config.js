// tailwind.config.js - Tailwind CSS v4 configuration for JobPilot
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable JIT mode (default in v4)
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
    "./public/**/*.html",
  ],
  darkMode: "class", // use class strategy; data-theme attribute toggles dark theme
  theme: {
    extend: {},
  },
  plugins: [],
  // Preserve the custom CSS variables defined in globals.css
  corePlugins: {
    preflight: true,
  },
};
