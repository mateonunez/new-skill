import { useCallback, useState } from 'react';

interface UseListNavigationOptions {
  /** Wrap cursor at boundaries (default: false). */
  wrap?: boolean;
}

interface UseListNavigationReturn {
  cursor: number;
  setCursor: (idx: number) => void;
  moveUp: () => void;
  moveDown: () => void;
}

/**
 * Manages a cursor position over a list of `length` items,
 * replacing repetitive `setCursor((c) => Math.max(0, c - 1))` blocks.
 */
export function useListNavigation(
  length: number,
  { wrap = false }: UseListNavigationOptions = {},
): UseListNavigationReturn {
  const [cursor, setCursorRaw] = useState(0);

  const setCursor = useCallback(
    (idx: number) => {
      setCursorRaw(Math.max(0, Math.min(length - 1, idx)));
    },
    [length],
  );

  const moveUp = useCallback(() => {
    setCursorRaw((c) => {
      if (c <= 0) return wrap ? length - 1 : 0;
      return c - 1;
    });
  }, [length, wrap]);

  const moveDown = useCallback(() => {
    setCursorRaw((c) => {
      if (c >= length - 1) return wrap ? 0 : length - 1;
      return c + 1;
    });
  }, [length, wrap]);

  return { cursor, setCursor, moveUp, moveDown };
}
