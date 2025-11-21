import type { Photo } from "../../types";
import { computeDHash, hammingDistance, type HashResult } from "./perceptualHash";

/**
 * Similarity Service
 * 
 * High-level service for detecting and clustering similar photos.
 */

export interface SimilarityConfig {
  threshold?: number; // Hamming distance threshold (default: 10)
  hashWidth?: number; // Hash width (default: 9)
  hashHeight?: number; // Hash height (default: 8)
}

export interface PhotoWithHash extends Photo {
  hash?: HashResult;
}

export interface SimilarityCluster {
  id: string;
  photos: Photo[];
  representative: Photo; // First photo in cluster
}

const DEFAULT_CONFIG: Required<SimilarityConfig> = {
  threshold: 10,
  hashWidth: 9,
  hashHeight: 8,
};

/**
 * Compute hash for a single photo
 */
export async function computePhotoHash(
  photo: Photo,
  config: SimilarityConfig = {}
): Promise<HashResult> {
  const { hashWidth, hashHeight } = { ...DEFAULT_CONFIG, ...config };
  
  // Use preview URL if available, otherwise use file
  const source = photo.previewUrl || photo.file;
  
  return computeDHash(source, {
    width: hashWidth,
    height: hashHeight,
  });
}

/**
 * Compute hashes for multiple photos
 * 
 * @param photos - Photos to hash
 * @param config - Similarity configuration
 * @param onProgress - Optional progress callback
 * @returns Photos with computed hashes
 */
export async function computePhotoHashes(
  photos: Photo[],
  config: SimilarityConfig = {},
  onProgress?: (current: number, total: number) => void
): Promise<PhotoWithHash[]> {
  const results: PhotoWithHash[] = [];
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    
    try {
      const hash = await computePhotoHash(photo, config);
      results.push({ ...photo, hash });
    } catch (error) {
      console.warn(`Failed to compute hash for ${photo.name}:`, error);
      // Include photo without hash
      results.push({ ...photo });
    }
    
    onProgress?.(i + 1, photos.length);
  }
  
  return results;
}

/**
 * Find similar photos for a given photo
 * 
 * @param targetPhoto - Photo to find similarities for
 * @param candidatePhotos - Photos to compare against
 * @param config - Similarity configuration
 * @returns Array of similar photos
 */
export async function findSimilarPhotos(
  targetPhoto: PhotoWithHash,
  candidatePhotos: PhotoWithHash[],
  config: SimilarityConfig = {}
): Promise<Photo[]> {
  const { threshold } = { ...DEFAULT_CONFIG, ...config };
  
  // Ensure target photo has a hash
  if (!targetPhoto.hash) {
    targetPhoto.hash = await computePhotoHash(targetPhoto, config);
  }
  
  const similar: Photo[] = [];
  
  for (const candidate of candidatePhotos) {
    if (candidate.id === targetPhoto.id) continue;
    
    // Ensure candidate has a hash
    let hash = candidate.hash;
    if (!hash) {
      try {
        hash = await computePhotoHash(candidate, config);
        candidate.hash = hash;
      } catch (error) {
        console.warn(`Failed to compute hash for ${candidate.name}:`, error);
        continue;
      }
    }
    
    // Check similarity
    const distance = hammingDistance(targetPhoto.hash.hash, hash.hash);
    if (distance <= threshold) {
      similar.push(candidate);
    }
  }
  
  return similar;
}

/**
 * Cluster photos into similarity groups
 * 
 * Uses a simple greedy clustering algorithm:
 * 1. For each photo, find all similar photos
 * 2. Group them together
 * 3. Remove duplicates
 * 
 * @param photos - Photos to cluster
 * @param config - Similarity configuration
 * @param onProgress - Optional progress callback
 * @returns Array of similarity clusters
 */
export async function clusterSimilarPhotos(
  photos: Photo[],
  config: SimilarityConfig = {},
  onProgress?: (current: number, total: number) => void
): Promise<SimilarityCluster[]> {
  const { threshold } = { ...DEFAULT_CONFIG, ...config };
  
  // Compute hashes for all photos
  const photosWithHashes = await computePhotoHashes(photos, config, onProgress);
  
  const clusters: SimilarityCluster[] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < photosWithHashes.length; i++) {
    const photo = photosWithHashes[i];
    
    if (processed.has(photo.id)) continue;
    
    // Find all similar photos
    const similar: Photo[] = [photo];
    
    for (let j = i + 1; j < photosWithHashes.length; j++) {
      const candidate = photosWithHashes[j];
      
      if (processed.has(candidate.id)) continue;
      if (!photo.hash || !candidate.hash) continue;
      
      const distance = hammingDistance(photo.hash.hash, candidate.hash.hash);
      if (distance <= threshold) {
        similar.push(candidate);
        processed.add(candidate.id);
      }
    }
    
    // Only create cluster if there are similar photos (more than 1)
    if (similar.length > 1) {
      clusters.push({
        id: `cluster-${photo.id}`,
        photos: similar,
        representative: photo,
      });
      processed.add(photo.id);
    }
  }
  
  return clusters;
}

/**
 * Check if two photos are similar
 * 
 * @param photo1 - First photo
 * @param photo2 - Second photo
 * @param config - Similarity configuration
 * @returns true if photos are similar
 */
export async function arePhotosSimilar(
  photo1: Photo,
  photo2: Photo,
  config: SimilarityConfig = {}
): Promise<boolean> {
  const { threshold } = { ...DEFAULT_CONFIG, ...config };
  
  const [hash1, hash2] = await Promise.all([
    computePhotoHash(photo1, config),
    computePhotoHash(photo2, config),
  ]);
  
  const distance = hammingDistance(hash1.hash, hash2.hash);
  return distance <= threshold;
}

