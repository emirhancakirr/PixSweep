import { useState, useRef } from "react";
import {
  pickWithFSARecursive,
  pickWithDirectoryInput,
  isDirectoryPickerSupported
} from "../../services/fs";
import { usePhotosStore } from "../../state/usePhotosStore";
import { detectDuplicates, reorderPhotosForDuplicates, buildDuplicateMap } from "../../services/imageSimilarity";
import { DUPLICATE_DETECTION, COLORS, LAYOUT } from "../../constants";
import logo from "../../assets/PixSweep.png";

export default function Welcome() {
  const setFsAndPhotos = usePhotosStore(s => s.setFsAndPhotos);
  const setPhotos = usePhotosStore(s => s.setPhotos);
  const setDuplicateMap = usePhotosStore(s => s.setDuplicateMap);

  const [err, setErr] = useState<string | null>(null);
  const [isDetectingDuplicates, setIsDetectingDuplicates] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFSAAvailable = isDirectoryPickerSupported();

  async function handlePick() {
    setErr(null);
    setIsDetectingDuplicates(false);
    try {
      let photos;
      let fs;

      if (isFSAAvailable) {
        const result = await pickWithFSARecursive();
        fs = result.rootDir;
        photos = result.photos;
      } else {
        if (!inputRef.current) throw new Error("File picker not found.");
        photos = await pickWithDirectoryInput(inputRef as React.RefObject<HTMLInputElement>);
        if (!photos.length) throw new Error("No suitable images found.");
      }

      // Detect duplicates and reorder photos
      let duplicateMap: Record<string, string[]> = {};
      if (photos.length > 1) {
        setIsDetectingDuplicates(true);
        try {
          const duplicates = await detectDuplicates(photos, DUPLICATE_DETECTION.similarityThreshold, (current, total) => {
            // Optional: show progress
            console.log(`Detecting duplicates: ${current}/${total}`);
          });

          if (duplicates.length > 0) {
            // Reorder photos to place duplicates next to each other
            photos = reorderPhotosForDuplicates(photos, duplicates);
            // Build duplicate map
            duplicateMap = buildDuplicateMap(duplicates);

            // Set duplicate map BEFORE setting photos (so it's preserved)
            setDuplicateMap(duplicateMap);
          }
        } catch (error) {
          console.warn("Failed to detect duplicates:", error);
          // Continue anyway
        } finally {
          setIsDetectingDuplicates(false);
        }
      }

      // Set photos in store (duplicateMap artık korunuyor, sıfırlanmıyor)
      if (fs) {
        setFsAndPhotos({ rootDir: fs }, photos);
      } else {
        setPhotos(photos);
      }

    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Failed to read folder.");
      setIsDetectingDuplicates(false);
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${LAYOUT.spacing.xl}px`,
        background: `linear-gradient(135deg, ${COLORS.background} 0%, #1a1a1a 100%)`,
        boxSizing: "border-box",
      }}
    >
      {/* Logo and Title */}
      <div
        style={{
          textAlign: "center",
          marginBottom: `${LAYOUT.spacing.xxl}px`,
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        <img
          src={logo}
          alt="PixSweep Logo"
          style={{
            width: "400px",
            height: "auto",
            marginBottom: `${LAYOUT.spacing.lg}px`,
            filter: "drop-shadow(0 4px 20px rgba(255, 255, 255, 0.1))",
          }}
        />
        <h1
          style={{
            fontSize: "2.5em",
            fontWeight: "700",
            marginBottom: `${LAYOUT.spacing.sm}px`,
            background: "linear-gradient(135deg, #fff 0%, #999 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Welcome to PixSweep
        </h1>
        <p
          style={{
            fontSize: "1.1em",
            color: COLORS.textMuted,
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Quickly review and clean up your photo collection with smart duplicate detection
        </p>
      </div>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: `${LAYOUT.borderRadius.xl}px`,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: `${LAYOUT.spacing.xxl}px`,
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.6s ease-out 0.2s both",
        }}
      >
        {/* Select Button */}
        <button
          onClick={handlePick}
          disabled={isDetectingDuplicates}
          style={{
            width: "100%",
            padding: "18px 32px",
            fontSize: "1.1em",
            fontWeight: "600",
            color: COLORS.text,
            background: isDetectingDuplicates
              ? "rgba(100, 100, 100, 0.5)"
              : `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.keep} 100%)`,
            border: "none",
            borderRadius: `${LAYOUT.borderRadius.md}px`,
            cursor: isDetectingDuplicates ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: isDetectingDuplicates
              ? "none"
              : "0 4px 20px rgba(59, 130, 246, 0.3)",
            transform: isDetectingDuplicates ? "none" : "translateY(0)",
            opacity: isDetectingDuplicates ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isDetectingDuplicates) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(59, 130, 246, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDetectingDuplicates) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(59, 130, 246, 0.3)";
            }
          }}
        >
          {isDetectingDuplicates ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <span className="spinner" style={{
                width: "20px",
                height: "20px",
                border: "3px solid rgba(255, 255, 255, 0.3)",
                borderTop: "3px solid #fff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}></span>
              Detecting duplicates...
            </span>
          ) : (
            <>📁 Select Folder {!isFSAAvailable && "(Safari Mode)"}</>
          )}
        </button>

        {/* Browser Info */}
        {!isFSAAvailable && (
          <div
            style={{
              marginTop: `${LAYOUT.spacing.lg}px`,
              padding: `${LAYOUT.spacing.md}px`,
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${COLORS.warning}`,
              borderRadius: `${LAYOUT.borderRadius.md}px`,
              fontSize: "0.9em",
              color: COLORS.warning,
              lineHeight: "1.5",
            }}
          >
            <strong>⚠️ Limited Mode:</strong> Your browser doesn't support File System
            Access API. Automatic deletion will be disabled.
          </div>
        )}

        {/* Error Message */}
        {err && (
          <div
            style={{
              marginTop: `${LAYOUT.spacing.lg}px`,
              padding: `${LAYOUT.spacing.md}px`,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${COLORS.error}`,
              borderRadius: `${LAYOUT.borderRadius.md}px`,
              fontSize: "0.9em",
              color: COLORS.error,
              lineHeight: "1.5",
            }}
          >
            <strong>❌ Error:</strong> {err}
          </div>
        )}

        {/* Features List */}
        <div style={{ marginTop: `${LAYOUT.spacing.xl}px` }}>
          <div
            style={{
              fontSize: "0.85em",
              color: COLORS.textMuted,
              textAlign: "center",
              marginBottom: `${LAYOUT.spacing.md}px`,
            }}
          >
            ✨ Features
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: `${LAYOUT.spacing.sm}px` }}>
            {[
              { icon: "⚡", text: "Fast keyboard-driven workflow" },
              { icon: "🔍", text: "Smart duplicate detection" },
              { icon: "🔒", text: "100% client-side processing" },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${LAYOUT.spacing.sm}px`,
                  fontSize: "0.9em",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <span style={{ fontSize: "1.2em" }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}