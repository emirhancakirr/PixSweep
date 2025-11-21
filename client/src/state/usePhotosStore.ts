/**
 * Global Photos Store
 * 
 * Central state management for photo review application using Zustand.
 * Manages photos, user decisions, navigation state, and duplicate detection results.
 * 
 * State Structure:
 * - fs: File system context (if using File System Access API)
 * - photos: Array of all loaded photos
 * - index: Current photo index
 * - decisions: Map of photo index to decision (keep/trash/null)
 * - tourCompleted: Whether first review tour is complete
 * - readyToFinalize: Whether all photos are reviewed and ready for deletion
 * - duplicateMap: Map of photo IDs to their duplicate photo IDs
 * 
 * Design Principles:
 * - Single source of truth for application state
 * - Selector-based subscriptions for efficient re-renders
 * - Business logic delegated to services (NavigationService)
 * - Immutable state updates
 */

import { create } from "zustand";
import type { Photo, Decision, Decisions, FsContext } from "../types";
import { NavigationService } from "../services/review/navigationService";

type State = {
  fs?: FsContext;
  photos: Photo[];
  index: number;
  decisions: Decisions;
  tourCompleted: boolean; // First tour completed?
  readyToFinalize: boolean; // All photos reviewed, ready to finalize
  duplicateMap: Record<string, string[]>; // Map of photo ID to array of duplicate photo IDs

  setFsAndPhotos: (fs: FsContext, photos: Photo[]) => void;
  setPhotos: (photos: Photo[]) => void; // Safari fallback (no fs)
  clear: () => void;

  setDecision: (i: number, d: Decision) => void;
  setDuplicateMap: (map: Record<string, string[]>) => void;
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
  duplicateMap: {},

  setFsAndPhotos: (fs, photos) =>
    set((s) => ({ 
      fs, 
      photos, 
      index: 0, 
      decisions: {}, 
      tourCompleted: false, 
      readyToFinalize: false, 
      // duplicateMap'i koru - eğer önceden set edildiyse kaybolmasın
      duplicateMap: s.duplicateMap 
    })),

  setPhotos: (photos) =>
    set((s) => ({ 
      photos, 
      index: 0, 
      decisions: {}, 
      tourCompleted: false, 
      readyToFinalize: false, 
      // duplicateMap'i koru - eğer önceden set edildiyse kaybolmasın
      duplicateMap: s.duplicateMap 
    })),

  clear: () =>
    set({ fs: undefined, photos: [], index: 0, decisions: {}, tourCompleted: false, readyToFinalize: false, duplicateMap: {} }),

  setDecision: (i, d) =>
    set((s) => ({ decisions: { ...s.decisions, [i]: d } })),

  setDuplicateMap: (map) =>
    set({ duplicateMap: map }),

  next: () => {
    const state = get();
    const result = NavigationService.calculateNext({
      index: state.index,
      photos: state.photos,
      decisions: state.decisions,
      tourCompleted: state.tourCompleted,
    });

    if (result.newIndex !== undefined) {
      set({ index: result.newIndex });
    }
    if (result.tourCompleted !== undefined) {
      set({ tourCompleted: result.tourCompleted });
    }
    if (result.readyToFinalize !== undefined) {
      set({ readyToFinalize: result.readyToFinalize });
    }
  },

  prev: () => {
    const { index } = get();
    const newIndex = NavigationService.calculatePrev(index);
    if (newIndex !== null) {
      set({ index: newIndex });
    }
  },
}));

/**
 * Store selectors
 * 
 * Note: Stats calculation is now in reviewService.
 * Keep selectors here minimal.
 */
export const selectors = {
  currentPhoto: (s: State) => s.photos[s.index],
  currentDecision: (s: State) => s.decisions[s.index] ?? null,
};