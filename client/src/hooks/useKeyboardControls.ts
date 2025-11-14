import { useState, useEffect } from "react";
import type { AnimationDirection, Decision } from "../types";

interface UseKeyboardControlsOptions {
  index: number;
  onDecision: (index: number, decision: Decision) => void;
  onNext: () => void;
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
 * 
 * @param options - Hook parametreleri
 * @returns animationDirection state'i
 */
export function useKeyboardControls({
  index,
  onDecision,
  onNext,
  animationDuration = 300,
}: UseKeyboardControlsOptions): UseKeyboardControlsReturn {
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        // Sağ ok: Fotoğrafı TUT (keep)
        setAnimationDirection("right");
        onDecision(index, "keep");

        // Animasyon bitince sonraki fotoğrafa geç
        setTimeout(() => {
          onNext();
          setAnimationDirection(null);
        }, animationDuration);
      } else if (event.key === "ArrowLeft") {
        // Sol ok: Fotoğrafı SİL (trash)
        setAnimationDirection("left");
        onDecision(index, "trash");

        // Animasyon bitince sonraki fotoğrafa geç
        setTimeout(() => {
          onNext();
          setAnimationDirection(null);
        }, animationDuration);
      } else if (event.key === " " || event.key === "Space") {
        // Boşluk: Fotoğrafı ATLA (skip) - yukarı animasyon
        event.preventDefault(); // Sayfa scroll'unu engelle
        setAnimationDirection("up");
        onDecision(index, null);

        // Animasyon bitince sonraki fotoğrafa geç
        setTimeout(() => {
          onNext();
          setAnimationDirection(null);
        }, animationDuration);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, onDecision, onNext, animationDuration]);

  return { animationDirection };
}

