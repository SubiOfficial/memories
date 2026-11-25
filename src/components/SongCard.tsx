import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useMusicStore } from "../store/musicStore";
import { HeartIcon, PauseIcon, SkipNextIcon, SkipPrevIcon } from "./icons";
import { DanceSticker } from "./DanceSticker";
import { LoveNote } from "./LoveNote";

const SONG_CARD_POS_KEY = "song-card-position";

interface CardPosition {
  x: number;
  y: number;
}

function loadSongCardPosition(): CardPosition | null {
  try {
    const raw = localStorage.getItem(SONG_CARD_POS_KEY);
    return raw ? (JSON.parse(raw) as CardPosition) : null;
  } catch {
    return null;
  }
}

const ghostButton =
  "flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--text-primary)] transition-colors duration-200";

/**
 * Floating "now playing" card docked at the right-center of the screen, plus the
 * full-screen heart popup that fires when the fav button is tapped. Only shown
 * while a track is actually playing — fades in/out in sync with playback.
 */
export function SongCard() {
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const playing = useMusicStore((s) => s.playing);
  const hasUnmuted = useMusicStore((s) => s.hasUnmuted);
  const togglePlaying = useMusicStore((s) => s.togglePlaying);
  const nextTrack = useMusicStore((s) => s.nextTrack);
  const prevTrack = useMusicStore((s) => s.prevTrack);
  const likedTracks = useMusicStore((s) => s.likedTracks);
  const likeTrack = useMusicStore((s) => s.likeTrack);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) ?? tracks[0];
  const isLikedForever = !!(currentTrack && likedTracks[currentTrack.id]);

  const [showLove, setShowLove] = useState(false);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cardPos, setCardPos] = useState<CardPosition | null>(loadSongCardPosition);
  const cardRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const handleDragEnd = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = { x: rect.left, y: rect.top };
    setCardPos(next);
    localStorage.setItem(SONG_CARD_POS_KEY, JSON.stringify(next));
    dragX.set(0);
    dragY.set(0);
  };

  // A position saved on one screen size (e.g. desktop) can land off-screen or
  // overlapping nothing reachable on another (phone, rotated tablet, resized
  // window) — keep it clamped inside the viewport whenever it changes.
  useEffect(() => {
    if (!cardPos) return;
    const clamp = () => {
      const rect = cardRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 224;
      const height = rect?.height ?? 200;
      const maxX = Math.max(8, window.innerWidth - width - 8);
      const maxY = Math.max(8, window.innerHeight - height - 8);
      setCardPos((prev) => {
        if (!prev) return prev;
        const x = Math.min(Math.max(prev.x, 8), maxX);
        const y = Math.min(Math.max(prev.y, 8), maxY);
        if (x === prev.x && y === prev.y) return prev;
        const clamped = { x, y };
        localStorage.setItem(SONG_CARD_POS_KEY, JSON.stringify(clamped));
        return clamped;
      });
    };
    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardPos !== null]);

  useEffect(() => {
    if (!showLove) return;
    autoCloseRef.current = setTimeout(() => setShowLove(false), 3200);
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [showLove]);

  const cancelAutoClose = () => {
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  };

  const visible = playing && hasUnmuted && !!currentTrack;

  return (
    <>
      <div ref={boundsRef} className="pointer-events-none fixed inset-2 z-0" aria-hidden />

      <AnimatePresence>
        {visible && (
          <motion.div
            key="song-card"
            ref={cardRef}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={boundsRef}
            onDragEnd={handleDragEnd}
            style={{ x: dragX, y: dragY, ...(cardPos ? { left: cardPos.x, top: cardPos.y } : {}) }}
            initial={{ opacity: 0, scale: 0.94, ...(cardPos ? {} : { x: 32 }) }}
            animate={
              cardPos
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, x: 0, scale: 1, y: [0, -10, 0] }
            }
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{
              opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              x: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
            className={`song-card fixed z-20 w-[13.5rem] cursor-grab rounded-3xl p-4 active:cursor-grabbing sm:w-64 ${
              cardPos ? "" : "right-3 top-1/2 -translate-y-1/2 sm:right-5"
            }`}
          >
            <DanceSticker />

            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Now Playing
            </p>

            <div className="mt-2 flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                />
              </motion.div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {currentTrack?.name}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                  For Kuttachi
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <motion.button
                type="button"
                data-shatter
                aria-label="Previous song"
                onClick={prevTrack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={ghostButton}
              >
                <SkipPrevIcon className="h-4 w-4" />
              </motion.button>

              <motion.button
                type="button"
                data-shatter
                aria-label="Pause"
                onClick={togglePlaying}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "var(--accent)", color: "#0a0a0f" }}
              >
                <PauseIcon className="h-4 w-4" />
              </motion.button>

              <motion.button
                type="button"
                data-shatter
                aria-label="Next song"
                onClick={nextTrack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={ghostButton}
              >
                <SkipNextIcon className="h-4 w-4" />
              </motion.button>

              <motion.button
                type="button"
                data-shatter
                aria-label="Favorite this song"
                onClick={() => {
                  if (currentTrack) likeTrack(currentTrack.id);
                  setShowLove(true);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
                className={`${ghostButton} hover:text-[#ff5c68]`}
                style={isLikedForever ? { color: "#ff5c68" } : undefined}
              >
                <HeartIcon className="h-4 w-4" filled={isLikedForever} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLove && (
          <motion.div
            key="love-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowLove(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <LoveNote onHeartTap={cancelAutoClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
