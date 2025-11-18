import { CircularProgress } from "../../components/CircularProgress";
import { PhotoViewer } from "../../components/PhotoViewer";
import { FinalizeDeletePage } from "./FinalizeDeletePage";
import { usePhotoReview } from "../../hooks/usePhotoReview";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import { usePhotosStore } from "../../state/usePhotosStore";

export function ReviewPage() {
  // Review state'i ve actions
  const { photos, index, currentPhoto, currentDecision, stats, allReviewed, next, setDecision } = usePhotoReview();
  const readyToFinalize = usePhotosStore((s) => s.readyToFinalize);

  // Klavye kontrolleri (her zaman çağrılmalı, conditional return'den önce)
  const { animationDirection } = useKeyboardControls({
    index,
    onDecision: setDecision,
    onNext: next,
    animationDuration: 300,
  });

  // Finalize ekranına geç
  if (readyToFinalize) {
    return <FinalizeDeletePage />;
  }

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
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gridTemplateRows: "auto 1fr",
        gap: "12px",
        padding: "12px",
        overflow: "hidden",
        backgroundColor: "#000",
        boxSizing: "border-box",
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Tamamlama mesajı - Grid'in üstünde overlay */}
      {allReviewed && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(34, 197, 94, 0.95)",
          color: "#fff",
          padding: "2em 3em",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          zIndex: 100,
          animation: "fadeIn 0.5s ease-out",
        }}>
          <div style={{ fontSize: "3em", marginBottom: "0.2em" }}>🎉</div>
          <h2 style={{ fontSize: "1.8em", fontWeight: "600", marginBottom: "0.3em" }}>
            Tebrikler!
          </h2>
          <p style={{ fontSize: "1.1em", opacity: 0.9 }}>
            Tüm fotoğrafları review ettin!
          </p>
          <p style={{ fontSize: "0.9em", marginTop: "0.5em", opacity: 0.8 }}>
            {stats.decided} fotoğraf işlendi
          </p>
        </div>
      )}

      {/* Grid Cell 1: Ana içerik (fotoğraf) - Sol ve ortada */}
      <div
        style={{
          gridColumn: "1",
          gridRow: "1 / 3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {currentPhoto && !allReviewed ? (
          <PhotoViewer
            file={currentPhoto.file}
            animationDirection={animationDirection}
            decision={currentDecision}
          />
        ) : null}
      </div>

      {/* Grid Cell 2: Progress bar - Sağ üst */}
      <div
        style={{
          gridColumn: "2",
          gridRow: "1",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
        }}
      >
        <CircularProgress
          current={stats.decided}
          total={stats.total}
          label="photos"
          size={100}
          textColor="#fff"
        />
      </div>

      {/* Grid Cell 3: Keyboard Instructions - Sağ alt */}
      {!allReviewed && (
        <div
          style={{
            gridColumn: "2",
            gridRow: "2",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          {/* KeyboardInstructions için wrapper - compact */}
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(10px)",
              borderRadius: "8px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minWidth: "130px",
            }}
          >
            <div
              style={{
                fontSize: "0.65em",
                fontWeight: "600",
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "2px",
              }}
            >
              Shortcuts
            </div>
            {[
              { key: "→", action: "Keep", color: "#22c55e", icon: "✓" },
              { key: "←", action: "Trash", color: "#ef4444", icon: "✗" },
              { key: "␣", action: "Skip", color: "#f59e0b", icon: "↑" },
            ].map((instruction) => (
              <div
                key={instruction.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: `1px solid ${instruction.color}`,
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontFamily: "monospace",
                    fontSize: "0.8em",
                    fontWeight: "600",
                    color: instruction.color,
                    minWidth: "40px",
                    textAlign: "center",
                    boxShadow: `0 0 6px ${instruction.color}20`,
                  }}
                >
                  {instruction.key}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
                  <span style={{ fontSize: "1em", color: instruction.color, fontWeight: "bold" }}>
                    {instruction.icon}
                  </span>
                  <span style={{ fontSize: "0.85em", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                    {instruction.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}