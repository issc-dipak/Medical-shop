/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F8FAFC",
        panel: "#FFFFFF",
        ink: "#0F172A",
        muted: "#64748B",
        line: "#E2E8F0",
        teal: {
          DEFAULT: "#0891B2",
          dark: "#0E7490",
          light: "rgba(8, 145, 178, 0.06)",
        },
        amber: {
          DEFAULT: "#D97706",
          light: "rgba(217, 119, 6, 0.06)",
        },
        brick: {
          DEFAULT: "#E11D48",
          light: "rgba(225, 29, 72, 0.06)",
        },
        sage: {
          DEFAULT: "#059669",
          light: "rgba(5, 150, 105, 0.06)",
        },
        accent: {
          DEFAULT: "#0F766E",
          light: "rgba(15, 118, 110, 0.08)",
        }
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(37, 99, 235, 0.12)",
        card: "0 4px 30px rgba(15, 23, 42, 0.04)",
      }
    },
  },
  plugins: [],
};
