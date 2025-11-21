import { useMemo } from "react";
import { usePhotosStore } from "../state/usePhotosStore";
import type { Photo, Decision } from "../types";

interface ReviewStats {
  total: number;
  decided: number;
}

interface UsePhotoReviewReturn {
  photos: Photo[];
  index: number;
  currentPhoto: Photo | null;
  currentDecision: Decision;
  stats: ReviewStats;
  allReviewed: boolean;
  hasDuplicates: boolean; // Whether current photo has duplicates
  next: () => void;
  prev: () => void;
  setDecision: (index: number, decision: Decision) => void;
}

/**
 * Custom hook for managing photo review state
 * 
 * Fetches all necessary data from store and performs calculations.
 * 
 * @returns Review state and actions
 */
export function usePhotoReview(): UsePhotoReviewReturn {
  // Fetch data from store
  const photos = usePhotosStore((s) => s.photos);
  const index = usePhotosStore((s) => s.index);
  const next = usePhotosStore((s) => s.next);
  const prev = usePhotosStore((s) => s.prev);
  const setDecision = usePhotosStore((s) => s.setDecision);

  // Calculate stats
  const decidedCount = usePhotosStore((s) => Object.values(s.decisions).filter(decision => decision !== null).length);
  const totalCount = photos.length;

  const stats = useMemo<ReviewStats>(
    () => ({
      total: totalCount,
      decided: decidedCount,
    }),
    [totalCount, decidedCount]
  );

  // Current photo
  const currentPhoto = useMemo<Photo | null>(() => {
    if (!photos || photos.length === 0) return null;
    return photos[index] || null;
  }, [photos, index]);

  // Current photo's decision
  const currentDecision = usePhotosStore((s) => s.decisions[index] || null);

  // Check if current photo has duplicates
  // duplicateMap'i store'dan subscribe ediyoruz ki değiştiğinde yeniden hesaplansın
  const duplicateMap = usePhotosStore((s) => s.duplicateMap);
  const hasDuplicates = useMemo<boolean>(() => {
    if (!currentPhoto) return false;
    // duplicateMap[currentPhoto.id] varsa ve içinde duplicate ID'ler varsa true döner
    // Örnek: duplicateMap = { "photo1": ["photo2", "photo3"] }
    // currentPhoto.id = "photo1" ise -> ["photo2", "photo3"].length > 0 -> true
    const duplicateIds = duplicateMap[currentPhoto.id];
    const hasDups = duplicateIds?.length > 0 || false;
    
    
    return hasDups;
  }, [currentPhoto, duplicateMap]);

  // Check if all photos have been reviewed
  const allReviewed = useMemo<boolean>(() => {
    if (photos.length === 0) return false;
    const decisions = usePhotosStore.getState().decisions;
    return photos.every((_, i) => {
      const decision = decisions[i];
      return decision === "keep" || decision === "trash";
    });
  }, [photos, stats.decided]);

  return {
    photos,
    index,
    currentPhoto,
    currentDecision,
    stats,
    allReviewed,
    hasDuplicates,
    next,
    prev,
    setDecision,
  };
}

