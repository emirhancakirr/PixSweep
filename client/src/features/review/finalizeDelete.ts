import { usePhotosStore } from "../../state/usePhotosStore";

/** Path parçalayarak hedef klasöre in ve dosyayı sil */
async function deleteByRelativePath(
  root: FileSystemDirectoryHandle,
  relPath: string
) {
  const parts = relPath.split("/");
  const fileName = parts.pop()!;
  let dir = root;
  for (const p of parts) {
    dir = await dir.getDirectoryHandle(p);
  }
  await dir.removeEntry(fileName);
}

/** Yazma izni iste */
async function ensureWritePermission(dir: FileSystemDirectoryHandle) {
  // @ts-ignore
  const perm = await dir.requestPermission?.({ mode: "readwrite" });
  if (perm && perm !== "granted") throw new Error("Klasöre yazma izni verilmedi.");
}

export async function finalizeDelete() {
  const { fs, photos, decisions, clear } = usePhotosStore.getState();
  if (!fs) throw new Error("FS bağlamı yok.");
  await ensureWritePermission(fs.rootDir);

  const trashIndexes = Object.entries(decisions)
    .filter(([, d]) => d === "trash")
    .map(([i]) => Number(i));

  for (const idx of trashIndexes) {
    const p = photos[idx];
    if (!p) continue;
    await deleteByRelativePath(fs.rootDir, p.relPath);
    try { URL.revokeObjectURL(p.previewUrl); } catch {}
  }

  // İstersen sadece silinenleri listeden çıkarabilirsin;
  // burada basitçe başa dönüyoruz.
  clear();
}