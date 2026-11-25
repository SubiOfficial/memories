import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "./Modal";
import { HeartIcon } from "./icons";
import { useMusicStore } from "../store/musicStore";

const LAUGH_AUDIO_URL = "/audio/akshaya-laugh.mp3";

// Picks up every file dropped into love-stickers/ automatically, whatever its
// extension (gif, webp, png, jpg, ...) — no code change needed to add more.
const stickerModules = import.meta.glob("/love-stickers/*.*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const LOVE_STICKERS = Object.keys(stickerModules)
  .sort()
  .map((path) => stickerModules[path]);

const STICKER_INTERVAL_MS = 2800;

/** Cycles continuously through the love-menu stickers, one at a time, never
 * stopping while the card stays open — sits above the panel with a clear gap. */
function LoveStickers() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (LOVE_STICKERS.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOVE_STICKERS.length);
    }, STICKER_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (LOVE_STICKERS.length === 0) return null;

  return (
    <div className="pointer-events-none absolute -top-[7rem] left-1/2 h-24 w-24 -translate-x-1/2">
      <AnimatePresence mode="wait">
        <motion.img
          key={LOVE_STICKERS[index]}
          src={LOVE_STICKERS[index]}
          alt=""
          aria-hidden
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
        />
      </AnimatePresence>
    </div>
  );
}

/** The "All Time Love" menu — ducks the background track and plays Akshaya's
 * laugh once as soon as it's opened, restoring playback on close. */
export function AllTimeLove({ open, onClose }: { open: boolean; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const setMusicPlaying = useMusicStore((s) => s.setPlaying);
  const wasMusicPlayingRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (open) {
      wasMusicPlayingRef.current = useMusicStore.getState().playing;
      setMusicPlaying(false);
      audio.currentTime = 0;
      audio.play().catch(() => {
        /* ignored — blocked until a user gesture reaches the audio element */
      });
    } else {
      audio.pause();
      setProgress(0);
      if (wasMusicPlayingRef.current) setMusicPlaying(true);
    }
  }, [open, setMusicPlaying]);

  useEffect(() => {
    if (!open) return;
    const audio = audioRef.current;
    if (!audio) return;
    const resumeMusic = () => {
      if (wasMusicPlayingRef.current) setMusicPlaying(true);
    };
    audio.addEventListener("ended", resumeMusic);
    return () => audio.removeEventListener("ended", resumeMusic);
  }, [open, setMusicPlaying]);

  const toggleLaugh = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {
        /* ignored — blocked until a user gesture reaches the audio element */
      });
    } else {
      audio.pause();
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vibe With Akshaya"
      titleAction={<HeartIcon filled className="h-3.5 w-3.5" />}
      onTitleActionClick={toggleLaugh}
      topAccessory={<LoveStickers />}
    >
      <audio
        ref={audioRef}
        src={LAUGH_AUDIO_URL}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
      />

      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <motion.span
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          💞
        </motion.span>

        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          My all time love, always and forever.
        </p>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(progress, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          className="love-range w-full"
          style={{ accentColor: "var(--accent)" }}
          aria-label={playing ? "Playing Akshaya's laugh" : "Akshaya's laugh"}
        />
      </div>
    </Modal>
  );
}
