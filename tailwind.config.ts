import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Unbounded'", "cursive"],
        body: ["'Chivo Mono'", "monospace"],
      },
      colors: {
        bg: "#0A0A0A",
        surface: "#141414",
        border: "#222222",
        lime: "#BBFF00",
        "lime-dim": "#8FCC00",
        muted: "#555555",
        text: "#F0F0F0",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulse_lime: {
          "0%, 100%": { boxShadow: "0 0 0 0 #BBFF0044" },
          "50%": { boxShadow: "0 0 0 8px #BBFF0000" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease forwards",
        pop: "pop 0.25s ease forwards",
        pulse_lime: "pulse_lime 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
