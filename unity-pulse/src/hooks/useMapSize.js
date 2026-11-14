import { useState, useEffect, useCallback } from 'react';

export function useMapSize() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    player: { width: 52, height: 64}
  });

  useEffect(() => {
    function updateSize() {
      const baseWidth = 800;
      const baseHeight = 600;

      const scaleX = window.innerWidth / baseWidth;
      const scaleY = window.innerHeight / baseHeight;

      const scale = Math.max(0.6, Math.min(scaleX, scaleY, 1.5));

      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        scale,
        player: {
          width: 52 * scale,
          height: 64 * scale
        }
      });
    }

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ❗ ВАЖНО: координаты НЕ масштабируем
  // world coordinates остаются фиксированными (800x600)
  const scaleRect = useCallback((rect) => {
    return rect;
  }, []);

  // масштаб только для UI-значений (если понадобится)
  const scaleValue = useCallback((value) => {
    return value * dimensions.scale;
  }, [dimensions.scale]);

  return {
    ...dimensions,
    scaleRect,
    scaleValue
  };
}