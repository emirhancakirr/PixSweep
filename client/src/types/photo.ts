/**
 * Tek fotoğraf kaydı
 */
export interface Photo {
  id: string;
  name: string;
  relPath: string;       // "2024/08/IMG_123.jpg" gibi
  sizeBytes: number;
  file: File;
  previewUrl?: string;   // Optional preview URL
}

