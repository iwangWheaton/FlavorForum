/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { //example custom colors
        primary: "#4F46E5", // Custom Primary Color (Blue)
        secondary: "#9333EA", // Custom Secondary Color (Purple)
        accent: "#F59E0B", // Custom Accent Color (Orange)
        background: "#545454", // Custom Background Color
        foreground: "#1F2937", // Custom Foreground (Text)
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      spacing: {
        18: "4.5rem", // Custom Spacing Value
      },
    },
  },
  plugins: [],
};
