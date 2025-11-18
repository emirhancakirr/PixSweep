import { useEffect, useState } from "react";
import type { Photo, Decision } from "../../types";
import { ensurePreviewUrl } from "../../services/fs/convertHeic";
import { DecisionBadge } from "../DecisionBadge";

interface PhotoGridItemProps {
    photo: Photo;
    decision: Decision;
}

/**
 * Grid'deki tek bir fotoğraf item'ı
 * Thumbnail + Decision badge
 */
export function PhotoGridItem({ photo, decision }: PhotoGridItemProps) {
    const [preview, setPreview] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let url: string;
        let active = true;

        ensurePreviewUrl(photo.file)
            .then((p) => {
                if (!active) return;
                url = p;
                setPreview(p);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setError(true);
                setLoading(false);
            });

        return () => {
            active = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [photo.file]);

    const getBorderColor = () => {
        switch (decision) {
            case "keep":
                return "#22c55e"; // Green
            case "trash":
                return "#ef4444"; // Red
            case "archive":
                return "#9333ea"; // Purple
            default:
                return "#6b7280"; // Gray
        }
    };

    return (
        <div
            style={{
                position: "relative",
                aspectRatio: "1",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                overflow: "hidden",
                border: `3px solid ${getBorderColor()}`,
                boxShadow: `0 4px 12px ${getBorderColor()}40`,
                transition: "transform 0.2s ease-out",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                cursor: "pointer",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Decision Badge */}
            <DecisionBadge decision={decision} position="top-left" />

            {/* Loading state */}
            {loading && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        color: "#fff",
                        fontSize: "0.8em",
                    }}
                >
                    ⏳
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        color: "#ef4444",
                        fontSize: "0.8em",
                        textAlign: "center",
                        padding: "8px",
                    }}
                >
                    ❌
                </div>
            )}

            {/* Image */}
            {preview && !loading && !error && (
                <img
                    src={preview}
                    alt={photo.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                    onError={() => setError(true)}
                />
            )}

            {/* File name overlay on hover */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "#fff",
                    fontSize: "0.7em",
                    padding: "4px 8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.2s",
                }}
            >
                {photo.name}
            </div>
        </div>
    );
}

