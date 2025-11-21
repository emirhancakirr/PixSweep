import type { Decision } from "../../types";

interface DecisionBadgeProps {
    decision: Decision;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Fotoğrafın decision durumunu gösteren badge
 * Keep, Trash veya Not Labelled
 */
export function DecisionBadge({ decision, position = "top-right" }: DecisionBadgeProps) {
    const getBadgeConfig = () => {
        switch (decision) {
            case "keep":
                return {
                    text: "Keeped",
                    bgColor: "rgba(34, 197, 94, 0.9)", // Green
                    borderColor: "#22c55e",
                    icon: "✓",
                };
            case "trash":
                return {
                    text: "Trashed",
                    bgColor: "rgba(239, 68, 68, 0.9)", // Red
                    borderColor: "#ef4444",
                    icon: "✗",
                };
            case "archive":
                return {
                    text: "Archived",
                    bgColor: "rgba(147, 51, 234, 0.9)", // Purple
                    borderColor: "#9333ea",
                    icon: "📦",
                };
            default:
                return {
                    text: "Not Labelled",
                    bgColor: "rgba(107, 114, 128, 0.9)", // Gray
                    borderColor: "#6b7280",
                    icon: "○",
                };
        }
    };

    const getPositionStyle = () => {
        const base = {
            position: "absolute" as const,
        };

        switch (position) {
            case "top-left":
                return { ...base, top: "16px", left: "16px" };
            case "top-right":
                return { ...base, top: "16px", right: "16px" };
            case "bottom-left":
                return { ...base, bottom: "16px", left: "16px" };
            case "bottom-right":
                return { ...base, bottom: "16px", right: "16px" };
            default:
                return { ...base, top: "16px", right: "16px" };
        }
    };

    const config = getBadgeConfig();

    return (
        <div
            style={{
                ...getPositionStyle(),
                backgroundColor: config.bgColor,
                backdropFilter: "blur(10px)",
                border: `2px solid ${config.borderColor}`,
                borderRadius: "8px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#fff",
                fontWeight: "600",
                fontSize: "0.9em",
                boxShadow: `0 4px 12px ${config.borderColor}40`,
                zIndex: 20,
                animation: "badgeFadeIn 0.3s ease-out",
            }}
        >
            <span style={{ fontSize: "1.2em" }}>{config.icon}</span>
            <span>{config.text}</span>

            <style>{`
        @keyframes badgeFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
        </div>
    );
}

