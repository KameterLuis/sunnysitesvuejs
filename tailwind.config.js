/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "--sunny-orange": "var(--sunny-orange)",
        "--sunny-gray": "var(--sunny-gray)",
      },
      boxShadow: {
        sunny: "0 0 15px 6px rgba(0,0,0,0.2)",
      },
      dropShadow: {
        sunny: "0 0 4px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
