import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ColorThemeKey,
  FontKey,
  SettingsState,
  SphereRotationDirection,
  ThemeMode,
} from "../types";
import { COLOR_THEMES } from "../lib/themes";

interface SettingsStore extends SettingsState {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setFont: (font: FontKey) => void;
  setColorTheme: (colorTheme: ColorThemeKey) => void;
  setCustomAccent: (accent: string, accent2: string) => void;
  setSphereWordColor: (color: string) => void;
  setSphereSpread: (spread: number) => void;
  setSphereRotationSpeed: (speed: number) => void;
  setSphereRotationDirection: (direction: SphereRotationDirection) => void;
  setAppTextSize: (size: number) => void;
  resetSettings: () => void;
}

function clampRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const SPHERE_SPREAD_MIN = 0.7;
export const SPHERE_SPREAD_MAX = 1.6;
export const SPHERE_ROTATION_SPEED_MIN = 0.2;
export const SPHERE_ROTATION_SPEED_MAX = 5;
export const APP_TEXT_SIZE_MIN = 0.85;
export const APP_TEXT_SIZE_MAX = 1.25;

const defaults: SettingsState = {
  theme: "dark",
  font: "inter",
  colorTheme: "aurora",
  customAccent: COLOR_THEMES.aurora.accent,
  customAccent2: COLOR_THEMES.aurora.accent2,
  sphereWordColor: "#f5f6fa",
  sphereSpread: 1,
  sphereRotationSpeed: 1,
  sphereRotationDirection: "rightToLeft",
  appTextSize: 1,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setFont: (font) => set({ font }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setCustomAccent: (customAccent, customAccent2) =>
        set({ customAccent, customAccent2, colorTheme: "custom" }),
      setSphereWordColor: (sphereWordColor) => set({ sphereWordColor }),
      setSphereSpread: (sphereSpread) =>
        set({ sphereSpread: clampRange(sphereSpread, SPHERE_SPREAD_MIN, SPHERE_SPREAD_MAX) }),
      setSphereRotationSpeed: (sphereRotationSpeed) =>
        set({
          sphereRotationSpeed: clampRange(
            sphereRotationSpeed,
            SPHERE_ROTATION_SPEED_MIN,
            SPHERE_ROTATION_SPEED_MAX,
          ),
        }),
      setSphereRotationDirection: (sphereRotationDirection) => set({ sphereRotationDirection }),
      setAppTextSize: (appTextSize) =>
        set({ appTextSize: clampRange(appTextSize, APP_TEXT_SIZE_MIN, APP_TEXT_SIZE_MAX) }),
      resetSettings: () => set(defaults),
    }),
    { name: "text-sphere-settings" },
  ),
);
