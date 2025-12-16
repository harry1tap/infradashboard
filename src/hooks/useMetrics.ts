import { useEffect, useState } from 'react';
import { LeadMetrics, DateRange } from '../lib/types';
import { getLeadMetrics } from '../lib/queries';
import { useApp } from '../context/AppContext';

export const useMetrics = (dateRange: DateRange) => {
  const { clientId } = useApp();
  const [metrics, setMetrics] = useState<LeadMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await getLeadMetrics(clientId, dateRange);
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [clientId, dateRange]);

  return { metrics, loading, error };
};