/**
 * Single photo record
 */
export interface Photo {
  id: string;
  name: string;
  relPath: string;       // e.g., "2024/08/IMG_123.jpg"
  sizeBytes: number;
  file: File;
  previewUrl?: string;   // Optional preview URL
  hash?: {
    hash: bigint;
    hashString: string;
  }; // Optional perceptual hash for similarity detection
}

