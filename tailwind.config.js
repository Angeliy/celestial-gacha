/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b061a",
        background: "#141316",
        "primary-container": "#1a1035",
        primary: "#cdc0ef",
        secondary: "#fff9ef",
        gold: "#ffd700",
        amber: "#ff8c00",
        cinnabar: "#e63946",
        jade: "#90e0ef",
        violet: "#c77dff",
        surface: "#141316",
        "surface-container": "#201f22",
        "surface-container-high": "#2b292c",
        "surface-container-highest": "#363437",
        "on-surface": "#e6e1e5",
        "on-surface-variant": "#cac4cf",
        outline: "#938f98",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        "gold-bloom": "0 0 32px rgba(255, 215, 0, 0.28), 0 0 70px rgba(255, 140, 0, 0.14)",
        "violet-bloom": "0 0 32px rgba(199, 125, 255, 0.24)",
        "jade-bloom": "0 0 32px rgba(144, 224, 239, 0.22)",
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Noto Serif", "serif"],
        body: ["Be Vietnam Pro", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        label: ["Geist", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
