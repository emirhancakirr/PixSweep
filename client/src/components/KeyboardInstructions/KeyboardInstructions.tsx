/**
 * Klavye talimatlarını gösteren component
 * Modern, minimal tasarım
 */

interface Instruction {
    key: string;
    action: string;
    color: string;
    icon?: string;
}

interface KeyboardInstructionsProps {
    position?: "top-right" | "bottom-right" | "left" | "right";
    compact?: boolean;
}

const instructions: Instruction[] = [
    {
        key: "→",
        action: "Keep",
        color: "#22c55e", // Yeşil
        icon: "✓",
    },
    {
        key: "←",
        action: "Trash",
        color: "#ef4444", // Kırmızı
        icon: "✗",
    },
    {
        key: "Space",
        action: "Skip",
        color: "#f59e0b", // Sarı/Turuncu
        icon: "↑",
    },
];

export function KeyboardInstructions({
    position = "right",
    compact = false
}: KeyboardInstructionsProps) {
    const getPositionStyles = () => {
        const base = {
            position: "absolute" as const,
            zIndex: 10,
        };

        switch (position) {
            case "top-right":
                return { ...base, top: 80, right: 20 };
            case "bottom-right":
                return { ...base, bottom: 80, right: 20 };
            case "right":
                return { ...base, top: 180, right: 20 };
            case "left":
                return { ...base, top: "50%", left: 20, transform: "translateY(-50%)" };
            default:
                return base;
        }
    };

    return (
        <div style={getPositionStyles()}>
            {/* Card Container */}
            <div
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    padding: compact ? "12px" : "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: compact ? "8px" : "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    minWidth: compact ? "120px" : "150px",
                }}
            >
                {/* Title */}
                {!compact && (
                    <div
                        style={{
                            fontSize: "0.75em",
                            fontWeight: "600",
                            color: "rgba(255, 255, 255, 0.6)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "4px",
                        }}
                    >
                        Shortcuts
                    </div>
                )}

                {/* Instructions */}
                {instructions.map((instruction) => (
                    <div
                        key={instruction.key}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                        }}
                    >
                        {/* Key Badge */}
                        <div
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                border: `1px solid ${instruction.color}`,
                                borderRadius: "6px",
                                padding: compact ? "4px 8px" : "6px 10px",
                                fontFamily: "monospace",
                                fontSize: compact ? "0.85em" : "0.9em",
                                fontWeight: "600",
                                color: instruction.color,
                                minWidth: compact ? "40px" : "50px",
                                textAlign: "center",
                                boxShadow: `0 0 8px ${instruction.color}20`,
                            }}
                        >
                            {instruction.key}
                        </div>

                        {/* Action + Icon */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                flex: 1,
                            }}
                        >
                            {instruction.icon && (
                                <span
                                    style={{
                                        fontSize: "1.2em",
                                        color: instruction.color,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {instruction.icon}
                                </span>
                            )}
                            <span
                                style={{
                                    fontSize: compact ? "0.85em" : "0.95em",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    fontWeight: "500",
                                }}
                            >
                                {instruction.action}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

