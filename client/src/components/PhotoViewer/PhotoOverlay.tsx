import type { AnimationDirection } from "../../types";

interface PhotoOverlayProps {
    direction: AnimationDirection;
}

/**
 * Fotoğraf üzerindeki renk overlay
 * Animasyon yönüne göre renk değişir:
 * - right (keep): Yeşil
 * - left (trash): Kırmızı
 * - up (skip): Sarı
 */
export function PhotoOverlay({ direction }: PhotoOverlayProps) {
    if (!direction) return null;

    const getBackgroundColor = () => {
        switch (direction) {
            case "right":
                return "rgba(0, 255, 0, 0.5)"; // Yeşil - Keep
            case "left":
                return "rgba(255, 0, 0, 0.5)"; // Kırmızı - Trash
            case "up":
                return "rgba(255, 193, 7, 0.5)"; // Sarı - Skip
            default:
                return "transparent";
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: getBackgroundColor(),
                opacity: 0.4,
                transition: "opacity 0.3s ease-out",
                borderRadius: 8,
                pointerEvents: "none",
            }}
        />
    );
}

