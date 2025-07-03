// ===== 9. usePrevious.ts - Previous Value Hook =====
// src/hooks/usePrevious.ts
import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Enhanced version with comparison function
export function usePreviousWithComparison<T>(
  value: T,
  compare?: (prev: T | undefined, current: T) => boolean
): T | undefined {
  const ref = useRef<T>();
  const shouldUpdate = compare ? compare(ref.current, value) : true;
  
  useEffect(() => {
    if (shouldUpdate) {
      ref.current = value;
    }
  });
  
  return ref.current;
}

