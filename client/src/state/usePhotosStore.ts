import { create } from "zustand";

/** Tek foto kaydı */
export type Photo = {
  id: string;
  name: string;
  relPath: string;       // "2024/08/IMG_123.jpg" gibi
  sizeBytes: number;
  previewUrl: string;    // URL.createObjectURL(file)
};

export type Decision = "keep" | "trash" | "archive" | null;

type FsContext = {
  rootDir: FileSystemDirectoryHandle; // silme için lazım
};

type State = {
  fs?: FsContext;
  photos: Photo[];
  index: number;
  decisions: Record<number, Decision>;

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
    const { index, photos } = get();
    if (index < photos.length - 1) set({ index: index + 1 });
  },

  prev: () => {
    const { index } = get();
    if (index > 0) set({ index: index - 1 });
  },
}));

/** Selector’lar */
export const selectors = {
  currentPhoto: (s: State) => s.photos[s.index],
  currentDecision: (s: State) => s.decisions[s.index] ?? null,
  stats: (s: State) => {
    const total = s.photos.length;
    const decided = Object.keys(s.decisions).length;
    const trashCount = Object.values(s.decisions).filter((d) => d === "trash").length;
    const trashBytes = Object.entries(s.decisions)
      .filter(([, d]) => d === "trash")
      .map(([i]) => s.photos[Number(i)]?.sizeBytes ?? 0)
      .reduce((a, b) => a + b, 0);
    return { total, decided, trashCount, trashBytes };
  },
};