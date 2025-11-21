import type { Photo, Decisions } from "../../types";

export interface NavigationState {
  index: number;
  photos: Photo[];
  decisions: Decisions;
  tourCompleted: boolean;
}

export interface NavigationResult {
  newIndex?: number;
  tourCompleted?: boolean;
  readyToFinalize?: boolean;
}

/**
 * Navigation Service for Photo Review
 * 
 * Handles the logic for moving between photos during review process.
 * Implements a two-phase review strategy:
 * 1. First tour: Review all photos sequentially
 * 2. Second tour: Jump to undecided photos only
 * 
 * Separated from store to maintain loose coupling and high cohesion.
 * This service is stateless and operates purely on the provided state.
 */
export class NavigationService {
  /**
   * Calculate the next photo index based on review state
   * 
   * Strategy:
   * 1. If first tour not completed: move to next photo
   * 2. If at last photo and first tour not completed: mark tour as completed
   * 3. If tour completed: jump to next undecided photo
   * 4. If all photos reviewed: mark ready to finalize
   */
  static calculateNext(state: NavigationState): NavigationResult {
    const { index, photos, decisions, tourCompleted } = state;

    // Case 2: At last photo, first tour not completed
    // Mark tour as completed, stay on current photo
    if (index === photos.length - 1 && !tourCompleted) {
      return { tourCompleted: true };
    }

    // Case 1: Normal navigation during first tour
    if (index < photos.length && !tourCompleted) {
      return { newIndex: index + 1 };
    }

    // Case 3: First tour completed, find next undecided photo
    if (tourCompleted) {
      const undecidedIndices = this.findUndecidedIndices(photos, decisions);

      if (undecidedIndices.length > 0) {
        return { newIndex: undecidedIndices[0] };
      } else {
        // Case 4: All photos reviewed
        return { readyToFinalize: true };
      }
    }

    return {};
  }

  /**
   * Find indices of photos that haven't been decided (keep/trash)
   */
  static findUndecidedIndices(
    photos: Photo[],
    decisions: Decisions
  ): number[] {
    return photos
      .map((_, i) => i)
      .filter((i) => {
        const decision = decisions[i];
        // Find photos that are null or not keep/trash (e.g., archive)
        return !decision || (decision !== "keep" && decision !== "trash");
      });
  }

  /**
   * Calculate previous photo index
   */
  static calculatePrev(currentIndex: number): number | null {
    if (currentIndex > 0) {
      return currentIndex - 1;
    }
    return null;
  }
}

