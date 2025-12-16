import { supabase, isSupabaseConfigured } from './supabase';
import { Lead, Message, LeadStage, LeadMetrics, DateRange } from './types';
import { getErrorMessage } from './utils';

// --- LEADS ---

export const getLeads = async (clientId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*') // Removed join
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getLeads:', getErrorMessage(error));
    throw error;
  }
};

export const getLeadById = async (leadId: string): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*') // Removed join
      .eq('id', leadId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error in getLeadById (${leadId}):`, getErrorMessage(error));
    throw error;
  }
};

export const createLead = async (lead: Partial<Lead>): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createLead:', getErrorMessage(error));
    throw error;
  }
};

export const updateLead = async (leadId: string, updates: Partial<Lead>): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error in updateLead (${leadId}):`, getErrorMessage(error));
    throw error;
  }
};

export const updateLeadStage = async (leadId: string, stageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ stage_id: stageId })
      .eq('id', leadId);

    if (error) throw error;
  } catch (error) {
    console.error(`Error in updateLeadStage (${leadId} -> ${stageId}):`, getErrorMessage(error));
    throw error;
  }
};

// --- MESSAGES ---

export const getMessages = async (leadId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error in getMessages (${leadId}):`, getErrorMessage(error));
    throw error;
  }
};

export const createMessage = async (message: Partial<Message>): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createMessage:', getErrorMessage(error));
    throw error;
  }
};

// --- STAGES ---

export const getStages = async (): Promise<LeadStage[]> => {
  try {
    const { data, error } = await supabase
      .from('lead_stages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getStages:', getErrorMessage(error));
    throw error;
  }
};

// --- METRICS ---

export const getLeadMetrics = async (clientId: string, dateRange: DateRange): Promise<LeadMetrics> => {
  const defaultMetrics = {
    totalLeads: 0,
    leadsBySource: {},
    leadsByStage: {},
    avgResponseTime: 0,
    conversionRate: 0
  };

  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('source, stage_id, response_time_seconds')
      .eq('client_id', clientId)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    if (error) throw error;
    if (!leads || leads.length === 0) return defaultMetrics;

    const totalLeads = leads.length;
    const leadsBySource: Record<string, number> = {};
    const leadsByStage: Record<string, number> = {};
    let totalResponseTime = 0;
    let responseCount = 0;
    let closedCount = 0;

    leads.forEach(lead => {
      // Source count
      const source = lead.source || 'Unknown';
      leadsBySource[source] = (leadsBySource[source] || 0) + 1;
      
      // Stage count
      leadsByStage[lead.stage_id] = (leadsByStage[lead.stage_id] || 0) + 1;

      // Response Time
      if (lead.response_time_seconds) {
        totalResponseTime += lead.response_time_seconds;
        responseCount++;
      }

      // Conversion
      if (lead.stage_id === 'closed' || lead.stage_id === '4') {
        closedCount++;
      }
    });

    return {
      totalLeads,
      leadsBySource,
      leadsByStage,
      avgResponseTime: responseCount > 0 ? Math.floor(totalResponseTime / responseCount) : 0,
      conversionRate: totalLeads > 0 ? Math.floor((closedCount / totalLeads) * 100) : 0
    };

  } catch (error) {
    console.error('Error in getLeadMetrics:', getErrorMessage(error));
    return defaultMetrics;
  }
};

// --- CONVERSATIONS HELPER ---

export interface ConversationSummary {
  lead: Lead;
  lastMessage: Message;
  unread: boolean;
}

export const getRecentConversations = async (): Promise<ConversationSummary[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    // 1. Fetch all messages (optimization: limit by date if needed)
    // We order by sent_at desc to find latest messages easily
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: false });

    if (msgError) throw msgError;
    if (!messages || messages.length === 0) return [];

    // 2. Group by lead_id to find latest message per lead
    const latestMessagesMap = new Map<string, Message>();
    const leadIds = new Set<string>();

    messages.forEach(msg => {
      if (!latestMessagesMap.has(msg.lead_id)) {
        latestMessagesMap.set(msg.lead_id, msg);
        leadIds.add(msg.lead_id);
      }
    });

    // 3. Fetch Lead details for these conversations
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .in('id', Array.from(leadIds));

    if (leadError) throw leadError;
    if (!leads) return [];

    // 4. Combine and format
    const summaries: ConversationSummary[] = [];
    
    leads.forEach(lead => {
      const lastMsg = latestMessagesMap.get(lead.id);
      if (lastMsg) {
        summaries.push({
          lead,
          lastMessage: lastMsg,
          // Simple unread logic: if last message is inbound, it's unread
          unread: lastMsg.direction === 'inbound'
        });
      }
    });

    // Sort by last message time (most recent first)
    return summaries.sort((a, b) => 
      new Date(b.lastMessage.sent_at).getTime() - new Date(a.lastMessage.sent_at).getTime()
    );

  } catch (error) {
    console.error('Error in getRecentConversations:', getErrorMessage(error));
    return [];
  }
};