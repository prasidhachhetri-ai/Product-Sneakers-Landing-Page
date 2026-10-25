import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#061c3b",
        bone: "#fff8e9",
        volt: "#f4bd45",
        cobalt: "#e9232f",
        coral: "#12aeb8",
      },
      boxShadow: {
        lift: "0 24px 70px rgba(6,28,59,.13)",
        glow: "0 18px 60px rgba(244,189,69,.24)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
