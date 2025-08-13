import { useState } from "react";
import { pickWithFSARecursive } from "../../services/fs/FSAProvider";
import { usePhotosStore } from "../../state/usePhotosStore";

export default function Welcome() {
  const setFsAndPhotos = usePhotosStore(s => s.setFsAndPhotos);
  const [err, setErr] = useState<string | null>(null);

  async function handlePick() {
    setErr(null);
    try {
      // @ts-ignore
      const hasFSA = !!window.showDirectoryPicker;
      if (!hasFSA) throw new Error("Bu tarayıcı klasör seçimi desteklemiyor.");
      const { rootDir, photos } = await pickWithFSARecursive();
      setFsAndPhotos({ rootDir }, photos);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Klasör okunamadı.");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1>Hoş geldin 👋</h1>
      <p>Temizlemeye başlamak istediğin klasörü seçmek için aşağıdaki butona tıkla.</p>
      <button onClick={handlePick}>Klasör Seç</button>
      {err && <div style={{ color: "tomato", marginTop: 12 }}>{err}</div>}
    </div>
  );
}