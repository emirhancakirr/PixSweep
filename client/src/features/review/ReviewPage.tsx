import { useMemo } from "react";
import { usePhotosStore } from "../../state/usePhotosStore";

export function ReviewPage() {
  const photos = usePhotosStore(s => s.photos);
  const index = usePhotosStore(s => s.index);
  const next = usePhotosStore(s => s.next);

  const current = useMemo(() => {
    if (!photos || photos.length === 0) return null;
    return photos[index] || null;
  }, [photos, index]);

  if (!photos.length) {
    return (
      <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",     // yatayda ortala
        justifyContent: "center", // dikeyde ortala
        gap: 16,
        padding: 24,
      }}
      >
        <h2>Henüz klasör seçmedin</h2>
        <p>Ana sayfadan klasör seçerek başla.</p>
      </div>
    );
  }

  return (
    <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",     // yatayda ortala
      justifyContent: "center", // dikeyde ortala
      gap: 16,
      padding: 24,
    }}
    >
      {current && (
        <img
          src={current.previewUrl}
          alt={current.name}
          style={{
            maxWidth: "90%",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 8,
            display: "block",
            margin: "0 auto",   // ← yatayda ortalar
          }}
        />
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={next} disabled={index >= photos.length - 1}>
          Sonraki Fotoğraf
        </button>
      </div>
    </div>
  );
}