import type { Photo, Decision, Decisions, FsContext } from "../../types";
import { deletePhotos } from "../fs/fileSystemService";

/**
 * Review Service
 * 
 * Review işlemlerinin business logic'ini yöneten service katmanı.
 */

/**
 * Trash olarak işaretlenen fotoğrafları filtrele
 * 
 * @param photos - Tüm fotoğraflar
 * @param decisions - Kararlar
 * @returns Trash olarak işaretlenen fotoğraflar
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
    .filter(Boolean); // null/undefined'ları filtrele
}

/**
 * Keep olarak işaretlenen fotoğrafları filtrele
 * 
 * @param photos - Tüm fotoğraflar
 * @param decisions - Kararlar
 * @returns Keep olarak işaretlenen fotoğraflar
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
 * Review istatistiklerini hesapla
 * 
 * @param photos - Tüm fotoğraflar
 * @param decisions - Kararlar
 * @returns İstatistikler
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
 * Tüm fotoğraflar review edilmiş mi?
 * 
 * @param photos - Tüm fotoğraflar
 * @param decisions - Kararlar
 * @returns true eğer hepsi keep/trash ise
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
 * Review'ı sonlandır ve trash fotoğrafları sil
 * 
 * @param fsContext - File system context
 * @param photos - Tüm fotoğraflar
 * @param decisions - Kararlar
 * @returns Silinen fotoğraf sayısı
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

