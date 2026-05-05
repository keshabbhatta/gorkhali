import { useState, useCallback } from 'react';
import { callApi } from '../utils/api';
import { ProcessResult } from '../types';

export function useProcessing(imageData: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const process = useCallback(async (endpoint: string, params: Record<string, unknown> = {}) => {
    if (!imageData) return;
    setLoading(true);
    setError(null);
    try {
      const data = await callApi(endpoint, imageData, params) as ProcessResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed');
    } finally {
      setLoading(false);
    }
  }, [imageData]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, error, result, process, reset };
}
