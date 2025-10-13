import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bespoke: ["var(--font-bespoke)", "Bespoke Sans", "sans-serif"],
        clash: ["var(--font-clash)", "Clash Display", "sans-serif"],
      },
    },
  },
  plugins: [animate],
} satisfies Config;
