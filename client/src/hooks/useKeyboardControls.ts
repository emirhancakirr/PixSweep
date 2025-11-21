import { useState, useEffect } from "react";
import type { AnimationDirection, Decision } from "../types";
import { KEYBOARD, ANIMATION } from "../constants";

interface UseKeyboardControlsOptions {
  index: number;
  onDecision: (index: number, decision: Decision) => void;
  onNext: () => void;
  onPrev?: () => void; // Optional: previous photo navigation
  animationDuration?: number; // ms
}

interface UseKeyboardControlsReturn {
  animationDirection: AnimationDirection;
}

/**
 * Klavye kontrolleri için custom hook
 * 
 * Kullanım:
 * - ArrowRight: Keep (sağa kayma)
 * - ArrowLeft: Trash (sola kayma)
 * - Space: Skip (yukarı kayma)
 * - Backspace: Previous photo (önceki fotoğrafa git)
 * 
 * @param options - Hook parametreleri
 * @returns animationDirection state'i
 */
export function useKeyboardControls({
  index,
  onDecision,
  onNext,
  onPrev,
  animationDuration = ANIMATION.duration.normal,
}: UseKeyboardControlsOptions): UseKeyboardControlsReturn {
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KEYBOARD.keep) {
        // Sağ ok: Fotoğrafı TUT (keep)
        setAnimationDirection("right");
        onDecision(index, "keep");

        // Animasyon bitince sonraki fotoğrafa geç
        setTimeout(() => {
          onNext();
          setAnimationDirection(null);
        }, animationDuration);
      } else if (event.key === KEYBOARD.trash) {
        // Sol ok: Fotoğrafı SİL (trash)
        setAnimationDirection("left");
        onDecision(index, "trash");

        // Animasyon bitince sonraki fotoğrafa geç
        setTimeout(() => {
          onNext();
          setAnimationDirection(null);
        }, animationDuration);
      } else if (event.key === KEYBOARD.skip || event.key === "Space") {
        // Boşluk: Fotoğrafı ATLA (skip) - yukarı animasyon
        event.preventDefault(); // Sayfa scroll'unu engelle
        setAnimationDirection("up");
        onDecision(index, null);

        // Animasyon bitince sonraki fotoğrafa geç
        setTimeout(() => {
          onNext();
          setAnimationDirection(null);
        }, animationDuration);
      } else if (event.key === KEYBOARD.previous && onPrev) {
        // Backspace: Önceki fotoğrafa git
        event.preventDefault(); // Sayfa scroll'unu engelle
        onPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, onDecision, onNext, onPrev, animationDuration]);

  return { animationDirection };
}

