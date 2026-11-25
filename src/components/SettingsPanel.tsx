import { useRef } from "react";
import { motion } from "framer-motion";
import { PanelShell } from "./PanelShell";
import { DownloadIcon, UploadIcon } from "./icons";
import {
  APP_TEXT_SIZE_MAX,
  APP_TEXT_SIZE_MIN,
  SPHERE_ROTATION_SPEED_MAX,
  SPHERE_ROTATION_SPEED_MIN,
  SPHERE_SPREAD_MAX,
  SPHERE_SPREAD_MIN,
  useSettingsStore,
} from "../store/settingsStore";
import { useWordsStore } from "../store/wordsStore";
import { COLOR_THEMES, COLOR_THEME_LABELS, FONT_LABELS } from "../lib/themes";
import { exportWords, parseImportedWords, readFileAsText } from "../lib/exportImport";
import type { ColorThemeKey, FontKey, SphereRotationDirection } from "../types";

const ROTATION_DIRECTION_LABELS: Record<SphereRotationDirection, string> = {
  rightToLeft: "Right → Left",
  leftToRight: "Left → Right",
  topToBottom: "Top → Bottom",
  bottomToTop: "Bottom → Top",
  cross: "Cross (Both)",
};

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider first:mt-0"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </p>
  );
}

function SliderRow({
  value,
  min,
  max,
  step,
  label,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full flex-1 cursor-pointer appearance-none rounded-full"
        style={{ background: "var(--border)", accentColor: "var(--accent)" }}
      />
      <span
        className="w-11 shrink-0 text-right text-xs tabular-nums"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();
  const words = useWordsStore((s) => s.words);
  const setWords = useWordsStore((s) => s.setWords);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (file: File) => {
    try {
      const raw = await readFileAsText(file);
      const parsed = parseImportedWords(raw);
      if (parsed.length === 0) {
        window.alert("No valid words found in that file.");
        return;
      }
      setWords(parsed);
    } catch {
      window.alert("Couldn't read that file — expected a JSON export from this app.");
    }
  };

  return (
    <PanelShell open={open} title="Settings" onClose={onClose}>
      <SectionLabel>Appearance</SectionLabel>
      <div className="glass-panel flex rounded-xl p-1">
        {(["dark", "light"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => settings.setTheme(mode)}
            className="flex-1 rounded-lg py-1.5 text-sm capitalize transition"
            style={{
              background: settings.theme === mode ? "var(--accent)" : "transparent",
              color: settings.theme === mode ? "#0a0a0f" : "var(--text-primary)",
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <SectionLabel>App Text Size</SectionLabel>
      <SliderRow
        value={settings.appTextSize}
        min={APP_TEXT_SIZE_MIN}
        max={APP_TEXT_SIZE_MAX}
        step={0.05}
        label={`${Math.round(settings.appTextSize * 100)}%`}
        onChange={settings.setAppTextSize}
      />

      <SectionLabel>Font</SectionLabel>
      <select
        value={settings.font}
        onChange={(e) => settings.setFont(e.target.value as FontKey)}
        className="glass-panel w-full rounded-xl px-3 py-2 text-sm outline-none"
        style={{ color: "var(--text-primary)" }}
      >
        {Object.entries(FONT_LABELS).map(([key, label]) => (
          <option key={key} value={key} style={{ color: "#000" }}>
            {label}
          </option>
        ))}
      </select>

      <SectionLabel>Color Theme</SectionLabel>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(COLOR_THEMES) as ColorThemeKey[]).map((key) => {
          const theme = COLOR_THEMES[key as Exclude<ColorThemeKey, "custom">];
          return (
            <motion.button
              key={key}
              type="button"
              title={COLOR_THEME_LABELS[key]}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => settings.setColorTheme(key)}
              className="flex h-10 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                outline: settings.colorTheme === key ? "2px solid var(--text-primary)" : "none",
                outlineOffset: 2,
              }}
            />
          );
        })}
      </div>

      <SectionLabel>Custom Accent</SectionLabel>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={settings.customAccent}
          onChange={(e) => settings.setCustomAccent(e.target.value, settings.customAccent2)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
        />
        <input
          type="color"
          value={settings.customAccent2}
          onChange={(e) => settings.setCustomAccent(settings.customAccent, e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
        />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Primary / Secondary
        </span>
      </div>

      <SectionLabel>Sphere Word Color</SectionLabel>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={settings.sphereWordColor}
          onChange={(e) => settings.setSphereWordColor(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
        />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Base word color
        </span>
      </div>

      <SectionLabel>Sphere Spread</SectionLabel>
      <SliderRow
        value={settings.sphereSpread}
        min={SPHERE_SPREAD_MIN}
        max={SPHERE_SPREAD_MAX}
        step={0.05}
        label={`${Math.round(settings.sphereSpread * 100)}%`}
        onChange={settings.setSphereSpread}
      />

      <SectionLabel>Rotation Speed</SectionLabel>
      <SliderRow
        value={settings.sphereRotationSpeed}
        min={SPHERE_ROTATION_SPEED_MIN}
        max={SPHERE_ROTATION_SPEED_MAX}
        step={0.1}
        label={`${settings.sphereRotationSpeed.toFixed(1)}x`}
        onChange={settings.setSphereRotationSpeed}
      />

      <SectionLabel>Rotation Direction</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ROTATION_DIRECTION_LABELS) as SphereRotationDirection[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => settings.setSphereRotationDirection(key)}
            className={`glass-panel rounded-xl py-2 text-sm transition ${
              key === "cross" ? "col-span-2" : ""
            }`}
            style={{
              background: settings.sphereRotationDirection === key ? "var(--accent)" : undefined,
              color:
                settings.sphereRotationDirection === key ? "#0a0a0f" : "var(--text-primary)",
            }}
          >
            {ROTATION_DIRECTION_LABELS[key]}
          </button>
        ))}
      </div>

      <SectionLabel>Data</SectionLabel>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => exportWords(words)}
          className="glass-panel flex items-center justify-center gap-2 rounded-xl py-2 text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          <DownloadIcon className="h-4 w-4" /> Export word collection
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="glass-panel flex items-center justify-center gap-2 rounded-xl py-2 text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          <UploadIcon className="h-4 w-4" /> Import word collection
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </PanelShell>
  );
}
