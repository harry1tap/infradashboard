import { WorkflowTriggerResponse } from './types';

const N8N_MCP_URL = import.meta.env.VITE_N8N_MCP_URL || '';
const N8N_MCP_TOKEN = import.meta.env.VITE_N8N_MCP_TOKEN || '';

export const isN8nConfigured = (): boolean => {
  return Boolean(
    N8N_MCP_URL && 
    N8N_MCP_TOKEN && 
    !N8N_MCP_URL.includes('placeholder') &&
    !N8N_MCP_URL.includes('example')
  );
};

/**
 * Helper to handle the actual fetch call
 */
const executeTrigger = async (workflowId: string, payload: any): Promise<WorkflowTriggerResponse> => {
  if (!isN8nConfigured()) {
    console.warn('N8N MCP URL is not configured. Simulating success.', { workflowId, payload });
    return { success: true, executionId: 'mock-execution-' + Date.now() };
  }

  try {
    const response = await fetch(`${N8N_MCP_URL}/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_MCP_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Workflow trigger failed with status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, executionId: data.executionId };
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const triggerWorkflow = async (
  workflowId: string,
  payload: Record<string, any>
): Promise<WorkflowTriggerResponse> => {
  return executeTrigger(workflowId, payload);
};

// --- Specific Actions ---

export const sendMessage = async (
  leadId: string, 
  channel: 'whatsapp' | 'sms' | 'email', 
  content: string
): Promise<WorkflowTriggerResponse> => {
  if (!isN8nConfigured()) {
    console.log('n8n not configured - would send message:', { leadId, channel, content });
    return { success: true, mock: true };
  }
  return executeTrigger('send-message-workflow', {
    leadId,
    channel,
    content,
    timestamp: new Date().toISOString()
  });
};

export const moveLeadStage = async (
  leadId: string, 
  newStageId: string
): Promise<WorkflowTriggerResponse> => {
  if (!isN8nConfigured()) {
    console.log('n8n not configured - would trigger moveLeadStage:', { leadId, newStageId });
    return { success: true, mock: true };
  }
  return executeTrigger('update-stage-workflow', {
    leadId,
    newStageId,
    timestamp: new Date().toISOString()
  });
};

export const triggerFollowUp = async (leadId: string): Promise<WorkflowTriggerResponse> => {
  return executeTrigger('trigger-followup-sequence', {
    leadId,
    action: 'start_sequence'
  });
};