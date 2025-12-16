import React, { useEffect, useState } from 'react';
import { Lead } from '../../lib/types';
import { Phone, Mail, Clock, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useDraggable } from '@dnd-kit/core';
import { cn, getResponseTimeStatus, formatDuration } from '../../lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const [elapsed, setElapsed] = useState<number>(0);
  const isNew = !lead.last_contact;

  // Real-time timer for new leads
  useEffect(() => {
    if (!isNew) return;
    
    const updateTimer = () => {
      const diff = Date.now() - new Date(lead.created_at).getTime();
      setElapsed(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lead.created_at, isNew]);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  // Status calculations
  const createdDate = new Date(lead.created_at);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - createdDate.getTime()) / 60000);
  
  let timeDisplay = '';
  if (diffInMinutes < 60) timeDisplay = `${diffInMinutes}m ago`;
  else if (diffInMinutes < 1440) timeDisplay = `${Math.floor(diffInMinutes / 60)}h ago`;
  else timeDisplay = `${Math.floor(diffInMinutes / 1440)}d ago`;

  const responseStatus = getResponseTimeStatus(lead.created_at, lead.last_contact);
  const isRecentlyCreated = diffInMinutes < 5; // For "New" badge animation

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all cursor-grab active:cursor-grabbing mb-3 group relative overflow-hidden",
        isDragging && "shadow-xl rotate-3 opacity-90",
        !isDragging && "hover:shadow-md hover:border-primary-100",
        isRecentlyCreated && "animate-pulse-subtle ring-2 ring-primary-100 ring-offset-2"
      )}
      onClick={() => onClick(lead)}
    >
      {isRecentlyCreated && (
        <div className="absolute top-0 right-0">
          <span className="relative flex h-3 w-3 -mt-1 -mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <Badge variant="default" className="capitalize text-[10px] font-semibold tracking-wide">
          {lead.source}
        </Badge>
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h4 className="font-semibold text-gray-900 mb-1 leading-tight">{lead.name}</h4>
      <p className="text-gray-500 text-xs mb-3 truncate">{lead.email}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex -space-x-2">
           <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-700 font-bold border-2 border-white ring-1 ring-gray-100">
             {lead.name.charAt(0)}
           </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isNew && elapsed > 0 ? (
            <Badge 
              variant={responseStatus === 'critical' ? 'error' : responseStatus === 'warning' ? 'warning' : 'success'}
              className="px-1.5 py-0 text-[10px] flex items-center gap-1"
            >
              <Clock size={10} />
              {formatDuration(elapsed)}
            </Badge>
          ) : (
             <div className="flex items-center text-xs text-gray-400 gap-1">
               <Clock size={12} />
               <span>{timeDisplay}</span>
             </div>
          )}
          
          {/* Response Time Indicator Dot */}
          {isNew && (
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                responseStatus === 'fresh' && "bg-green-500",
                responseStatus === 'warning' && "bg-yellow-500 animate-pulse",
                responseStatus === 'critical' && "bg-red-500 animate-bounce"
              )} 
              title="Response time status"
            />
          )}
        </div>
      </div>
    </div>
  );
};
