import { motion } from "framer-motion";
import { ListIcon, MoonIcon, SearchIcon, SettingsIcon, SunIcon } from "./icons";
import { MusicMenu } from "./MusicMenu";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenWords: () => void;
  onOpenSettings: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      data-shatter
      aria-label={label}
      title={label}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="glass-panel flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </motion.button>
  );
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  onOpenWords,
  onOpenSettings,
  theme,
  onToggleTheme,
}: ToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-3 top-[max(0.9rem,env(safe-area-inset-top))] z-30 flex flex-wrap items-center justify-end gap-2 sm:right-5 sm:top-5"
    >
      <div data-shatter className="glass-panel flex h-9 items-center gap-2 rounded-full px-3 sm:h-10">
        <SearchIcon className="h-4 w-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search words"
          className="w-24 bg-transparent text-sm outline-none placeholder:opacity-60 sm:w-40"
          style={{ color: "var(--text-primary)" }}
        />
      </div>
      <IconButton onClick={onOpenWords} label="Manage words">
        <ListIcon />
      </IconButton>
      <IconButton onClick={onOpenSettings} label="Settings">
        <SettingsIcon />
      </IconButton>
      <IconButton onClick={onToggleTheme} label="Toggle theme">
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </IconButton>
      <MusicMenu />
    </motion.div>
  );
}
