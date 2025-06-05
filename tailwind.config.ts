import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de la paleta
        primary: {
          DEFAULT: "#8BC34A", // Verde lima (Sábado)
          light: "#A4D65E",
          dark: "#689F38",
        },
        secondary: {
          DEFAULT: "#4DB6AC", // Azul turquesa (Viernes/Domingo)
          light: "#80CBC4",
          dark: "#00897B",
        },
        // Colores de la imagen banner
        nature: {
          water: "#7BBEBC", // Azul turquesa del agua
          forest: "#5D8B7F", // Verde bosque
          light: "#D6E8D4", // Verde claro/menta
          cream: "#F0EBE0", // Color crema/beige de las túnicas
          glow: "#F9F3D9", // Tono dorado de la luz
        },
        // Colores de fondo y texto
        background: {
          DEFAULT: "#121212", // Fondo negro
          light: "#1E1E1E",
        },
        text: {
          DEFAULT: "#FFFFFF", // Texto blanco
          muted: "#CCCCCC", // Texto gris claro
        },
        // Mantener colores de shadcn/ui
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
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
export default config
