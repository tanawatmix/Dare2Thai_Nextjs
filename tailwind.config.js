/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // ⭐️ สำคัญ!
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
    },
  },
  },
  plugins: [],
};
export default config;