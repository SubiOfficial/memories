import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Target, TargetAndTransition, Transition } from "framer-motion";
import { CloseIcon, GridIcon, PauseIcon, PlayIcon } from "./icons";
import { GalaxyBackdrop } from "./GalaxyBackdrop";
import { TheatreAudience } from "./TheatreAudience";

const imageModules = import.meta.glob("/new/*.png", { eager: true, import: "default" }) as Record<
  string,
  string
>;

const IMAGES = Object.entries(imageModules)
  .sort(([a], [b]) => {
    const na = Number(a.match(/(\d+)\.png$/)?.[1] ?? 0);
    const nb = Number(b.match(/(\d+)\.png$/)?.[1] ?? 0);
    return na - nb;
  })
  .map(([, url]) => url);

const SLIDE_MS = 2000;
const PRELOAD_AHEAD = 3;

const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
const EASE_PUSH = [0.65, 0, 0.35, 1] as const;

type SlideVariant = {
  initial: Target;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
};

// Twelve distinct entrance/exit shapes, cycled by slide index so consecutive
// images never repeat the same effect back to back.
const TRANSITIONS: SlideVariant[] = [
  // 1. Wipe top -> bottom
  {
    initial: { clipPath: "inset(0% 0% 100% 0%)" },
    animate: { clipPath: "inset(0% 0% 0% 0%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.9, ease: EASE_SMOOTH },
  },
  // 2. Wipe bottom -> top
  {
    initial: { clipPath: "inset(100% 0% 0% 0%)" },
    animate: { clipPath: "inset(0% 0% 0% 0%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.9, ease: EASE_SMOOTH },
  },
  // 3. Wipe left -> right
  {
    initial: { clipPath: "inset(0% 100% 0% 0%)" },
    animate: { clipPath: "inset(0% 0% 0% 0%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.9, ease: EASE_SMOOTH },
  },
  // 4. Wipe right -> left
  {
    initial: { clipPath: "inset(0% 0% 0% 100%)" },
    animate: { clipPath: "inset(0% 0% 0% 0%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.9, ease: EASE_SMOOTH },
  },
  // 5. Ripple wave from top-left corner to bottom-right
  {
    initial: { clipPath: "circle(0% at 0% 0%)" },
    animate: { clipPath: "circle(141% at 0% 0%)" },
    exit: { opacity: 1 },
    transition: { duration: 1.1, ease: EASE_SMOOTH },
  },
  // 6. Ripple wave from bottom-right corner to top-left
  {
    initial: { clipPath: "circle(0% at 100% 100%)" },
    animate: { clipPath: "circle(141% at 100% 100%)" },
    exit: { opacity: 1 },
    transition: { duration: 1.1, ease: EASE_SMOOTH },
  },
  // 7. Diagonal reveal growing from top-left corner
  {
    initial: { clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)" },
    animate: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.95, ease: EASE_SMOOTH },
  },
  // 8. Diagonal reveal growing from bottom-right corner
  {
    initial: { clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)" },
    animate: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.95, ease: EASE_SMOOTH },
  },
  // 9. Iris opening from the center
  {
    initial: { clipPath: "circle(0% at 50% 50%)" },
    animate: { clipPath: "circle(100% at 50% 50%)" },
    exit: { opacity: 1 },
    transition: { duration: 0.9, ease: EASE_SMOOTH },
  },
  // 10. Zoom + spin crossfade
  {
    initial: { opacity: 0, scale: 1.25, rotate: 6 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.95, rotate: -4 },
    transition: { duration: 0.8, ease: EASE_SMOOTH },
  },
  // 11. Horizontal push slide
  {
    initial: { x: "100%" },
    animate: { x: "0%" },
    exit: { x: "-100%" },
    transition: { duration: 0.65, ease: EASE_PUSH },
  },
  // 12. Vertical push slide
  {
    initial: { y: "100%" },
    animate: { y: "0%" },
    exit: { y: "-100%" },
    transition: { duration: 0.65, ease: EASE_PUSH },
  },
];

export function AdventuresPage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (open) {
      setIndex(0);
      setPlaying(true);
      setShowGallery(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !playing || IMAGES.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [open, playing]);

  useEffect(() => {
    if (!open) return;
    for (let offset = 1; offset <= PRELOAD_AHEAD; offset++) {
      const src = IMAGES[(index + offset) % IMAGES.length];
      if (src) new Image().src = src;
    }
  }, [open, index]);

  const togglePlaying = useCallback(() => setPlaying((p) => !p), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (showGallery) {
        if (e.code === "Escape") setShowGallery(false);
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        togglePlaying();
      } else if (e.code === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, showGallery, togglePlaying, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="adventures-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black"
        >
          <GalaxyBackdrop />

          <div className="relative flex h-full w-full items-center justify-center" style={{ padding: 20 }}>
            <motion.div
              className="relative rounded-[22px] p-[3px] w-[88vw] h-[46vh] sm:w-[82vw] sm:h-[54vh] md:w-[76vw] md:h-[60vh] lg:w-[68vw] lg:h-[64vh] xl:w-[62vw] xl:h-[66vh]"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.65), 0 0 90px -10px var(--accent-2)",
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[19px] bg-black">
                <AnimatePresence initial={false}>
                  {IMAGES.length > 0 &&
                    (() => {
                      const variant = TRANSITIONS[index % TRANSITIONS.length];
                      return (
                        <motion.img
                          key={index}
                          src={IMAGES[index]}
                          alt={`Adventure ${index + 1}`}
                          draggable={false}
                          initial={variant.initial}
                          animate={variant.animate}
                          exit={variant.exit}
                          transition={variant.transition}
                          className="absolute inset-0"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      );
                    })()}
                </AnimatePresence>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: "inset 0 0 70px rgba(0,0,0,0.45)" }}
                  aria-hidden
                />
              </div>
            </motion.div>

            <TheatreAudience />

            <div className="fixed right-5 top-[max(1.1rem,env(safe-area-inset-top))] z-10 flex gap-2 sm:right-6">
              <motion.button
                type="button"
                aria-label="Show all photos"
                title="Show all photos"
                onClick={() => setShowGallery(true)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="glass-panel flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-[color:var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                <GridIcon />
              </motion.button>
              <motion.button
                type="button"
                aria-label={playing ? "Pause" : "Play"}
                title={playing ? "Pause" : "Play"}
                onClick={togglePlaying}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="glass-panel flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-[color:var(--accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </motion.button>
              <motion.button
                type="button"
                aria-label="Close"
                title="Close"
                onClick={onClose}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="glass-panel flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-[#ff5c68]"
                style={{ color: "var(--text-primary)" }}
              >
                <CloseIcon />
              </motion.button>
            </div>

            {IMAGES.length > 0 && (
              <div
                className="glass-panel fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide"
                style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                {index + 1} / {IMAGES.length}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showGallery && (
              <motion.div
                key="adventures-gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setShowGallery(false)}
                className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md"
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-panel-strong relative flex max-h-[85vh] w-[92vw] max-w-4xl flex-col gap-4 overflow-hidden rounded-3xl p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-secondary)" }}>
                      All Photos ({IMAGES.length})
                    </p>
                    <button
                      type="button"
                      aria-label="Close gallery"
                      onClick={() => setShowGallery(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                    {IMAGES.map((src, i) => (
                      <motion.button
                        key={src}
                        type="button"
                        aria-label={`Jump to photo ${i + 1}`}
                        onClick={() => {
                          setIndex(i);
                          setPlaying(true);
                          setShowGallery(false);
                        }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative h-[150px] w-[150px] shrink-0 overflow-hidden rounded-xl"
                        style={{
                          outline: i === index ? "2px solid var(--accent)" : "1px solid var(--border)",
                          outlineOffset: 2,
                        }}
                      >
                        <img
                          src={src}
                          alt={`Adventure ${i + 1}`}
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
