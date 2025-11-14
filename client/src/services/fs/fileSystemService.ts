import type { Photo, FsContext } from "../../types";

/**
 * File System Service
 * 
 * Dosya sistemi işlemlerini yöneten service katmanı.
 * Store'a bağımlılığı yoktur - pure functions.
 */

/**
 * Relative path'e göre dosya sil
 * Path'i parçalayarak hedef klasöre gider ve dosyayı siler
 * 
 * @param root - Root directory handle
 * @param relPath - Relative path (örn: "2024/08/photo.jpg")
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
  
  // Klasör hiyerarşisinde ilerle
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part);
  }

  // Dosyayı sil
  await dir.removeEntry(fileName);
}

/**
 * Directory için yazma izni iste
 * 
 * @param dir - Directory handle
 * @throws Yazma izni verilmezse hata fırlatır
 */
export async function ensureWritePermission(
  dir: FileSystemDirectoryHandle
): Promise<void> {
  // @ts-ignore - requestPermission experimental API
  const permission = await dir.requestPermission?.({ mode: "readwrite" });
  
  if (permission && permission !== "granted") {
    throw new Error("Klasöre yazma izni verilmedi.");
  }
}

/**
 * Birden fazla dosyayı sil
 * 
 * @param fsContext - File system context
 * @param photos - Silinecek fotoğraflar
 * @returns Silinen fotoğraf sayısı
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
      
      // Preview URL'i temizle
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
      // Devam et, diğer dosyaları silmeye çalış
    }
  }

  return deletedCount;
}

/**
 * Directory picker API'nin mevcut olup olmadığını kontrol et
 */
export function isDirectoryPickerSupported(): boolean {
  return !!(window as any).showDirectoryPicker;
}

