// ===== 8. useClickOutside.ts - Click Outside Hook =====
// src/hooks/useClickOutside.ts
import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Use capture phase to ensure we catch the event before other handlers
    document.addEventListener('mousedown', handleClick, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [callback, enabled]);

  return ref;
}

// Enhanced version with multiple refs
export function useClickOutsideMultiple(
  callback: () => void,
  enabled: boolean = true
) {
  const refs = useRef<(HTMLElement | null)[]>([]);

  const addRef = useCallback((element: HTMLElement | null) => {
    if (element && !refs.current.includes(element)) {
      refs.current.push(element);
    }
  }, []);

  const removeRef = useCallback((element: HTMLElement | null) => {
    refs.current = refs.current.filter(ref => ref !== element);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const clickedInsideAnyRef = refs.current.some(ref => 
        ref && ref.contains(event.target as Node)
      );

      if (!clickedInsideAnyRef) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [callback, enabled]);

  return { addRef, removeRef };
}

