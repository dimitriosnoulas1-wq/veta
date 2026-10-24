import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        card: "var(--card)",
        line: "var(--line)",
        plum: "var(--plum)",
        "plum-deep": "var(--plum-deep)",
        orange: "var(--orange)",
        "orange-btn": "var(--orange-btn)",
        good: "var(--good)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        card: "0 16px 40px rgb(28 16 20 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
