export async function getPreviewBlob(file: File): Promise<Blob> {
  // Check if it's a HEIC file
  if (!/\.heic$/i.test(file.name)) {
    console.log(`Not a HEIC file: ${file.name}, returning original`);
    return file;
  }

  console.log(`🔄 Converting HEIC to JPEG: ${file.name}`);
  
  try {
    const mod = await import("heic2any");
    console.log("heic2any library loaded successfully");
    
    const result = await mod.default({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    
    const blob = Array.isArray(result) ? result[0] : result;
    return blob;
  } catch (e) {
    return file;
  }
}

/**
 * Lazily convert a file to a preview URL.
 * - If the file is HEIC, convert to JPEG using getPreviewBlob.
 * - Otherwise use the file directly.
 */
export async function ensurePreviewUrl(file: File): Promise<string> {
  const blob = await getPreviewBlob(file);
  return URL.createObjectURL(blob);
}