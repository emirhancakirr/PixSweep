/**
 * Application-wide constants
 * 
 * Centralizes magic numbers, colors, and configuration values
 * to maintain consistency and ease of maintenance.
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Decision colors
  keep: "#22c55e",
  trash: "#ef4444",
  skip: "#f59e0b",
  previous: "#3b82f6",
  
  // UI colors
  background: "#000",
  backgroundSecondary: "#0a0a0a",
  text: "#fff",
  textMuted: "rgba(255, 255, 255, 0.6)",
  
  // State colors
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  
  // Overlay colors
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  border: "rgba(255, 255, 255, 0.1)",
  borderHover: "rgba(255, 255, 255, 0.3)",
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: "ease-out",
    smooth: "ease-in-out",
  },
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const LAYOUT = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 40,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
} as const;

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

export const DUPLICATE_DETECTION = {
  // Similarity threshold (0-1, where 1 is identical)
  similarityThreshold: 0.9,
  
  // dHash configuration
  hashWidth: 9,
  hashHeight: 8,
  
  // Hamming distance threshold for similarity
  hammingThreshold: 10,
} as const;

// ============================================================================
// FILE SYSTEM
// ============================================================================

export const FILE_SYSTEM = {
  // Supported image extensions
  supportedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".heic",
    ".heif",
  ] as const,
  
  // Image regex pattern
  imagePattern: /\.(jpe?g|png|gif|webp|heic|heif)$/i,
} as const;

// ============================================================================
// UI COMPONENT SIZES
// ============================================================================

export const UI = {
  progressBar: {
    size: 100,
  },
  photoGrid: {
    defaultColumns: 5,
  },
  button: {
    padding: {
      sm: "8px 16px",
      md: "10px 20px",
      lg: "12px 24px",
    },
  },
} as const;

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD = {
  keep: "ArrowRight",
  trash: "ArrowLeft",
  skip: " ", // Space
  previous: "Backspace",
} as const;

