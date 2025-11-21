import { useEffect, useState, useRef } from "react";
import type { AnimationDirection, Decision } from "../../types";
import { ensurePreviewUrl } from "../../services/fs/convertHeic";
import { PhotoOverlay } from "./PhotoOverlay";
import { DecisionBadge } from "../DecisionBadge";

interface PhotoViewerProps {
  file: File;
  animationDirection: AnimationDirection;
  decision?: Decision;
  hasDuplicates?: boolean;
}

/**
 * Photo viewer component
 * - HEIC conversion support
 * - Loading and error states
 * - Animation support
 * - Decision badge display
 */
export function PhotoViewer({ file, animationDirection, decision, hasDuplicates }: PhotoViewerProps) {
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const duplicateLoggedRef = useRef(false);

  // Photo loading effect
  useEffect(() => {
    let url: string;
    let active = true;
    setLoading(true);
    setError(undefined);
    duplicateLoggedRef.current = false; // Reset when file changes


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
        setError(`Failed to load image: ${err.message || "Unknown error"}`);
        setLoading(false);
      });

    // Cleanup: revoke URL
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Log duplicate warning when duplicate photo is shown
  useEffect(() => {
    if (hasDuplicates && !duplicateLoggedRef.current && !loading) {
      console.warn(`⚠️ Potential Duplicate Photo detected: ${file.name}`);
      duplicateLoggedRef.current = true;
    }
  }, [hasDuplicates, file.name, loading]);

  // Calculate animation transform
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
        <p>Loading...</p>
        <p style={{ fontSize: "0.9em", color: "#666" }}>{file.name}</p>
        {file.name.toLowerCase().endsWith(".heic") && (
          <p style={{ fontSize: "0.8em", color: "#999" }}>Converting HEIC...</p>
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
      {/* Color overlay */}
      <PhotoOverlay direction={animationDirection} />

      {/* Decision badge */}
      <DecisionBadge decision={decision || null} position="top-right" />

      {/* Duplicate warning - next to decision badge */}
      {hasDuplicates && (
        <div
          style={{
            position: "absolute",
            top: "70px", // Below decision badge (which is ~50px tall)
            right: "16px", // Same right position as decision badge
            backgroundColor: "rgba(245, 158, 11, 0.95)",
            backdropFilter: "blur(10px)",
            border: "2px solid #f59e0b",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.9em",
            fontWeight: "600",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "badgeFadeIn 0.3s ease-out",
          }}
        >
          <span style={{ fontSize: "1.2em" }}>⚠️</span>
          <span>Potential Duplicate Photo</span>
        </div>
      )}

      {/* Photo */}
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
          setError("Image cannot be displayed");
        }}
      />
    </div>
  );
}

