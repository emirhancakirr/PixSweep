import { useEffect, useMemo } from "react";
import { usePhotosStore, selectors } from "../../state/usePhotosStore";
import { finalizeDelete } from "./finalizeDelete";

export function ReviewPage() {
  const fs = usePhotosStore(s => s.fs);
  const photos = usePhotosStore(s => s.photos);
  const index = usePhotosStore(s => s.index);
  const setDecision = usePhotosStore(s => s.setDecision);
  const next = usePhotosStore(s => s.next);
  const prev = usePhotosStore(s => s.prev);

  const current = usePhotosStore(selectors.currentPhoto);
  const stats = usePhotosStore(selectors.stats);

  // Klavye kısayolları
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") { setDecision(index, "keep"); next(); }
      if (e.key === "ArrowLeft")  { setDecision(index, "trash"); next(); }
      if (e.key === "ArrowUp")    { setDecision(index, "archive"); next(); }
      if (e.key === "ArrowDown")  { prev(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, setDecision, next, prev]);

  // Progress yüzdesi
  const progress = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.decided / stats.total) * 100);
  }, [stats]);

  if (!photos.length) {
    // foto yoksa Welcome'a dön (basitçe)
    return (
      <div style={{ padding: 24 }}>
        <h2>Henüz klasör seçmedin</h2>
        <p>Ana sayfadan klasör seçerek başla.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", height: "100vh" }}>
      {/* Sol: görüntü alanı */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.05)" }}>
        {current ? (
          <img
            src={current.previewUrl}
            alt={current.name}
            style={{ maxHeight: "90vh", maxWidth: "90%", objectFit: "contain", borderRadius: 8 }}
          />
        ) : <div>Fotoğraf yok</div>}
      </div>

      {/* Sağ: panel */}
      <aside style={{ padding: 16, overflow: "auto" }}>
        <h3>İlerleme</h3>
        <div style={{ height: 10, background: "#ddd", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #7dd3fc, #34d399)" }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12 }}>{stats.decided}/{stats.total} (%{progress})</div>

        <div style={{ marginTop: 16 }}>
          <strong>Silinecek (adet):</strong> {stats.trashCount}
        </div>
        <div>
          <strong>Silinecek (MB):</strong> {(stats.trashBytes / (1024 * 1024)).toFixed(2)}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button onClick={() => { usePhotosStore.getState().setDecision(index, "trash"); usePhotosStore.getState().next(); }}>← Çöp</button>
          <button onClick={() => { usePhotosStore.getState().setDecision(index, "keep"); usePhotosStore.getState().next(); }}>→ Tut</button>
          <button onClick={() => usePhotosStore.getState().prev()}>Geri</button>
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={async () => {
              if (!fs) return;
              await finalizeDelete(); // aşağıda
              alert("Seçtiklerin silindi (trash).");
            }}
            disabled={!fs || stats.trashCount === 0}
          >
            Seçtiklerimi Sil
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, opacity: .7 }}>
          Kısayollar: ← Çöp, → Tut, ↑ Arşiv, ↓ Geri
        </div>
      </aside>
    </div>
  );
}