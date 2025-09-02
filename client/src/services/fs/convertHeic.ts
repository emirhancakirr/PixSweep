
export async function getPreviewBlob(file: File): Promise<Blob> {
  if (!/\.heic$/i.test(file.name)) return file;
  try {
    const mod = await import("heic2any");
    const result = await mod.default({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    const blob = Array.isArray(result) ? result[0] : result;
    return blob;
  } catch (e) {
    console.warn("HEIC convert failed, using original file", e);
    return file;
  }
  
}