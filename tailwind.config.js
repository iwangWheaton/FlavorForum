/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { // our colors
        red: "#BB4430", 
        orange: "#C95742",
        blue: "#7EBDC2",
        gray: "#231F20", 
        background: "#FDF6EE",
        foreground: "#231F20",
      },
      fontFamily: {
        sans: ['Rufina', "serif"],
        body: ["Inter", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#000000', // Set default text color to black
            h1: {
              color: '#000000',
            },
            h2: {
              color: '#000000',
            },
            option: {
              color: '#000000',
            },
            p: {
              color: '#000000',
            },
            li: {
              color: '#000000',
            },
            span: {
              color: '#000000',
            },
            a: {
              color: '#000000',
            },
          },
        }
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