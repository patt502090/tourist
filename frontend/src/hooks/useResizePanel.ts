import React, { useCallback, useEffect, useState } from 'react';
interface SizeState {
  width: number;
  height: number;
}
export default function useResizePanel({
  initialSize,
  containerRef,
  resizeHandler,
}: {
  initialSize: { width: number; height: number };
  containerRef: React.RefObject<HTMLDivElement>;
  resizeHandler: (e: any) => SizeState | null;
}) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [sizes, setSizes] = useState<SizeState>({ width: initialSize.width, height: initialSize.height });

  const startDragging = useCallback((e: any) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback(
    (e: any) => {
      if (!isDragging || !containerRef.current) {
        return;
      }
      const caluclatedSizes = resizeHandler(e);
      if (caluclatedSizes) {
        setSizes({
          width: caluclatedSizes.width,
          height: caluclatedSizes.height,
        });
      }
    },
    [isDragging]
  );
  useEffect(() => {
    const handleMouseMove = (e: any) => {
      resize(e);
    };

    const handleMouseUp = () => {
      stopDragging();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resize, stopDragging]);

  return {
    sizes,
    startDragging,
  };
}
