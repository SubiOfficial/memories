import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { CloseIcon, HeartIcon } from "./icons";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
  /** Small animated button shown beside the title (defaults to a pulsing heart). */
  titleAction?: ReactNode;
  onTitleActionClick?: () => void;
  /** Optional content docked above the panel, e.g. a sticker — never overlaps the panel itself. */
  topAccessory?: ReactNode;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  widthClassName = "max-w-sm",
  titleAction,
  onTitleActionClick,
  topAccessory,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`glass-panel-strong fixed left-1/2 top-1/2 z-[61] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-5 ${widthClassName}`}
          >
            {topAccessory}

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h2>
                <motion.button
                  type="button"
                  aria-label={`${title} accent`}
                  onClick={onTitleActionClick}
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  whileTap={{ scale: 0.85 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ color: "var(--accent)" }}
                >
                  {titleAction ?? <HeartIcon filled className="h-3.5 w-3.5" />}
                </motion.button>
              </div>
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
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
