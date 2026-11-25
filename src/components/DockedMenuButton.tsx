import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface DockedMenuButtonProps {
  emoji: ReactNode;
  label: string;
  /** Vertical offset in px from the viewport's true center. */
  offset: number;
  delay: number;
  onClick: () => void;
}

/** A left-docked circular menu button with its title revealed to the right on hover. */
export function DockedMenuButton({ emoji, label, offset, delay, onClick }: DockedMenuButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
        x: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.4 },
      }}
      className="group fixed left-3 z-20 sm:left-5"
      style={{ top: `calc(50% + ${offset}px)` }}
    >
      <motion.button
        type="button"
        data-shatter
        aria-label={label}
        title={label}
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="song-card flex h-12 w-12 items-center justify-center rounded-full text-xl sm:h-14 sm:w-14 sm:text-2xl"
      >
        {emoji}
      </motion.button>

      <span
        aria-hidden
        className="glass-panel pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 -translate-x-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 sm:text-sm"
        style={{ color: "var(--text-primary)" }}
      >
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "inline-block" }}
        >
          {label}
        </motion.span>
      </span>
    </motion.div>
  );
}
