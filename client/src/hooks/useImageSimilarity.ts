import { useState, useCallback } from "react";
import type { Photo } from "../types";
import {
  clusterSimilarPhotos,
  findSimilarPhotos,
  arePhotosSimilar,
  computePhotoHash,
  type SimilarityCluster,
  type SimilarityConfig,
  type PhotoWithHash,
} from "../services/imageSimilarity";

/**
 * Hook for image similarity detection
 * 
 * Provides convenient methods for detecting similar photos in the browser.
 */
export function useImageSimilarity(config: SimilarityConfig = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  /**
   * Cluster photos into similarity groups
   */
  const clusterPhotos = useCallback(
    async (photos: Photo[]): Promise<SimilarityCluster[]> => {
      setIsProcessing(true);
      setProgress({ current: 0, total: photos.length });

      try {
        const clusters = await clusterSimilarPhotos(
          photos,
          config,
          (current, total) => {
            setProgress({ current, total });
          }
        );

        return clusters;
      } finally {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0 });
      }
    },
    [config]
  );

  /**
   * Find photos similar to a target photo
   */
  const findSimilar = useCallback(
    async (
      targetPhoto: PhotoWithHash,
      candidatePhotos: PhotoWithHash[]
    ): Promise<Photo[]> => {
      setIsProcessing(true);
      try {
        return await findSimilarPhotos(targetPhoto, candidatePhotos, config);
      } finally {
        setIsProcessing(false);
      }
    },
    [config]
  );

  /**
   * Check if two photos are similar
   */
  const checkSimilarity = useCallback(
    async (photo1: Photo, photo2: Photo): Promise<boolean> => {
      setIsProcessing(true);
      try {
        return await arePhotosSimilar(photo1, photo2, config);
      } finally {
        setIsProcessing(false);
      }
    },
    [config]
  );

  /**
   * Compute hash for a single photo
   */
  const computeHash = useCallback(
    async (photo: Photo) => {
      setIsProcessing(true);
      try {
        return await computePhotoHash(photo, config);
      } finally {
        setIsProcessing(false);
      }
    },
    [config]
  );

  return {
    clusterPhotos,
    findSimilar,
    checkSimilarity,
    computeHash,
    isProcessing,
    progress,
  };
}

