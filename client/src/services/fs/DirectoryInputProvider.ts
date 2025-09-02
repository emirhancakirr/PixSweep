import type { Photo } from "../../state/usePhotosStore";
import type { RefObject } from "react";
import { getPreviewBlob } from "./convertHeic";

const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp|tiff|heic)$/i;

export async function pickWithDirectoryInput(
  inputRef: RefObject<HTMLInputElement>
): Promise<Photo[]> {
  // Input'u kullanıcı adına tıklamak için:
  if (!inputRef.current) throw new Error("Dosya seçici bulunamadı.");
  if (!inputRef.current.files?.length) {
    inputRef.current.click();
    // onChange tetiklenince yeniden buraya düşeceğiz
    return new Promise<Photo[]>((resolve, reject) => {
      const handler = async () => {
        try {
          const result = await filesToPhotos(inputRef.current!.files!);
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          inputRef.current!.removeEventListener("change", handler);
        }
      };
      inputRef.current.addEventListener("change", handler, { once: true });
    });
  } else {
    // Zaten dosyalar varsa direkt işle
    return filesToPhotos(inputRef.current.files);
  }
}

async function filesToPhotos(fileList: FileList): Promise<Photo[]> {
  const arr = Array.from(fileList).filter(f => IMAGE_RE.test(f.name));
  const photos = await Promise.all(
    arr.map(async (file) => {
      const relPath = (file as any).webkitRelativePath || file.name;
      const previewBlob = await getPreviewBlob(file);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        relPath,
        sizeBytes: file.size,
        previewUrl: URL.createObjectURL(previewBlob),
      };
    })
  );
  return photos;
}