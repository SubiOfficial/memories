export interface WordItem {
  id: string;
  text: string;
}

export type ThemeMode = "dark" | "light";

export type FontKey = "inter" | "poppins" | "playfair" | "mono";

export type ColorThemeKey = "aurora" | "sunset" | "emerald" | "royal" | "custom";

export type SphereRotationDirection =
  | "rightToLeft"
  | "leftToRight"
  | "topToBottom"
  | "bottomToTop"
  | "cross";

export interface ColorTheme {
  accent: string;
  accent2: string;
}

export interface SettingsState {
  theme: ThemeMode;
  font: FontKey;
  colorTheme: ColorThemeKey;
  customAccent: string;
  customAccent2: string;
  sphereWordColor: string;
  sphereSpread: number;
  sphereRotationSpeed: number;
  sphereRotationDirection: SphereRotationDirection;
  appTextSize: number;
}
