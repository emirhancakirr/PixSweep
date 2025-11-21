/**
 * Kullanıcının fotoğraf hakkında verdiği karar
 */
export type Decision = "keep" | "trash" | "archive" | null;

/**
 * Fotoğraf indeksleri ile kararların eşleşmesi
 */
export type Decisions = Record<number, Decision>;

