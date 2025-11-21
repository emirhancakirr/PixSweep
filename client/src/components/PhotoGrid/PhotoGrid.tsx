import type { Photo, Decisions } from "../../types";
import { PhotoGridItem } from "./PhotoGridItem";

interface PhotoGridProps {
    photos: Photo[];
    decisions: Decisions;
    columns?: number;
    allPhotos?: Photo[]; // All photos (to find index)
    onDecisionChange?: (photoIndex: number, newDecision: import("../../types").Decision) => void;
}

/**
 * Photo grid component
 * Displays all photos in a grid layout
 */
export function PhotoGrid({ photos, decisions, columns = 5, allPhotos, onDecisionChange }: PhotoGridProps) {
    if (photos.length === 0) {
        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                }}
            >
                No photos
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
                boxSizing: "border-box",
            }}
        >
            {photos.map((photo, index) => {
                // Find index in original photos array
                const originalIndex = allPhotos
                    ? allPhotos.findIndex(p => p.id === photo.id)
                    : index;

                return (
                    <PhotoGridItem
                        key={photo.id}
                        photo={photo}
                        decision={decisions[originalIndex] || null}
                        onDecisionChange={onDecisionChange}
                        photoIndex={originalIndex}
                    />
                );
            })}
        </div>
    );
}

