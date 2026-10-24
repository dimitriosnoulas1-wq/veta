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
        card: "var(--card-solid)",
        line: "var(--line)",
        plum: "var(--plum)",
        "plum-deep": "var(--plum-deep)",
        orange: "var(--orange)",
        "orange-btn": "var(--orange-btn)",
        good: "var(--good)",
        violet: "var(--violet)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px rgb(0 0 0 / 0.28)",
        glow: "0 0 40px color-mix(in srgb, var(--glow-a) 30%, transparent)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, var(--glow-a), var(--glow-b))",
      },
    },
  },
  plugins: [],
};

export default config;
