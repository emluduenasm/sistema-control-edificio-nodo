import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nodo: {
          bg: "#f5f7fb",
          ink: "#162033",
          line: "#d9e1ec",
          accent: "#0f766e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
