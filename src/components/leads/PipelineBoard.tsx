import React from 'react';
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core';
import { Lead, LeadStage } from '../../lib/types';
import { LeadCard } from './LeadCard';
import { Plus, FolderOpen, AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/utils';

interface PipelineBoardProps {
  leads: Lead[];
  stages: LeadStage[];
  onLeadClick: (lead: Lead) => void;
  onLeadMove: (leadId: string, stageId: string) => void;
}

const DroppableColumn = ({ stage, leads, onLeadClick }: { stage: LeadStage, leads: Lead[], onLeadClick: any }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[280px] w-[85vw] md:w-[280px] bg-gray-50/50 rounded-2xl flex flex-col h-full border transition-colors",
        isOver ? "border-primary-300 bg-primary-50/20" : "border-transparent"
      )}
    >
      <div className="p-4 flex items-center justify-between sticky top-0 bg-gray-50/50 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">{stage.name}</span>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{leads.length}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full transition-colors">
          <Plus size={18} />
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {leads.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl m-1">
            <p className="text-xs text-gray-400">No leads</p>
          </div>
        )}
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
      </div>
    </div>
  );
};

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ leads, stages, onLeadClick, onLeadMove }) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id && over.id) {
      const lead = leads.find(l => l.id === active.id);
      if (lead && lead.stage_id !== over.id) {
        onLeadMove(lead.id, over.id as string);
      }
    }
    setActiveId(null);
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  // Handle case where stages are fetched but empty
  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
           <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Stages Found</h3>
        <p className="text-gray-500 max-w-md mt-2">
          Your pipeline stages haven't been set up yet. Add entries to the 'lead_stages' table in Supabase to see your board.
        </p>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 md:gap-6 h-full overflow-x-auto pb-4 snap-x snap-mandatory">
        {stages.map(stage => (
          <div key={stage.id} className="snap-center h-full">
            <DroppableColumn 
              stage={stage} 
              leads={leads.filter(l => l.stage_id === stage.id)}
              onLeadClick={onLeadClick}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="opacity-90 rotate-3 cursor-grabbing w-[280px]">
             <LeadCard lead={activeLead} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};