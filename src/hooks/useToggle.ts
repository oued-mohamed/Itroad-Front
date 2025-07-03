// ===== 7. useToggle.ts - Toggle Hook =====
// src/hooks/useToggle.ts
import { useState, useCallback } from 'react';

export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value?: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setToggle = useCallback((newValue?: boolean) => {
    if (typeof newValue === 'boolean') {
      setValue(newValue);
    } else {
      setValue(prev => !prev);
    }
  }, []);

  return [value, toggle, setToggle];
}

// Enhanced toggle with multiple states
export function useMultiToggle<T extends string>(
  options: T[],
  initialValue?: T
): [T, (value: T) => void, () => void] {
  const [currentValue, setCurrentValue] = useState<T>(
    initialValue || options[0]
  );

  const setValue = useCallback((value: T) => {
    if (options.includes(value)) {
      setCurrentValue(value);
    }
  }, [options]);

  const nextValue = useCallback(() => {
    const currentIndex = options.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % options.length;
    setCurrentValue(options[nextIndex]);
  }, [options, currentValue]);

  return [currentValue, setValue, nextValue];
}

