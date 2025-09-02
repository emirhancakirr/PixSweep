import { useState, useRef } from "react";
import type { Photo } from "../../state/usePhotosStore";
import { pickWithFSARecursive } from "../../services/fs/FSAProvider";
import { pickWithDirectoryInput } from "../../services/fs/DirectoryInputProvider"; // fallback
import { usePhotosStore } from "../../state/usePhotosStore";

export default function Welcome() {
  const setFsAndPhotos = usePhotosStore(s => s.setFsAndPhotos);
  // Fallback: eğer store’da setPhotos yoksa inline bir setter oluştur.
  const setPhotosSelector = usePhotosStore(s => s.setPhotos) as
    | ((photos: Photo[]) => void)
    | undefined;
  const setPhotos =
    setPhotosSelector ||
    ((photos: Photo[]) => {
      console.warn("setPhotos action bulunamadı; fallback setter kullanıldı.");
      usePhotosStore.setState({ photos, index: 0, decisions: {} });
    });
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); // hidden directory input
  const isFSAAvailable = !!(window as any).showDirectoryPicker;

  async function handlePick() {
    setErr(null);
    try {
      if (isFSAAvailable) {
        const { rootDir, photos } = await pickWithFSARecursive();
        setFsAndPhotos({ rootDir }, photos);
      } else {
        if (!inputRef.current) throw new Error("Dosya seçici bulunamadı.");
        const photos = await pickWithDirectoryInput(inputRef as React.RefObject<HTMLInputElement>);
        if (!photos.length) throw new Error("Uygun görsel bulunamadı.");
        setPhotos(photos); // artık güvenli
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Klasör okunamadı.");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1>Hoş geldin 👋</h1>
      <p>Temizlemeye başlamak istediğin klasörü seç.</p>
      <button onClick={handlePick}>
        Klasör Seç {isFSAAvailable ? "" : "(Safari Modu)"}
      </button>
      {!isFSAAvailable && (
        <p style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>
          Tarayıcın File System Access API desteklemiyor. Silme işlemleri
          (dosyayı gerçekten kaldırma) devre dışı kalabilir.
        </p>
      )}
      {err && <div style={{ color: "tomato", marginTop: 12 }}>{err}</div>}
      {/* Hidden input for Safari fallback */}
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        // @ts-ignore: non-standard attributes
        webkitdirectory="true"
        directory=""
        multiple
        accept="image/*"
      />
    </div>
  );
}