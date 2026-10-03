/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "surface": "var(--color-bg)",
        "surface-dim": "var(--color-bg)",
        "surface-bright": "var(--color-surface-bright)",
        "surface-container-lowest": "var(--color-surface-lowest)",
        "surface-container-low": "var(--color-surface-low)",
        "surface-container": "var(--color-surface)",
        "surface-container-high": "var(--color-surface-high)",
        "surface-container-highest": "var(--color-surface-highest)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "accent-primary": "rgb(var(--accent-primary) / <alpha-value>)",
        "primary": "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "primary-container": "rgb(var(--accent-primary) / <alpha-value>)",
        "on-primary-container": "var(--color-on-primary)",
        "secondary": "var(--color-secondary)",
        "secondary-container": "var(--color-surface-high)",
        "tertiary": "rgb(var(--color-tertiary) / <alpha-value>)",
        "error": "rgb(var(--color-psy-danger-rgb, 220 38 38) / <alpha-value>)",
        "warning": "rgb(var(--color-psy-warning-rgb, 217 119 6) / <alpha-value>)",
        "outline": "var(--color-outline)",
        "navy": "var(--color-navy)",
        "gradient-start": "var(--color-gradient-start)",
        
        "color-action": "var(--color-action)",
        "semantic-warning": "rgb(var(--color-psy-danger-rgb, 220 38 38) / <alpha-value>)",
        "semantic-positive": "rgb(var(--color-psy-safe-rgb, 5 150 105) / <alpha-value>)",
        "semantic-neutral": "rgb(var(--color-semantic-neutral) / <alpha-value>)",
        
        "psy-safe": "rgb(var(--color-psy-safe-rgb, 5 150 105) / <alpha-value>)",
        "psy-safe-bg": "var(--color-psy-safe-bg)",
        "psy-safe-text": "var(--color-psy-safe-text)",
        "psy-danger": "rgb(var(--color-psy-danger-rgb, 220 38 38) / <alpha-value>)",
        "psy-danger-bg": "var(--color-psy-danger-bg)",
        "psy-danger-text": "var(--color-psy-danger-text)",
        "psy-warning": "rgb(var(--color-psy-warning-rgb, 217 119 6) / <alpha-value>)",
        "psy-warning-bg": "var(--color-psy-warning-bg)",
        "psy-warning-text": "var(--color-psy-warning-text)"
      },
      fontFamily: {
        'sans': ['"Plus Jakarta Sans"', 'sans-serif'],
        'display': ['Outfit', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
