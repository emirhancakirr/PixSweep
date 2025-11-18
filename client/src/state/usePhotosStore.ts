import { create } from "zustand";
import type { Photo, Decision, Decisions, FsContext } from "../types";

type State = {
  fs?: FsContext;
  photos: Photo[];
  index: number;
  decisions: Decisions;
  tourCompleted: boolean; // İlk tur tamamlandı mı?
  readyToFinalize: boolean; // Tüm fotoğraflar review edildi, finalize ekranına geç

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
  tourCompleted: false,
  readyToFinalize: false,

  setFsAndPhotos: (fs, photos) =>
    set({ fs, photos, index: 0, decisions: {}, tourCompleted: false, readyToFinalize: false }),

  setPhotos: (photos) =>               // NEW: fallback (no rootDir)
    set({ photos, index: 0, decisions: {}, tourCompleted: false, readyToFinalize: false }),

  clear: () =>
    set({ fs: undefined, photos: [], index: 0, decisions: {}, tourCompleted: false, readyToFinalize: false }),

  setDecision: (i, d) =>
    set((s) => ({ decisions: { ...s.decisions, [i]: d } })),

  next: () => {
    const { index, photos, decisions, tourCompleted } = get();
    
    
    // 📍 DURUM 2: Son fotoğraftasın
    // Eğer ilk tur tamamlanmamışsa, turu tamamla
    if (index === photos.length - 1 && !tourCompleted) {
      set({ tourCompleted: true });
      // Son fotoğrafta kal, bir sonraki next() çağrısında undecided'lara bakılacak
      console.log("tourCompleted");
      return;
    }

        // 📍 DURUM 1: Normal fotoğraflar arasında ilerle
    if (index < photos.length && !tourCompleted) {
          set({ index: index + 1 });
          return;
        }
    
    // 📍 DURUM 3: İlk tur tamamlandı, undecided'lara bak
    if (tourCompleted) {
      const undecidedIndices = photos
        .map((_, i) => i)
        .filter(i => {
          const decision = decisions[i];
          // Karar verilmemiş (null) veya skip edilmiş olanları bul
          return !decision || (decision !== "keep" && decision !== "trash");
        });
      
      // Eğer karar verilmemiş fotoğraflar varsa, ilkine git
      if (undecidedIndices.length > 0) {
        console.log("undecidedIndices", undecidedIndices);
        set({ index: undecidedIndices[0] });
      } else {
        // Tüm fotoğraflar review edildi, finalize ekranına geç
        set({ readyToFinalize: true });
      }
    }
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