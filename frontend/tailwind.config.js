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
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "rgba(37, 99, 235, 0.08)",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "rgba(245, 158, 11, 0.08)",
        },
        brick: {
          DEFAULT: "#DC2626",
          light: "rgba(220, 38, 38, 0.08)",
        },
        sage: {
          DEFAULT: "#16A34A",
          light: "rgba(22, 163, 74, 0.08)",
        },
        accent: {
          DEFAULT: "#0D9488",
          light: "rgba(13, 148, 136, 0.1)",
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
