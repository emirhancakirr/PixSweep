import { useState } from "react";
import { usePhotosStore } from "../../state/usePhotosStore";
import { finalizeDelete } from "./finalizeDelete";
import { calculateReviewStats, getTrashPhotos, getKeepPhotos } from "../../services/review";
import { PhotoGrid } from "../../components/PhotoGrid";
import { isDirectoryPickerSupported } from "../../services/fs";
import { downloadDeleteScript } from "./deleteScripts";
import type { Photo, Decision } from "../../types";
import { COLORS, LAYOUT } from "../../constants";

/**
 * Finalize and Delete screen
 * Shown after all photos have been reviewed
 */
export function FinalizeDeletePage() {
    const photos = usePhotosStore((s) => s.photos);
    const decisions = usePhotosStore((s) => s.decisions);
    const clear = usePhotosStore((s) => s.clear);
    const fs = usePhotosStore((s) => s.fs);
    const setDecision = usePhotosStore((s) => s.setDecision);

    const [isDeleting, setIsDeleting] = useState(false);
    const [deletedCount, setDeletedCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "keep" | "trash" | "all">("overview");
    const [showFileList, setShowFileList] = useState(false);

    const stats = calculateReviewStats(photos, decisions);
    const trashPhotos = getTrashPhotos(photos, decisions);
    const keepPhotos = getKeepPhotos(photos, decisions);
    const isFSASupported = isDirectoryPickerSupported();

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

    const handleCopyFileList = async () => {
        const fileList = trashPhotos.map(photo => photo.relPath || photo.name).join('\n');
        try {
            await navigator.clipboard.writeText(fileList);
            alert('File list copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownloadFileList = () => {
        const fileList = trashPhotos.map(photo => photo.relPath || photo.name).join('\n');
        const blob = new Blob([fileList], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'files-to-delete.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadDeleteScript = () => {
        downloadDeleteScript();
    };

    // If deletion is completed - Modern success screen
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
                    gap: `${LAYOUT.spacing.xl}px`,
                    padding: `${LAYOUT.spacing.xl}px`,
                    background: `linear-gradient(135deg, ${COLORS.background} 0%, #1a1a1a 100%)`,
                    color: COLORS.text,
                }}
            >
                <div style={{
                    fontSize: "5em",
                    filter: "drop-shadow(0 8px 16px rgba(34, 197, 94, 0.3))",
                    animation: "bounceIn 0.6s ease-out"
                }}>✅</div>
                <div style={{ textAlign: "center", maxWidth: "500px" }}>
                    <h1 style={{
                        fontSize: "2.5em",
                        fontWeight: "700",
                        marginBottom: "0.5em",
                        background: `linear-gradient(135deg, ${COLORS.success} 0%, ${COLORS.info} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        Successfully Completed!
                    </h1>
                    <p style={{ fontSize: "1.3em", opacity: 0.9, marginBottom: "1em" }}>
                        {deletedCount} photos successfully deleted
                    </p>
                </div>
                <button
                    onClick={handleDone}
                    style={{
                        padding: "16px 40px",
                        fontSize: "1.1em",
                        background: `linear-gradient(135deg, ${COLORS.success} 0%, ${COLORS.info} 100%)`,
                        color: COLORS.text,
                        border: "none",
                        borderRadius: `${LAYOUT.borderRadius.md}px`,
                        cursor: "pointer",
                        fontWeight: "600",
                        boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 24px rgba(34, 197, 94, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.3)";
                    }}
                >
                    Start Over
                </button>
                <style>{`
                    @keyframes bounceIn {
                        0% {
                            opacity: 0;
                            transform: scale(0.3);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.05);
                        }
                        70% { transform: scale(0.9); }
                        100% { transform: scale(1); }
                    }
                    
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
                `}</style>
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

    // Tab button style helper - Modern
    const getTabStyle = (tab: typeof activeTab) => ({
        padding: "12px 24px",
        fontSize: "1em",
        fontWeight: "600",
        backgroundColor: activeTab === tab ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
        color: COLORS.text,
        border: activeTab === tab
            ? `2px solid rgba(255, 255, 255, 0.3)`
            : `2px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: `${LAYOUT.borderRadius.md}px`,
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: activeTab === tab ? "0 4px 12px rgba(255, 255, 255, 0.1)" : "none",
    });

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                padding: `${LAYOUT.spacing.lg}px`,
                background: `linear-gradient(135deg, ${COLORS.background} 0%, #1a1a1a 100%)`,
                color: COLORS.text,
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            {/* CSS Animations */}
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
            `}</style>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: `${LAYOUT.spacing.lg}px`, position: "relative", zIndex: 10 }}>
                <h1 style={{
                    fontSize: "2.2em",
                    fontWeight: "700",
                    marginBottom: `${LAYOUT.spacing.md}px`,
                    background: "linear-gradient(135deg, #fff 0%, #999 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                }}>
                    Review Completed! 🎉
                </h1>

                {/* İstatistikler - Modern cards */}
                <div
                    style={{
                        display: "flex",
                        gap: `${LAYOUT.spacing.lg}px`,
                        justifyContent: "center",
                        marginBottom: `${LAYOUT.spacing.lg}px`,
                    }}
                >
                    {[
                        { count: stats.keepCount, label: "Keep", color: COLORS.keep, icon: "✓" },
                        { count: stats.trashCount, label: "Trash", color: COLORS.trash, icon: "✗" },
                        { count: stats.total, label: "Total", color: COLORS.warning, icon: "📊" },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            textAlign: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.03)",
                            backdropFilter: "blur(10px)",
                            borderRadius: `${LAYOUT.borderRadius.md}px`,
                            border: `1px solid ${stat.color}40`,
                            padding: `${LAYOUT.spacing.md}px ${LAYOUT.spacing.lg}px`,
                            minWidth: "100px",
                            boxShadow: `0 4px 20px ${stat.color}20`,
                        }}>
                            <div style={{ fontSize: "1.2em", marginBottom: `${LAYOUT.spacing.xs}px` }}>{stat.icon}</div>
                            <div style={{ fontSize: "2.2em", fontWeight: "700", color: stat.color, marginBottom: "0.2em" }}>
                                {stat.count}
                            </div>
                            <div style={{ fontSize: "0.9em", opacity: 0.7, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hata mesajı - Modern */}
                {error && (
                    <div
                        style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            backdropFilter: "blur(10px)",
                            border: `2px solid ${COLORS.error}`,
                            borderRadius: `${LAYOUT.borderRadius.md}px`,
                            padding: `${LAYOUT.spacing.md}px ${LAYOUT.spacing.lg}px`,
                            color: COLORS.error,
                            maxWidth: "500px",
                            margin: `0 auto ${LAYOUT.spacing.lg}px`,
                            textAlign: "center",
                            boxShadow: `0 4px 20px ${COLORS.error}20`,
                            fontWeight: "500",
                        }}
                    >
                        <span style={{ fontSize: "1.2em", marginRight: `${LAYOUT.spacing.xs}px` }}>❌</span>
                        {error}
                    </div>
                )}

                {/* FS uyarısı */}
                {!fs && trashPhotos.length > 0 && (
                    <div
                        style={{
                            backgroundColor: "rgba(245, 158, 11, 0.2)",
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                            padding: "16px",
                            color: "#f59e0b",
                            maxWidth: "600px",
                            margin: "0 auto 16px",
                        }}
                    >
                        <div style={{ textAlign: "center", marginBottom: "12px" }}>
                            <strong>⚠️ Automatic deletion is not available</strong>
                        </div>
                        <p style={{ fontSize: "0.9em", marginBottom: "12px", textAlign: "left" }}>
                            Photos were selected using a fallback method that doesn't support automatic deletion.
                            {isFSASupported ? (
                                <>
                                    <br /><br />
                                    <strong style={{ color: "#22c55e" }}>
                                        Your browser supports File System Access API!
                                    </strong>
                                    <br />
                                    To enable automatic deletion, please restart and select your folder using the File System Access API.
                                </>
                            ) : (
                                <>
                                    <br /><br />
                                    <strong>Your browser doesn't support File System Access API.</strong>
                                    <br />
                                    For automatic deletion, please use Chrome, Edge, or Opera browser.
                                </>
                            )}
                            <br /><br />
                            <strong>Alternative: Delete files via Terminal</strong>
                            <br />
                            You can delete the files manually using the terminal. Download the file list and use one of these commands:
                            <br /><br />
                            <strong>macOS/Linux:</strong>
                            <br />
                            <code style={{
                                display: "block",
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "4px",
                                fontFamily: "monospace",
                                fontSize: "0.85em",
                                overflowX: "auto"
                            }}>
                                {"cd /path/to/your/photos && while IFS= read -r file; do rm \"$file\"; done < files-to-delete.txt"}
                            </code>
                            <br />
                            <strong>Windows (PowerShell):</strong>
                            <br />
                            <code style={{
                                display: "block",
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "4px",
                                fontFamily: "monospace",
                                fontSize: "0.85em",
                                overflowX: "auto"
                            }}>
                                {"Get-Content files-to-delete.txt | ForEach-Object { Remove-Item $_ -ErrorAction SilentlyContinue }"}
                            </code>
                            <br />
                            <em style={{ fontSize: "0.85em", opacity: 0.8 }}>
                                Note: Make sure the file paths in files-to-delete.txt are relative to your current directory, or use the full paths.
                            </em>
                        </p>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                            <button
                                onClick={() => setShowFileList(!showFileList)}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "0.85em",
                                    backgroundColor: "rgba(245, 158, 11, 0.3)",
                                    color: "#f59e0b",
                                    border: "1px solid #f59e0b",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                {showFileList ? "Hide" : "Show"} File List ({trashPhotos.length})
                            </button>
                            <button
                                onClick={handleCopyFileList}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "0.85em",
                                    backgroundColor: "rgba(245, 158, 11, 0.3)",
                                    color: "#f59e0b",
                                    border: "1px solid #f59e0b",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                📋 Copy List
                            </button>
                            <button
                                onClick={handleDownloadFileList}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "0.85em",
                                    backgroundColor: "rgba(245, 158, 11, 0.3)",
                                    color: "#f59e0b",
                                    border: "1px solid #f59e0b",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                💾 Download List
                            </button>
                            <button
                                onClick={handleDownloadDeleteScript}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "0.85em",
                                    backgroundColor: "rgba(245, 158, 11, 0.3)",
                                    color: "#f59e0b",
                                    border: "1px solid #f59e0b",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                🔧 Download Script
                            </button>
                        </div>
                        {showFileList && (
                            <div
                                style={{
                                    marginTop: "12px",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    borderRadius: "6px",
                                    padding: "12px",
                                    fontSize: "0.85em",
                                    fontFamily: "monospace",
                                    textAlign: "left",
                                }}
                            >
                                {trashPhotos.map((photo, idx) => (
                                    <div key={photo.id} style={{ marginBottom: "4px", wordBreak: "break-all" }}>
                                        {idx + 1}. {photo.relPath || photo.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Butonlar - Modern */}
                <div style={{ display: "flex", gap: `${LAYOUT.spacing.md}px`, justifyContent: "center", position: "relative", zIndex: 10 }}>
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        style={{
                            padding: "12px 28px",
                            fontSize: "1em",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: COLORS.text,
                            border: "2px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: `${LAYOUT.borderRadius.md}px`,
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            opacity: isDeleting ? 0.5 : 1,
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                            if (!isDeleting) {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isDeleting) {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                            }
                        }}
                    >
                        Cancel
                    </button>
                    {trashPhotos.length > 0 && (
                        <button
                            onClick={handleFinalize}
                            disabled={isDeleting || !fs}
                            style={{
                                padding: "12px 28px",
                                fontSize: "1em",
                                background: isDeleting || !fs
                                    ? "rgba(100, 100, 100, 0.5)"
                                    : `linear-gradient(135deg, ${COLORS.error} 0%, #dc2626 100%)`,
                                color: COLORS.text,
                                border: "none",
                                borderRadius: `${LAYOUT.borderRadius.md}px`,
                                cursor: isDeleting || !fs ? "not-allowed" : "pointer",
                                fontWeight: "600",
                                boxShadow: isDeleting || !fs ? "none" : "0 4px 20px rgba(239, 68, 68, 0.4)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!isDeleting && fs) {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(239, 68, 68, 0.5)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isDeleting && fs) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(239, 68, 68, 0.4)";
                                }
                            }}
                            title={!fs ? "File system access is required to delete photos. Please select a folder using File System Access API." : ""}
                        >
                            {isDeleting ? "⏳ Deleting..." : `🗑️ Delete ${trashPhotos.length} Photos`}
                        </button>
                    )}
                    {trashPhotos.length === 0 && (
                        <button
                            onClick={handleDone}
                            style={{
                                padding: "12px 28px",
                                fontSize: "1em",
                                background: `linear-gradient(135deg, ${COLORS.success} 0%, ${COLORS.info} 100%)`,
                                color: COLORS.text,
                                border: "none",
                                borderRadius: `${LAYOUT.borderRadius.md}px`,
                                cursor: "pointer",
                                fontWeight: "600",
                                boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 24px rgba(34, 197, 94, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.3)";
                            }}
                        >
                            ✨ Clean Up Now!
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: `${LAYOUT.spacing.sm}px`,
                    marginBottom: `${LAYOUT.spacing.lg}px`,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: `${LAYOUT.spacing.md}px`,
                        justifyContent: "center",
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

                {/* Info badge - double-click hint */}
                {activeTab !== "overview" && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: `${LAYOUT.spacing.xs}px`,
                            padding: `${LAYOUT.spacing.xs}px ${LAYOUT.spacing.md}px`,
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            backdropFilter: "blur(10px)",
                            border: `1px solid ${COLORS.info}40`,
                            borderRadius: `${LAYOUT.borderRadius.md}px`,
                            fontSize: "0.85em",
                            color: "rgba(255, 255, 255, 0.8)",
                            boxShadow: `0 2px 12px ${COLORS.info}20`,
                            animation: "fadeIn 0.4s ease-out",
                        }}
                    >
                        <span style={{ fontSize: "1.2em" }}>💡</span>
                        <span>
                            <strong>Tip:</strong> Double-click on any photo to change its decision
                        </span>
                    </div>
                )}
            </div>

            {/* Content Area - Modern */}
            <div
                style={{
                    flex: 1,
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    backdropFilter: "blur(10px)",
                    borderRadius: `${LAYOUT.borderRadius.lg}px`,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
            >
                {activeTab === "overview" ? (
                    // Overview: Statistics and warning
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
                                    <strong>{trashPhotos.length}</strong> photos will be deleted.
                                </p>
                                <p style={{ fontSize: "0.9em", opacity: 0.8 }}>
                                    This operation cannot be undone. Are you sure you want to continue?
                                </p>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "4em", marginBottom: "16px" }}>✨</div>
                                <p style={{ fontSize: "1.2em", opacity: 0.8 }}>
                                    No photos to delete. You've reviewed all photos!
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
                        allPhotos={photos}
                        onDecisionChange={(index: number, newDecision: Decision) => {
                            setDecision(index, newDecision);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

