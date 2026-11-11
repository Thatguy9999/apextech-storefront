import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        silver: "#F1F5F9",
        "royal-blue": "#2563EB",
        "dark-slate": "#0F172A",
        "mid-gray": "#64748B",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        geist: ["Geist", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
