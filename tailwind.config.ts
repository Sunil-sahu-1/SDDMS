import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1736",
        ink: "#111827",
        mist: "#F5F7FB",
        line: "#E5E7EB"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, .06)"
      }
    }
  },
  plugins: []
};
export default config;