// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["Outfit", "sans-serif"],
        sans:    ["Outfit", "sans-serif"],
      },

      colors: {
        void:    "#060612",
        deep:    "#0a0a1a",
        surface: "#0f0f24",
        elevated:"#141430",

        neon: {
          cyan:    "#00e5ff",
          violet:  "#7c3aed",
          "violet-lt": "#a78bfa",
          emerald: "#00ffa3",
          rose:    "#ff4d8b",
          amber:   "#ffb347",
        },
      },

      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%)",
        "grad-success": "linear-gradient(135deg, #00ffa3 0%, #00e5ff 100%)",
        "grad-danger":  "linear-gradient(135deg, #ff4d8b 0%, #7c3aed 100%)",
        "grad-warm":    "linear-gradient(135deg, #ffb347 0%, #ff4d8b 100%)",
        "mesh": `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(124,58,237,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 60%, rgba(0,229,255,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 40% 60% at 50% 100%, rgba(0,255,163,0.07) 0%, transparent 60%)
        `,
      },

      boxShadow: {
        "glass":       "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
        "neon-cyan":   "0 0 20px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)",
        "neon-violet": "0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)",
        "neon-emerald":"0 0 20px rgba(0,255,163,0.3), 0 0 60px rgba(0,255,163,0.1)",
        "card-hover":  "0 16px 48px rgba(0,0,0,0.5)",
      },

      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },

      backdropBlur: {
        xs: "4px",
      },

      keyframes: {
        fadeIn:    { from: { opacity: "0" },                              to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(20px)" },to: { opacity: "1", transform: "translateY(0)" } },
        slideDown: { from: { opacity: "0", transform: "translateY(-10px)" },to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn:   { from: { opacity: "0", transform: "scale(0.92)" },    to: { opacity: "1", transform: "scale(1)" } },
        shimmer:   { "0%": { backgroundPosition: "-200% center" }, "100%": { backgroundPosition: "200% center" } },
        float:     { "0%,100%": { transform: "translateY(0)" },            "50%": { transform: "translateY(-12px)" } },
        pulseNeon: { "0%,100%": { opacity: "1" },                          "50%": { opacity: "0.5" } },
        orbPulse:  { "0%,100%": { transform: "scale(1)" },                 "50%": { transform: "scale(1.15)" } },
      },

      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        "slide-down": "slideDown 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
        "scale-in":   "scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
        "shimmer":    "shimmer 1.8s linear infinite",
        "float":      "float 6s ease-in-out infinite",
        "pulse-neon": "pulseNeon 3s ease-in-out infinite",
        "orb-pulse":  "orbPulse 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;