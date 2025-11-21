import type { CSSProperties } from "react";
import { COLORS, LAYOUT } from "../constants";

/**
 * Common style objects for consistent UI
 * 
 * Provides reusable style objects to maintain visual consistency
 * and reduce code duplication across components.
 */

// ============================================================================
// BUTTONS
// ============================================================================

export const buttonStyles = {
  base: {
    padding: "10px 20px",
    fontSize: "0.95em",
    fontWeight: "600" as const,
    border: "none",
    borderRadius: `${LAYOUT.borderRadius.md}px`,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  
  primary: {
    backgroundColor: COLORS.success,
    color: COLORS.text,
  },
  
  danger: {
    backgroundColor: COLORS.error,
    color: COLORS.text,
  },
  
  warning: {
    backgroundColor: COLORS.warning,
    color: COLORS.text,
  },
  
  secondary: {
    backgroundColor: "transparent",
    color: COLORS.text,
    border: `1px solid ${COLORS.borderHover}`,
  },
  
  disabled: {
    backgroundColor: "#666",
    cursor: "not-allowed",
    opacity: 0.5,
    pointerEvents: "none" as const,
  },
} as const;

// ============================================================================
// CONTAINERS
// ============================================================================

export const containerStyles = {
  fullScreen: {
    width: "100vw",
    height: "100vh",
    backgroundColor: COLORS.background,
    color: COLORS.text,
  } as CSSProperties,
  
  centered: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,
  
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: `${LAYOUT.borderRadius.lg}px`,
    border: `1px solid ${COLORS.border}`,
    padding: `${LAYOUT.spacing.xl}px`,
  } as CSSProperties,
} as const;

// ============================================================================
// ALERTS
// ============================================================================

export const alertStyles = {
  base: {
    borderRadius: `${LAYOUT.borderRadius.md}px`,
    padding: `${LAYOUT.spacing.md}px`,
    marginBottom: `${LAYOUT.spacing.lg}px`,
  } as CSSProperties,
  
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: `1px solid ${COLORS.error}`,
    color: COLORS.error,
  } as CSSProperties,
  
  warning: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    border: `1px solid ${COLORS.warning}`,
    color: COLORS.warning,
  } as CSSProperties,
  
  success: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    border: `1px solid ${COLORS.success}`,
    color: COLORS.success,
  } as CSSProperties,
  
  info: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    border: `1px solid ${COLORS.info}`,
    color: COLORS.info,
  } as CSSProperties,
} as const;

// ============================================================================
// TABS
// ============================================================================

export const getTabStyle = (isActive: boolean): CSSProperties => ({
  padding: "10px 20px",
  fontSize: "1em",
  fontWeight: "600",
  backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
  color: COLORS.text,
  border: isActive 
    ? `2px solid ${COLORS.borderHover}` 
    : `2px solid ${COLORS.border}`,
  borderRadius: `${LAYOUT.borderRadius.md}px`,
  cursor: "pointer",
  transition: "all 0.2s",
});

// ============================================================================
// CODE BLOCKS
// ============================================================================

export const codeStyles = {
  block: {
    display: "block",
    backgroundColor: COLORS.overlayLight,
    padding: `${LAYOUT.spacing.sm}px`,
    borderRadius: `${LAYOUT.borderRadius.sm}px`,
    marginTop: `${LAYOUT.spacing.xs}px`,
    fontFamily: "monospace",
    fontSize: "0.85em",
    overflowX: "auto" as const,
  } as CSSProperties,
  
  inline: {
    fontFamily: "monospace",
    fontSize: "0.85em",
    backgroundColor: COLORS.overlayLight,
    padding: "2px 6px",
    borderRadius: `${LAYOUT.borderRadius.sm}px`,
  } as CSSProperties,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Merge multiple style objects
 * Filters out undefined values and combines style objects
 */
export const mergeStyles = (...styles: (CSSProperties | undefined)[]): CSSProperties => {
  return styles
    .filter((style): style is CSSProperties => style !== undefined)
    .reduce((acc, style) => ({ ...acc, ...style }), {} as CSSProperties);
};

