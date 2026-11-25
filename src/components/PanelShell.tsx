import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { CloseIcon } from "./icons";

interface PanelShellProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function PanelShell({ open, title, onClose, children }: PanelShellProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="glass-panel-strong fixed inset-y-0 right-0 z-50 flex w-full flex-col p-5 sm:inset-y-3 sm:right-3 sm:w-[380px] sm:rounded-3xl lg:w-[420px]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {title}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
                style={{ color: "var(--text-primary)" }}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
