import { create } from "zustand";
import type { Photo, Decision, Decisions, FsContext } from "../types";

type State = {
  fs?: FsContext;
  photos: Photo[];
  index: number;
  decisions: Decisions;

  setFsAndPhotos: (fs: FsContext, photos: Photo[]) => void;
  setPhotos: (photos: Photo[]) => void; // Safari fallback (no fs)
  clear: () => void;

  setDecision: (i: number, d: Decision) => void;
  next: () => void;
  prev: () => void;
};

export const usePhotosStore = create<State>((set, get) => ({
  fs: undefined,
  photos: [],
  index: 0,
  decisions: {},

  setFsAndPhotos: (fs, photos) =>
    set({ fs, photos, index: 0, decisions: {} }),

  setPhotos: (photos) =>               // NEW: fallback (no rootDir)
    set({ photos, index: 0, decisions: {} }),

  clear: () =>
    set({ fs: undefined, photos: [], index: 0, decisions: {} }),

  setDecision: (i, d) =>
    set((s) => ({ decisions: { ...s.decisions, [i]: d } })),

  next: () => {
    const { index, photos, decisions } = get();
    
    // Eğer son fotoğrafta değilsen, normal olarak sonrakine geç
    if (index < photos.length - 1) {
      set({ index: index + 1 });
      return;
    }
    
    // Son fotoğraftaysan, karar verilmemiş fotoğrafları bul
    const undecidedIndices = photos
      .map((_, i) => i)
      .filter(i => {
        const decision = decisions[i];
        // Karar verilmemiş veya null olanları bul
        return !decision || (decision !== "keep" && decision !== "trash");
      });
    
    // Eğer karar verilmemiş fotoğraflar varsa, ilkine git
    if (undecidedIndices.length > 0) {
      set({ index: undecidedIndices[0] });
    }
    // Değilse, son fotoğrafta kal (tüm fotoğraflara karar verilmiş)
  },

  prev: () => {
    const { index } = get();
    if (index > 0) set({ index: index - 1 });
  },
}));

/**
 * Selector'lar
 * 
 * Not: Stats hesaplaması artık reviewService'te.
 * Buradaki selectors minimal tutulmalı.
 */
export const selectors = {
  currentPhoto: (s: State) => s.photos[s.index],
  currentDecision: (s: State) => s.decisions[s.index] ?? null,
};