import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Message } from '../lib/types';
import { getMessages } from '../lib/queries';

export const useMessages = (leadId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!leadId) {
      setMessages([]);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getMessages(leadId);
      setMessages(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchMessages();

    if (!leadId || !isSupabaseConfigured()) return;

    const subscription = supabase
      .channel(`messages:${leadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `lead_id=eq.${leadId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId, fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages };
};