/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          ink: "rgb(var(--brand-ink) / <alpha-value>)",
          sand: "rgb(var(--brand-sand) / <alpha-value>)",
          gold: "rgb(var(--brand-gold) / <alpha-value>)",
          "gold-soft": "rgb(var(--brand-gold-soft) / <alpha-value>)",
          clay: "rgb(var(--brand-clay) / <alpha-value>)",
          olive: "rgb(var(--brand-olive) / <alpha-value>)",
        },
      },
      boxShadow: {
        glow: "0 20px 60px rgba(217, 176, 97, 0.18)",
      },
    },
  },
  plugins: [],
};
