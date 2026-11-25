import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WordItem } from "../types";
import { SEED_WORDS } from "../data/seedWords";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const seedItems = (): WordItem[] =>
  SEED_WORDS.map((text) => ({ id: makeId(), text }));

interface WordsState {
  words: WordItem[];
  addWord: (text: string) => void;
  updateWord: (id: string, text: string) => void;
  setWords: (words: WordItem[]) => void;
  resetToSeed: () => void;
}

export const useWordsStore = create<WordsState>()(
  persist(
    (set) => ({
      words: seedItems(),
      addWord: (text) =>
        set((s) => ({
          words: [...s.words, { id: makeId(), text: text.trim() }].filter(
            (w) => w.text.length > 0,
          ),
        })),
      updateWord: (id, text) =>
        set((s) => ({
          words: s.words.map((w) => (w.id === id ? { ...w, text } : w)),
        })),
      setWords: (words) => set({ words }),
      resetToSeed: () => set({ words: seedItems() }),
    }),
    { name: "text-sphere-words" },
  ),
);
