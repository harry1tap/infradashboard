import React from 'react';
import { useLeads } from '../hooks/useLeads';
import { useLeadStages } from '../hooks/useLeadStages';
import { useApp } from '../context/AppContext';
import { MetricsBar } from '../components/ui/MetricsBar';
import { PipelineBoard } from '../components/leads/PipelineBoard';
import { LeadDetailPanel } from '../components/leads/LeadDetailPanel';
import { PageWrapper } from '../components/layout/PageWrapper';
import { moveLeadStage } from '../lib/n8n';

export const Dashboard = () => {
  const { leads, loading: leadsLoading, updateLeadStage } = useLeads();
  const { stages, loading: stagesLoading } = useLeadStages();
  const { selectedLead, setSelectedLead } = useApp();

  if (leadsLoading || stagesLoading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageWrapper>
    );
  }

  const handleLeadMove = (leadId: string, stageId: string) => {
    // 1. Update local UI and DB
    updateLeadStage(leadId, stageId);
    
    // 2. Trigger workflow automation for stage change
    moveLeadStage(leadId, stageId);
  };

  return (
    <PageWrapper title="Dashboard">
      <div className="flex flex-col h-full">
        {/* Top Metrics Area */}
        <MetricsBar leads={leads} />

        {/* Pipeline Area */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-gray-900">Project Pipeline</h2>
             <button className="text-primary-600 text-sm font-medium hover:text-primary-700">View All</button>
          </div>
          <div className="h-[600px]">
            <PipelineBoard 
              leads={leads} 
              stages={stages} 
              onLeadClick={setSelectedLead}
              onLeadMove={handleLeadMove}
            />
          </div>
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      <LeadDetailPanel 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </PageWrapper>
  );
};