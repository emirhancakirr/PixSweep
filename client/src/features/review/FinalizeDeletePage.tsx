import { useState } from "react";
import { usePhotosStore } from "../../state/usePhotosStore";
import { finalizeDelete } from "./finalizeDelete";
import { calculateReviewStats, getTrashPhotos, getKeepPhotos } from "../../services/review";
import { PhotoGrid } from "../../components/PhotoGrid";
import type { Photo } from "../../types";

/**
 * Finalize ve Delete ekranı
 * Tüm fotoğraflar review edildikten sonra gösterilir
 */
export function FinalizeDeletePage() {
    const photos = usePhotosStore((s) => s.photos);
    const decisions = usePhotosStore((s) => s.decisions);
    const clear = usePhotosStore((s) => s.clear);
    const fs = usePhotosStore((s) => s.fs);

    const [isDeleting, setIsDeleting] = useState(false);
    const [deletedCount, setDeletedCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "keep" | "trash" | "all">("overview");

    const stats = calculateReviewStats(photos, decisions);
    const trashPhotos = getTrashPhotos(photos, decisions);
    const keepPhotos = getKeepPhotos(photos, decisions);

    const handleFinalize = async () => {
        if (!fs) {
            setError("Dosya sistemi erişimi yok. Dosyalar silinemez.");
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await finalizeDelete();
            setDeletedCount(trashPhotos.length);
        } catch (err: any) {
            setError(err.message || "Silme işlemi başarısız oldu.");
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        usePhotosStore.setState({ readyToFinalize: false });
    };

    const handleDone = () => {
        clear();
    };

    // Silme tamamlandıysa
    if (deletedCount !== null) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "24px",
                    padding: "24px",
                    backgroundColor: "#000",
                    color: "#fff",
                }}
            >
                <div style={{ fontSize: "4em" }}>✅</div>
                <h1 style={{ fontSize: "2em", fontWeight: "600" }}>Tamamlandı!</h1>
                <p style={{ fontSize: "1.2em", opacity: 0.8 }}>
                    {deletedCount} fotoğraf başarıyla silindi.
                </p>
                <button
                    onClick={handleDone}
                    style={{
                        padding: "12px 24px",
                        fontSize: "1em",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                    }}
                >
                    Tamam
                </button>
            </div>
        );
    }

    // Tab için filtreleme
    const getFilteredPhotos = (): Photo[] => {
        switch (activeTab) {
            case "keep":
                return keepPhotos;
            case "trash":
                return trashPhotos;
            case "all":
                return photos;
            default:
                return [];
        }
    };

    // Tab button style helper
    const getTabStyle = (tab: typeof activeTab) => ({
        padding: "10px 20px",
        fontSize: "1em",
        fontWeight: "600",
        backgroundColor: activeTab === tab ? "rgba(255, 255, 255, 0.2)" : "transparent",
        color: "#fff",
        border: activeTab === tab ? "2px solid rgba(255, 255, 255, 0.5)" : "2px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
    });

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                backgroundColor: "#000",
                color: "#fff",
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h1 style={{ fontSize: "2em", fontWeight: "600", marginBottom: "12px" }}>
                    Review Tamamlandı! 🎉
                </h1>

                {/* İstatistikler */}
                <div
                    style={{
                        display: "flex",
                        gap: "24px",
                        justifyContent: "center",
                        marginBottom: "16px",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2em", fontWeight: "600", color: "#22c55e" }}>
                            {stats.keepCount}
                        </div>
                        <div style={{ fontSize: "0.85em", opacity: 0.7 }}>Keep</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2em", fontWeight: "600", color: "#ef4444" }}>
                            {stats.trashCount}
                        </div>
                        <div style={{ fontSize: "0.85em", opacity: 0.7 }}>Trash</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2em", fontWeight: "600", color: "#f59e0b" }}>
                            {stats.total}
                        </div>
                        <div style={{ fontSize: "0.85em", opacity: 0.7 }}>Toplam</div>
                    </div>
                </div>

                {/* Hata mesajı */}
                {error && (
                    <div
                        style={{
                            backgroundColor: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid #ef4444",
                            borderRadius: "8px",
                            padding: "12px",
                            color: "#ef4444",
                            maxWidth: "500px",
                            margin: "0 auto 16px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Butonlar */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        style={{
                            padding: "10px 20px",
                            fontSize: "0.95em",
                            backgroundColor: "transparent",
                            color: "#fff",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "8px",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            opacity: isDeleting ? 0.5 : 1,
                        }}
                    >
                        İptal
                    </button>
                    {trashPhotos.length > 0 && (
                        <button
                            onClick={handleFinalize}
                            disabled={isDeleting || !fs}
                            style={{
                                padding: "10px 20px",
                                fontSize: "0.95em",
                                backgroundColor: isDeleting ? "#666" : "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: isDeleting || !fs ? "not-allowed" : "pointer",
                                fontWeight: "600",
                            }}
                        >
                            {isDeleting ? "Siliniyor..." : `${trashPhotos.length} Fotoğrafı Sil`}
                        </button>
                    )}
                    {trashPhotos.length === 0 && (
                        <button
                            onClick={handleDone}
                            style={{
                                padding: "10px 20px",
                                fontSize: "0.95em",
                                backgroundColor: "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            Tamam
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    marginBottom: "16px",
                }}
            >
                <button onClick={() => setActiveTab("overview")} style={getTabStyle("overview")}>
                    📊 Overview
                </button>
                <button onClick={() => setActiveTab("keep")} style={getTabStyle("keep")}>
                    ✓ Keep ({stats.keepCount})
                </button>
                <button onClick={() => setActiveTab("trash")} style={getTabStyle("trash")}>
                    ✗ Trash ({stats.trashCount})
                </button>
                <button onClick={() => setActiveTab("all")} style={getTabStyle("all")}>
                    🖼️ All ({stats.total})
                </button>
            </div>

            {/* Content Area */}
            <div
                style={{
                    flex: 1,
                    overflow: "hidden",
                    backgroundColor: "#0a0a0a",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                {activeTab === "overview" ? (
                    // Overview: İstatistikler ve uyarı
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            padding: "40px",
                        }}
                    >
                        {trashPhotos.length > 0 ? (
                            <div
                                style={{
                                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                                    border: "1px solid #ef4444",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    maxWidth: "500px",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ fontSize: "1.1em", marginBottom: "8px" }}>
                                    <strong>{trashPhotos.length}</strong> fotoğraf silinecek.
                                </p>
                                <p style={{ fontSize: "0.9em", opacity: 0.8 }}>
                                    Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?
                                </p>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "4em", marginBottom: "16px" }}>✨</div>
                                <p style={{ fontSize: "1.2em", opacity: 0.8 }}>
                                    Silinecek fotoğraf yok. Tüm fotoğrafları gözden geçirdiniz!
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Grid view
                    <PhotoGrid
                        photos={getFilteredPhotos()}
                        decisions={decisions}
                        columns={5}
                    />
                )}
            </div>
        </div>
    );
}

