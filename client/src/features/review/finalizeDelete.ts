import { usePhotosStore } from "../../state/usePhotosStore";
import { finalizeReview } from "../../services/review";

/**
 * Review'ı sonlandır ve trash fotoğrafları sil
 * 
 * Store'dan veriyi alır ve reviewService'e delege eder.
 * İşlem tamamlandıktan sonra store'u temizler.
 * 
 * @throws FS context yoksa veya silme izni verilmezse hata fırlatır
 */
export async function finalizeDelete(): Promise<void> {
  const { fs, photos, decisions, clear } = usePhotosStore.getState();
  
  if (!fs) {
    throw new Error("FS bağlamı yok. Dosyalar File System Access API ile seçilmemiş.");
  }

  // Business logic service katmanında
  const deletedCount = await finalizeReview(fs, photos, decisions);
  
  console.log(`Review finalized. ${deletedCount} photos deleted.`);

  // Store'u temizle ve başa dön
  clear();
}