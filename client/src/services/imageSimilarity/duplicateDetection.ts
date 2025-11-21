import type { Photo } from "../../types";
import { computePhotoHash } from "./similarityService";
import { hammingDistance } from "./perceptualHash";

/**
 * Duplicate Detection Service
 * 
 * Detects very similar photos (potential duplicates) with high similarity (0-1 range).
 * Reorders photos to place duplicates next to each other.
 */

export interface DuplicatePair {
  photo1: Photo;
  photo2: Photo;
  similarity: number; // 0-1, where 1 is identical
  distance: number; // Hamming distance
}

const MAX_HASH_BITS = 72; // 9x8 = 72 bits for dHash

/**
 * Calculate similarity score from Hamming distance
 * 
 * @param distance - Hamming distance
 * @param maxBits - Maximum possible bits (default: 72 for 9x8 dHash)
 * @returns Similarity score 0-1 (1 = identical, 0 = completely different)
 */
export function calculateSimilarity(distance: number, maxBits: number = MAX_HASH_BITS): number {
  return Math.max(0, 1 - distance / maxBits);
}

/**
 * Detect duplicate pairs in photos
 * 
 * @param photos - Photos to check
 * @param similarityThreshold - Minimum similarity (0-1) to consider duplicate (default: 0.9)
 * @param onProgress - Optional progress callback
 * @returns Array of duplicate pairs
 */
export async function detectDuplicates(
  photos: Photo[],
  similarityThreshold: number = 0.9,
  onProgress?: (current: number, total: number) => void
): Promise<DuplicatePair[]> {
  const duplicates: DuplicatePair[] = [];
  const processed = new Set<string>();

  // Compute hashes for all photos
  const photoHashes = new Map<string, { photo: Photo; hash: bigint }>();
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    try {
      const hashResult = await computePhotoHash(photo);
      photoHashes.set(photo.id, { photo, hash: hashResult.hash });
    } catch (error) {
      console.warn(`Failed to compute hash for ${photo.name}:`, error);
    }
    onProgress?.(i + 1, photos.length);
  }

  // Find duplicate pairs
  const photoArray = Array.from(photoHashes.values());
  
  for (let i = 0; i < photoArray.length; i++) {
    const { photo: photo1, hash: hash1 } = photoArray[i];
    
    for (let j = i + 1; j < photoArray.length; j++) {
      const { photo: photo2, hash: hash2 } = photoArray[j];
      
      const pairKey = [photo1.id, photo2.id].sort().join("-");
      if (processed.has(pairKey)) continue;
      
      const distance = hammingDistance(hash1, hash2);
      const similarity = calculateSimilarity(distance);
      
      if (similarity >= similarityThreshold) {
        duplicates.push({
          photo1,
          photo2,
          similarity,
          distance,
        });
        processed.add(pairKey);
      }
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending
}

/**
 * Reorder photos to place duplicates next to each other
 * 
 * @param photos - Original photo array
 * @param duplicates - Array of duplicate pairs
 * @returns Reordered photo array
 */
export function reorderPhotosForDuplicates(
  photos: Photo[],
  duplicates: DuplicatePair[]
): Photo[] {
  if (duplicates.length === 0) return photos;

  // Build duplicate map
  const duplicateMap = new Map<string, Set<string>>();
  
  duplicates.forEach(({ photo1, photo2 }) => {
    if (!duplicateMap.has(photo1.id)) {
      duplicateMap.set(photo1.id, new Set());
    }
    if (!duplicateMap.has(photo2.id)) {
      duplicateMap.set(photo2.id, new Set());
    }
    duplicateMap.get(photo1.id)!.add(photo2.id);
    duplicateMap.get(photo2.id)!.add(photo1.id);
  });

  // Create reordered array
  const reordered: Photo[] = [];
  const used = new Set<string>();
  const photoMap = new Map(photos.map(p => [p.id, p]));

  // First, add all non-duplicate photos
  photos.forEach(photo => {
    if (!duplicateMap.has(photo.id) && !used.has(photo.id)) {
      reordered.push(photo);
      used.add(photo.id);
    }
  });

  // Then, add duplicate groups
  duplicateMap.forEach((duplicateIds, photoId) => {
    if (used.has(photoId)) return;

    const photo = photoMap.get(photoId);
    if (!photo) return;

    // Add the main photo
    reordered.push(photo);
    used.add(photoId);

    // Add all its duplicates right after
    duplicateIds.forEach(dupId => {
      if (!used.has(dupId)) {
        const dupPhoto = photoMap.get(dupId);
        if (dupPhoto) {
          reordered.push(dupPhoto);
          used.add(dupId);
        }
      }
    });
  });

  // Add any remaining photos
  photos.forEach(photo => {
    if (!used.has(photo.id)) {
      reordered.push(photo);
    }
  });

  return reordered;
}

/**
 * Build duplicate map for store
 * 
 * @param duplicates - Array of duplicate pairs
 * @returns Map of photo ID to array of duplicate photo IDs
 */
export function buildDuplicateMap(duplicates: DuplicatePair[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  duplicates.forEach(({ photo1, photo2 }) => {
    if (!map[photo1.id]) {
      map[photo1.id] = [];
    }
    if (!map[photo2.id]) {
      map[photo2.id] = [];
    }
    
    if (!map[photo1.id].includes(photo2.id)) {
      map[photo1.id].push(photo2.id);
    }
    if (!map[photo2.id].includes(photo1.id)) {
      map[photo2.id].push(photo1.id);
    }
  });

  return map;
}

