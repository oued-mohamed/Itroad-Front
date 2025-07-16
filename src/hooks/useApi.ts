// ===== 1. useApi.ts - Foundation Hook =====
// src/hooks/useApi.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions<T> {
  immediate?: boolean;
onSuccess?: (data: T, ...args: any[]) => void;
  onError?: (error: any) => void;
  errorMessage?: string;
}

export function useApi<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  const execute = useCallback(async (...args: Args): Promise<T | undefined> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(...args);
      
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null });
        options.onSuccess?.(result);
      }
      
      return result;
    } catch (error: any) {
      if (isMountedRef.current) {
        const errorMessage = 
          options.errorMessage ||
          error.response?.data?.message || 
          error.message || 
          'An unexpected error occurred';
        
        setState({ data: null, loading: false, error: errorMessage });
        options.onError?.(error);
      }
      throw error;
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.data && !state.error,
    isSuccess: !state.loading && state.data !== null && !state.error,
    isError: !state.loading && state.error !== null,
  };
}