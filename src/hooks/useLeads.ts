import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lead } from '../lib/types';
import { getErrorMessage } from '../lib/utils';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured. Skipping leads fetch.');
        setLoading(false);
        return;
      }

      try {
        // Removed lead_stages join to prevent errors if foreign key is missing
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (err) {
        const message = getErrorMessage(err);
        console.error('Error fetching leads:', message, err);
        setError(message);
        setLeads([]); // Fallback to empty state
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();

    if (!isSupabaseConfigured()) return;

    // Set up real-time subscription
    const subscription = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateLeadStage = useCallback(async (leadId: string, stageId: string) => {
    if (!isSupabaseConfigured()) return;

    // Optimistic update
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage_id: stageId } : lead
    ));
    
    try {
      await supabase.from('leads').update({ stage_id: stageId }).eq('id', leadId);
    } catch (err) {
      console.error('Error updating lead stage:', err);
      // We could revert state here if needed
    }
  }, []);

  return { leads, loading, error, updateLeadStage };
}