import type { ColorTheme, ColorThemeKey, FontKey } from "../types";

export const COLOR_THEMES: Record<Exclude<ColorThemeKey, "custom">, ColorTheme> = {
  aurora: { accent: "#7dd8ff", accent2: "#b98cff" },
  sunset: { accent: "#ff9a7d", accent2: "#ff5c8a" },
  emerald: { accent: "#5ef2c0", accent2: "#3ba3ff" },
  royal: { accent: "#f5c76e", accent2: "#8a5cf6" },
};

export const FONT_STACKS: Record<FontKey, string> = {
  inter: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, "Courier New", monospace',
};

export const FONT_LABELS: Record<FontKey, string> = {
  inter: "Inter (Modern)",
  poppins: "Poppins (Rounded)",
  playfair: "Playfair (Elegant)",
  mono: "JetBrains Mono (Futuristic)",
};

export const COLOR_THEME_LABELS: Record<ColorThemeKey, string> = {
  aurora: "Aurora",
  sunset: "Sunset",
  emerald: "Emerald",
  royal: "Royal",
  custom: "Custom",
};
