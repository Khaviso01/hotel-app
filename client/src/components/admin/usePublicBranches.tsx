import { useEffect, useState } from 'react';
import { api, type Branch } from '../../lib/api';

// Custom hook for fetching public hotel branch listings with automatic error suppression.
export function usePublicBranches() {
  const [data, setData] = useState<Branch[]>([]);

  useEffect(() => {
    api<Branch[]>('/branches')
      .then(setData)
      .catch(() => {});
  }, []);

  return { data };
}