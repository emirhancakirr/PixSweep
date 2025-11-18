import { useEffect, useState } from "react";
import type { AnimationDirection, Decision } from "../../types";
import { ensurePreviewUrl } from "../../services/fs/convertHeic";
import { PhotoOverlay } from "./PhotoOverlay";
import { DecisionBadge } from "../DecisionBadge";

interface PhotoViewerProps {
  file: File;
  animationDirection: AnimationDirection;
  decision?: Decision;
}

/**
 * Fotoğraf görüntüleyici component
 * - HEIC dönüştürme desteği
 * - Loading ve error state'leri
 * - Animasyon desteği
 * - Decision badge gösterimi
 */
export function PhotoViewer({ file, animationDirection, decision }: PhotoViewerProps) {
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  // Fotoğraf yükleme effect
  useEffect(() => {
    let url: string;
    let active = true;
    setLoading(true);
    setError(undefined);


    ensurePreviewUrl(file)
      .then(p => {
        if (!active) return;
        url = p;
        setPreview(p);
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error(`❌ Failed to load ${file.name}:`, err);
        setError(`Resim yüklenirken hata oluştu: ${err.message || "Bilinmeyen hata"}`);
        setLoading(false);
      });

    // Cleanup: URL'i revoke et
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Animasyon transform'u hesapla
  const getTransform = () => {
    switch (animationDirection) {
      case "right":
        return "translateX(100vw)";
      case "left":
        return "translateX(-100vw)";
      case "up":
        return "translateY(-100vh)";
      default:
        return "translateX(0)";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Yükleniyor...</p>
        <p style={{ fontSize: "0.9em", color: "#666" }}>{file.name}</p>
        {file.name.toLowerCase().endsWith(".heic") && (
          <p style={{ fontSize: "0.8em", color: "#999" }}>HEIC dönüştürülüyor...</p>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "red",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>{error}</p>
        <p style={{ fontSize: "0.9em" }}>{file.name}</p>
      </div>
    );
  }

  // Success state - Fotoğraf göster
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        transform: getTransform(),
        transition: "transform 0.3s ease-out",
      }}
    >
      {/* Renk overlay */}
      <PhotoOverlay direction={animationDirection} />

      {/* Decision badge */}
      <DecisionBadge decision={decision || null} position="top-right" />

      {/* Fotoğraf */}
      <img
        src={preview}
        alt={file.name}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: 8,
        }}
        onError={(e) => {
          console.error(`Image failed to render: ${file.name}`, e);
          setError("Resim görüntülenemiyor");
        }}
      />
    </div>
  );
}

