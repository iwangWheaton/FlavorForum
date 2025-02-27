/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: "#BB4430", 
        blue: "#7EBDC2",
        accent: "#F59E0B", 
        background: "#545454",
        foreground: "#1F2937",
      },
      fontFamily: {
        sans: ['Rufina', "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};