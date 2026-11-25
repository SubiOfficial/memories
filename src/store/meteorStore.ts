import { create } from "zustand";

interface MeteorStore {
  /** True while the word-sphere should be blown apart; false while it's at rest or reassembling. */
  struck: boolean;
  /** Bumped on every strike so each WordNode can roll a fresh random explosion vector. */
  strikeSeed: number;
  strike: () => void;
  restore: () => void;
}

export const useMeteorStore = create<MeteorStore>((set) => ({
  struck: false,
  strikeSeed: 0,
  strike: () => set((s) => ({ struck: true, strikeSeed: s.strikeSeed + 1 })),
  restore: () => set({ struck: false }),
}));
