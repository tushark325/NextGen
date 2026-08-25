/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // NextGen Brand & Holographic Colors
        brand: {
          50:  "hsl(234, 100%, 97%)",
          100: "hsl(234, 96%, 93%)",
          200: "hsl(234, 94%, 85%)",
          300: "hsl(234, 90%, 74%)",
          400: "hsl(234, 85%, 63%)",
          500: "hsl(234, 80%, 54%)",
          600: "hsl(234, 78%, 46%)",
          700: "hsl(234, 76%, 38%)",
          800: "hsl(234, 72%, 30%)",
          900: "hsl(234, 68%, 22%)",
          950: "hsl(234, 64%, 14%)",
        },
        cyan: {
          400: "#38bdf8",
          500: "#00f2fe",
          600: "#0284c7",
        },
        hologram: {
          cyan: "#00f2fe",
          blue: "#4facfe",
          violet: "#7f00ff",
          magenta: "#f107a3",
          gold: "#f6d365",
          glow: "rgba(0, 242, 254, 0.4)",
          card: "rgba(10, 15, 36, 0.75)",
          border: "rgba(0, 242, 254, 0.25)",
        },
        success: {
          50:  "hsl(142, 76%, 96%)",
          500: "hsl(142, 71%, 45%)",
          700: "hsl(142, 64%, 32%)",
        },
        warning: {
          50:  "hsl(38, 92%, 95%)",
          500: "hsl(38, 92%, 50%)",
          700: "hsl(38, 78%, 38%)",
        },
        match: {
          excellent: "hsl(142, 71%, 45%)",
          good:      "hsl(84, 70%, 42%)",
          partial:   "hsl(38, 92%, 50%)",
          low:       "hsl(0, 72%, 51%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200px 0" },
          to: { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      backgroundImage: {
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(234 80% 54% / 0.15), transparent)",
        "cyber-grid":
          "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        "hologram-gradient":
          "linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(127, 0, 255, 0.15) 50%, rgba(241, 7, 163, 0.15) 100%)",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 10px 25px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        property: "0 4px 24px -4px rgb(0 0 0 / 0.15)",
        match: "0 0 0 3px hsl(142 71% 45% / 0.2)",
        "holo-sm": "0 0 15px rgba(0, 242, 254, 0.25)",
        "holo-md": "0 0 25px rgba(0, 242, 254, 0.35)",
        "holo-lg": "0 0 40px rgba(0, 242, 254, 0.45), 0 0 80px rgba(127, 0, 255, 0.2)",
        "violet-glow": "0 0 30px rgba(127, 0, 255, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
