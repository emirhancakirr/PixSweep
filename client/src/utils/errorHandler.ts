/**
 * Centralized error handling utilities
 * 
 * Provides consistent error handling and user-friendly error messages
 * across the application.
 */

/**
 * Application error types
 */
export enum ErrorType {
  FILE_SYSTEM_ACCESS = "FILE_SYSTEM_ACCESS",
  IMAGE_LOADING = "IMAGE_LOADING",
  DUPLICATE_DETECTION = "DUPLICATE_DETECTION",
  DELETION_FAILED = "DELETION_FAILED",
  HEIC_CONVERSION = "HEIC_CONVERSION",
  UNKNOWN = "UNKNOWN",
}

/**
 * Application error class with type information
 */
export class AppError extends Error {
  constructor(
    public readonly type: ErrorType,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Handle specific error names/types
    if (error.name === "AbortError") {
      return "Operation cancelled by user";
    }
    if (error.name === "NotAllowedError") {
      return "Permission denied. Please allow access to continue.";
    }
    if (error.message) {
      return error.message;
    }
  }

  return "An unexpected error occurred";
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : "[Error]";
  
  if (error instanceof AppError) {
    console.error(`${prefix} ${error.type}:`, error.message, error.originalError);
  } else if (error instanceof Error) {
    console.error(`${prefix}`, error.name, error.message, error);
  } else {
    console.error(`${prefix}`, error);
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  }) as T;
}

