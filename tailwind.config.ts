import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#eceadf",
        surface: "#f8f6ef",
        sidebar: "#f6f3ea",
        card: "#ffffff",
        ink: "#14203a",
        gold: "#e7c987",
        goldDeep: "#b8934a",
        goldMute: "#96762f",
        muted: "#8f897a",
        muted2: "#9b9484",
        border: "#e8e3d5",
        border2: "#e6e1d3",
        danger: "#b0492f",
        dangerBg: "#f4e9e4",
        success: "#3f7d54",
        successBg: "#e9f1ea",
        warn: "#a5772a",
        warnBg: "#f3ead0",
        inkChip: "#f1e7cd",
      },
      fontFamily: {
        serif: ["var(--font-garamond)", "Georgia", "serif"],
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
        sm: "8px",
        lg: "14px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
