import type { Photo, Decisions, FsContext } from "../../types";
import { deletePhotos } from "../fs/fileSystemService";

/**
 * Review Service
 * 
 * Business logic layer for review operations.
 */

/**
 * Filter photos marked as trash
 * 
 * @param photos - All photos
 * @param decisions - Decisions
 * @returns Photos marked as trash
 */
export function getTrashPhotos(
  photos: Photo[],
  decisions: Decisions
): Photo[] {
  const trashIndices = Object.entries(decisions)
    .filter(([, decision]) => decision === "trash")
    .map(([index]) => Number(index));

  return trashIndices
    .map(index => photos[index])
    .filter(Boolean); // Filter out null/undefined
}

/**
 * Filter photos marked as keep
 * 
 * @param photos - All photos
 * @param decisions - Decisions
 * @returns Photos marked as keep
 */
export function getKeepPhotos(
  photos: Photo[],
  decisions: Decisions
): Photo[] {
  const keepIndices = Object.entries(decisions)
    .filter(([, decision]) => decision === "keep")
    .map(([index]) => Number(index));

  return keepIndices
    .map(index => photos[index])
    .filter(Boolean);
}

/**
 * Calculate review statistics
 * 
 * @param photos - All photos
 * @param decisions - Decisions
 * @returns Statistics
 */
export function calculateReviewStats(
  photos: Photo[],
  decisions: Decisions
) {
  const total = photos.length;
  const decided = Object.keys(decisions).length;
  
  const trashPhotos = getTrashPhotos(photos, decisions);
  const keepPhotos = getKeepPhotos(photos, decisions);
  
  const trashCount = trashPhotos.length;
  const keepCount = keepPhotos.length;
  
  const trashBytes = trashPhotos.reduce(
    (sum, photo) => sum + photo.sizeBytes,
    0
  );
  
  const keepBytes = keepPhotos.reduce(
    (sum, photo) => sum + photo.sizeBytes,
    0
  );

  return {
    total,
    decided,
    trashCount,
    keepCount,
    trashBytes,
    keepBytes,
    pending: total - decided,
  };
}

/**
 * Check if all photos have been reviewed
 * 
 * @param photos - All photos
 * @param decisions - Decisions
 * @returns true if all are keep/trash
 */
export function isReviewComplete(
  photos: Photo[],
  decisions: Decisions
): boolean {
  if (photos.length === 0) return false;
  
  return photos.every((_, index) => {
    const decision = decisions[index];
    return decision === "keep" || decision === "trash";
  });
}

/**
 * Finalize review and delete trash photos
 * 
 * @param fsContext - File system context
 * @param photos - All photos
 * @param decisions - Decisions
 * @returns Number of deleted photos
 */
export async function finalizeReview(
  fsContext: FsContext,
  photos: Photo[],
  decisions: Decisions
): Promise<number> {
  const trashPhotos = getTrashPhotos(photos, decisions);
  
  if (trashPhotos.length === 0) {
    console.log("No photos to delete");
    return 0;
  }

  console.log(`Deleting ${trashPhotos.length} photos...`);
  
  const deletedCount = await deletePhotos(fsContext, trashPhotos);
  
  console.log(`Successfully deleted ${deletedCount} photos`);
  
  return deletedCount;
}

