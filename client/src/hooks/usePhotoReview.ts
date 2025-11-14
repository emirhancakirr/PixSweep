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
  stats: ReviewStats;
  allReviewed: boolean;
  next: () => void;
  prev: () => void;
  setDecision: (index: number, decision: Decision) => void;
}

/**
 * Fotoğraf review state'ini yöneten custom hook
 * 
 * Store'dan gerekli tüm verileri çeker ve hesaplamaları yapar.
 * 
 * @returns Review state ve actions
 */
export function usePhotoReview(): UsePhotoReviewReturn {
  // Store'dan veri çek
  const photos = usePhotosStore((s) => s.photos);
  const index = usePhotosStore((s) => s.index);
  const next = usePhotosStore((s) => s.next);
  const prev = usePhotosStore((s) => s.prev);
  const setDecision = usePhotosStore((s) => s.setDecision);

  // Stats hesapla
  const decidedCount = usePhotosStore((s) => Object.keys(s.decisions).length);
  const totalCount = photos.length;

  const stats = useMemo<ReviewStats>(
    () => ({
      total: totalCount,
      decided: decidedCount,
    }),
    [totalCount, decidedCount]
  );

  // Mevcut fotoğraf
  const currentPhoto = useMemo<Photo | null>(() => {
    if (!photos || photos.length === 0) return null;
    return photos[index] || null;
  }, [photos, index]);

  // Tüm fotoğraflar review edildi mi?
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
    stats,
    allReviewed,
    next,
    prev,
    setDecision,
  };
}

