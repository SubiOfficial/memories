import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteSong, loadAllSongs, saveSong } from "../lib/songDb";
import { CURRENT_TRACK } from "../config/music";

export interface Track {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
}

const DEFAULT_TRACK: Track = {
  id: "default",
  name: "Mehabooba",
  url: `/audio/${CURRENT_TRACK}`,
  isDefault: true,
};

const objectUrls = new Map<string, string>();

interface MusicState {
  tracks: Track[];
  currentTrackId: string;
  playing: boolean;
  initialized: boolean;
  hasUnmuted: boolean;
  likedTracks: Record<string, boolean>;
  setHasUnmuted: (value: boolean) => void;
  init: () => Promise<void>;
  addSongFromFile: (file: File) => Promise<void>;
  removeTrack: (id: string) => Promise<void>;
  selectTrack: (id: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  togglePlaying: () => void;
  setPlaying: (value: boolean) => void;
  likeTrack: (id: string) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      tracks: [DEFAULT_TRACK],
      currentTrackId: "default",
      playing: true,
      initialized: false,
      hasUnmuted: false,
      likedTracks: {},
      setHasUnmuted: (value) => set({ hasUnmuted: value }),

      init: async () => {
        if (get().initialized) return;
        const stored = await loadAllSongs();
        const uploaded: Track[] = stored.map((s) => {
          const url = URL.createObjectURL(s.blob);
          objectUrls.set(s.id, url);
          return { id: s.id, name: s.name, url, isDefault: false };
        });
        set({ tracks: [DEFAULT_TRACK, ...uploaded], initialized: true });
      },

      addSongFromFile: async (file) => {
        const id = `song_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const name = file.name.replace(/\.[^./\\]+$/, "");
        await saveSong({ id, name, blob: file });
        const url = URL.createObjectURL(file);
        objectUrls.set(id, url);
        set((s) => ({
          tracks: [...s.tracks, { id, name, url, isDefault: false }],
          currentTrackId: id,
          playing: true,
        }));
      },

      removeTrack: async (id) => {
        const track = get().tracks.find((t) => t.id === id);
        if (!track || track.isDefault) return;
        await deleteSong(id);
        const existingUrl = objectUrls.get(id);
        if (existingUrl) {
          URL.revokeObjectURL(existingUrl);
          objectUrls.delete(id);
        }
        set((s) => ({
          tracks: s.tracks.filter((t) => t.id !== id),
          currentTrackId: s.currentTrackId === id ? "default" : s.currentTrackId,
        }));
      },

      selectTrack: (id) => set({ currentTrackId: id, playing: true }),
      nextTrack: () =>
        set((s) => {
          const idx = s.tracks.findIndex((t) => t.id === s.currentTrackId);
          const next = s.tracks[(idx + 1) % s.tracks.length];
          return next ? { currentTrackId: next.id, playing: true } : {};
        }),
      prevTrack: () =>
        set((s) => {
          const idx = s.tracks.findIndex((t) => t.id === s.currentTrackId);
          const prev = s.tracks[(idx - 1 + s.tracks.length) % s.tracks.length];
          return prev ? { currentTrackId: prev.id, playing: true } : {};
        }),
      togglePlaying: () => set((s) => ({ playing: !s.playing })),
      setPlaying: (value) => set({ playing: value }),
      // Liking is one-way and permanent — once a song is liked it stays liked forever.
      likeTrack: (id) => set((s) => ({ likedTracks: { ...s.likedTracks, [id]: true } })),
    }),
    {
      name: "text-sphere-music",
      partialize: (s) => ({
        currentTrackId: s.currentTrackId,
        likedTracks: s.likedTracks,
      }),
    },
  ),
);
