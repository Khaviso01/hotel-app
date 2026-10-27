import { useEffect, useState } from 'react';
import { api, type Branch } from '../../lib/api';

// Custom hook for fetching administrative API data with built-in error handling and reload triggering.
export function useAdmin<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api<T>('/admin' + path)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [path, tick]);

  return { data, error, reload: () => setTick((v) => v + 1) };
}