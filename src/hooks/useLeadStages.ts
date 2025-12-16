import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LeadStage } from '../lib/types';
import { getErrorMessage } from '../lib/utils';

export function useLeadStages() {
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStages() {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured. Skipping stages fetch.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('lead_stages')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setStages(data || []);
      } catch (err) {
        const message = getErrorMessage(err);
        console.error('Error fetching stages:', message, err);
        setError(message);
        setStages([]); // Fallback to empty
      } finally {
        setLoading(false);
      }
    }

    fetchStages();
  }, []);

  return { stages, loading, error };
}