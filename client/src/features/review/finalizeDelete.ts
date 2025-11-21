import { usePhotosStore } from "../../state/usePhotosStore";
import { finalizeReview } from "../../services/review";

/**
 * Finalize review and delete trash photos
 * 
 * Fetches data from store and delegates to reviewService.
 * Clears store after operation completes.
 * 
 * @throws Error if FS context is missing or deletion permission is denied
 */
export async function finalizeDelete(): Promise<void> {
  const { fs, photos, decisions, clear } = usePhotosStore.getState();
  
  if (!fs) {
    throw new Error("FS context missing. Files were not selected using File System Access API.");
  }

  // Business logic is in service layer
  const deletedCount = await finalizeReview(fs, photos, decisions);
  
  console.log(`Review finalized. ${deletedCount} photos deleted.`);

  // Clear store and return to start
  clear();
}