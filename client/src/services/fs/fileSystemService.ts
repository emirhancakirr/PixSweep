import type { Photo, FsContext } from "../../types";

/**
 * File System Service
 * 
 * Service layer for file system operations.
 * No dependency on store - pure functions.
 */

/**
 * Delete file by relative path
 * Navigates through folder hierarchy and deletes the file
 * 
 * @param root - Root directory handle
 * @param relPath - Relative path (e.g., "2024/08/photo.jpg")
 */
export async function deleteByRelativePath(
  root: FileSystemDirectoryHandle,
  relPath: string
): Promise<void> {
  const parts = relPath.split("/");
  const fileName = parts.pop();
  
  if (!fileName) {
    throw new Error(`Invalid relative path: ${relPath}`);
  }

  let dir = root;
  
  // Navigate through folder hierarchy
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part);
  }

  // Delete the file
  await dir.removeEntry(fileName);
}

/**
 * Request write permission for directory
 * 
 * @param dir - Directory handle
 * @throws Error if write permission is not granted
 */
export async function ensureWritePermission(
  dir: FileSystemDirectoryHandle
): Promise<void> {
  // @ts-ignore - requestPermission experimental API
  const permission = await dir.requestPermission?.({ mode: "readwrite" });
  
  if (permission && permission !== "granted") {
    throw new Error("Write permission not granted for directory.");
  }
}

/**
 * Delete multiple files
 * 
 * @param fsContext - File system context
 * @param photos - Photos to delete
 * @returns Number of deleted photos
 */
export async function deletePhotos(
  fsContext: FsContext,
  photos: Photo[]
): Promise<number> {
  await ensureWritePermission(fsContext.rootDir);

  let deletedCount = 0;

  for (const photo of photos) {
    try {
      await deleteByRelativePath(fsContext.rootDir, photo.relPath);
      
      // Clean up preview URL
      if (photo.previewUrl) {
        try {
          URL.revokeObjectURL(photo.previewUrl);
        } catch (error) {
          console.warn(`Failed to revoke URL for ${photo.name}:`, error);
        }
      }
      
      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete ${photo.relPath}:`, error);
      // Continue, try to delete other files
    }
  }

  return deletedCount;
}

/**
 * Check if Directory Picker API is available
 */
export function isDirectoryPickerSupported(): boolean {
  return !!(window as any).showDirectoryPicker;
}

