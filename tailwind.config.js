/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        darkPurple: "#1C1C33",
        lightPurple: "#22223E",
        lightGray: "#E2E8EA",
      },
      textColor: {
        lightGray: "#E2E8EA",
      },
      borderColor: {
        lightGray: "#E2E8EA",
      },
    },
  },
  plugins: [],
};
