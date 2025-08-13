import type { Photo } from "../../state/usePhotosStore";
const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp|tiff|heic)$/i;

export async function pickWithFSARecursive(): Promise<{
  rootDir: FileSystemDirectoryHandle;
  photos: Photo[];
}> {
  // @ts-ignore
  const rootDir: FileSystemDirectoryHandle = await window.showDirectoryPicker();
  const photos: Photo[] = [];

  async function walk(dir: FileSystemDirectoryHandle, prefix = "") {
    // @ts-ignore
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind === "file" && IMAGE_RE.test(name)) {
        const file = await (handle as FileSystemFileHandle).getFile();
        const relPath = prefix ? `${prefix}/${name}` : name;
        photos.push({
          id: crypto.randomUUID(),
          name: file.name,
          relPath,
          sizeBytes: file.size,
          previewUrl: URL.createObjectURL(file),
        });
      } else if (handle.kind === "directory") {
        const nextPrefix = prefix ? `${prefix}/${name}` : name;
        await walk(handle as FileSystemDirectoryHandle, nextPrefix);
      }
    }
  }

  await walk(rootDir);
  // İsteğe bağlı: isme göre sırala
  photos.sort((a, b) => a.relPath.localeCompare(b.relPath));

  return { rootDir, photos };
}