import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMusicStore } from "../store/musicStore";
import {
  MusicOffIcon,
  MusicOnIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from "./icons";

export function MusicMenu() {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackId = useMusicStore((s) => s.currentTrackId);
  const playing = useMusicStore((s) => s.playing);
  const togglePlaying = useMusicStore((s) => s.togglePlaying);
  const selectTrack = useMusicStore((s) => s.selectTrack);
  const addSongFromFile = useMusicStore((s) => s.addSongFromFile);
  const removeTrack = useMusicStore((s) => s.removeTrack);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("audio/")) {
        await addSongFromFile(file);
      }
    }
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        data-shatter
        aria-label="Music menu"
        title="Music"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="glass-panel flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
        style={{ color: "var(--text-primary)" }}
      >
        {playing ? <MusicOnIcon /> : <MusicOffIcon />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel-strong absolute right-0 z-50 mt-2 w-64 rounded-2xl p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                  Music
                </p>
                <motion.button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={togglePlaying}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: "var(--accent)", color: "#0a0a0f" }}
                >
                  {playing ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
                </motion.button>
              </div>

              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto pr-1">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm"
                    style={{
                      background:
                        track.id === currentTrackId ? "var(--surface-strong)" : "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => selectTrack(track.id)}
                      className="min-w-0 flex-1 truncate text-left"
                    >
                      {track.name}
                    </button>
                    {!track.isDefault && (
                      <button
                        type="button"
                        aria-label="Remove song"
                        onClick={() => removeTrack(track.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full opacity-60 hover:opacity-100"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="glass-panel mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                <PlusIcon className="h-4 w-4" />  puducha paata add panudi
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
