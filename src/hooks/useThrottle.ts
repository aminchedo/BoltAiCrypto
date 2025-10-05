import { useRef, useCallback } from 'react';

/**
 * Throttle hook to limit function execution rate
 * Useful for scroll handlers and real-time updates
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastRun = useRef(Date.now());

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;

  return throttledFn;
}
