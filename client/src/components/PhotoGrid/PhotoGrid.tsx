import type { Photo, Decisions } from "../../types";
import { PhotoGridItem } from "./PhotoGridItem";

interface PhotoGridProps {
    photos: Photo[];
    decisions: Decisions;
    columns?: number;
}

/**
 * Fotoğraf grid component'i
 * Tüm fotoğrafları grid şeklinde gösterir
 */
export function PhotoGrid({ photos, decisions, columns = 5 }: PhotoGridProps) {
    if (photos.length === 0) {
        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                }}
            >
                Fotoğraf yok
            </div>
        );
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: "12px",
                padding: "12px",
                width: "100%",
                maxHeight: "100%",
                overflowY: "auto",
            }}
        >
            {photos.map((photo, index) => (
                <PhotoGridItem
                    key={photo.id}
                    photo={photo}
                    decision={decisions[index] || null}
                />
            ))}
        </div>
    );
}

