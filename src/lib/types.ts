export interface Lead {
  id: string;
  client_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  stage_id: string;
  created_at: string;
  last_contact: string | null;
  response_time_seconds: number | null;
  notes: string | null;
  // Joined fields
  lead_stages?: {
    name: string;
  };
}

export interface Message {
  id: string;
  lead_id: string;
  direction: 'inbound' | 'outbound';
  channel: 'sms' | 'email' | 'whatsapp';
  content: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface LeadStage {
  id: string;
  name: string;
  sort_order: number;
}

export interface WorkflowTriggerResponse {
  success: boolean;
  executionId?: string;
  error?: string;
  mock?: boolean;
}

export interface LeadMetrics {
  totalLeads: number;
  leadsBySource: Record<string, number>;
  leadsByStage: Record<string, number>;
  avgResponseTime: number; // in seconds
  conversionRate: number; // percentage 0-100
}

export interface DateRange {
  from: Date;
  to: Date;
}