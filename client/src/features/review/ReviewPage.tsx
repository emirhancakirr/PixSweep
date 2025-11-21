import { CircularProgress } from "../../components/CircularProgress";
import { PhotoViewer } from "../../components/PhotoViewer";
import { FinalizeDeletePage } from "./FinalizeDeletePage";
import { usePhotoReview } from "../../hooks/usePhotoReview";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import { usePhotosStore } from "../../state/usePhotosStore";
import { COLORS, LAYOUT, ANIMATION, UI } from "../../constants";

export function ReviewPage() {
  // Review state and actions
  const { photos, index, currentPhoto, currentDecision, stats, allReviewed, hasDuplicates, next, prev, setDecision } = usePhotoReview();
  const readyToFinalize = usePhotosStore((s) => s.readyToFinalize);

  // Keyboard controls (must be called before conditional return)
  const { animationDirection } = useKeyboardControls({
    index,
    onDecision: setDecision,
    onNext: next,
    onPrev: prev,
    animationDuration: ANIMATION.duration.normal,
  });

  // Navigate to finalize screen
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
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
        }}
      >
        <h2>No folder selected yet</h2>
        <p>Start by selecting a folder from the home page.</p>
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
        gap: `${LAYOUT.spacing.lg}px`,
        padding: `${LAYOUT.spacing.lg}px`,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${COLORS.background} 0%, #1a1a1a 100%)`,
        boxSizing: "border-box",
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>

      {/* Completion message - Modern overlay */}
      {allReviewed && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(135deg, ${COLORS.success} 0%, ${COLORS.info} 100%)`,
          backdropFilter: "blur(20px)",
          color: COLORS.text,
          padding: "3em 4em",
          borderRadius: `${LAYOUT.borderRadius.xl}px`,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(34, 197, 94, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          zIndex: 100,
          animation: "fadeIn 0.5s ease-out, scaleIn 0.5s ease-out",
        }}>
          <div style={{ fontSize: "4em", marginBottom: "0.3em", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>🎉</div>
          <h2 style={{ fontSize: "2em", fontWeight: "700", marginBottom: "0.4em", letterSpacing: "-0.02em" }}>
            Congratulations!
          </h2>
          <p style={{ fontSize: "1.2em", opacity: 0.95, marginBottom: "0.5em" }}>
            You've reviewed all photos! Press <span style={{ fontWeight: "bold" }}> right arrow </span> to finalize and delete.
          </p>
          <p style={{ fontSize: "1em", opacity: 0.8, fontWeight: "500" }}>
            {stats.decided} photos processed
          </p>
        </div>
      )}

      {/* Grid Cell 1: Main content (photo) - Left and centered */}
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
            hasDuplicates={hasDuplicates}
          />
        ) : null}
      </div>

      {/* Grid Cell 2: Progress bar - Top right */}
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
          size={UI.progressBar.size}
          textColor={COLORS.text}
        />
      </div>

      {/* Grid Cell 3: Keyboard Instructions - Bottom right */}
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
          {/* Wrapper for KeyboardInstructions - modern */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              borderRadius: `${LAYOUT.borderRadius.lg}px`,
              padding: `${LAYOUT.spacing.md}px`,
              display: "flex",
              flexDirection: "column",
              gap: `${LAYOUT.spacing.sm}px`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minWidth: "160px",
            }}
          >
            <div
              style={{
                fontSize: "0.7em",
                fontWeight: "700",
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: `${LAYOUT.spacing.xs}px`,
                textAlign: "center",
              }}
            >
              SHORTCUTS
            </div>
            {[
              { key: "→", action: "Keep", color: COLORS.keep, icon: "✓" },
              { key: "←", action: "Trash", color: COLORS.trash, icon: "✗" },
              { key: "␣", action: "Skip", color: COLORS.skip, icon: "↑" },
              { key: "⌫", action: "Previous", color: COLORS.previous, icon: "←" },
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
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: `1.5px solid ${instruction.color}`,
                    borderRadius: `${LAYOUT.borderRadius.sm}px`,
                    padding: "6px 10px",
                    fontFamily: "monospace",
                    fontSize: "0.85em",
                    fontWeight: "700",
                    color: instruction.color,
                    minWidth: "45px",
                    textAlign: "center",
                    boxShadow: `0 0 10px ${instruction.color}30, inset 0 0 10px ${instruction.color}10`,
                    transition: "all 0.2s ease",
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