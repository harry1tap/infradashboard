import React, { useState, useEffect, useRef } from 'react';
import { Lead } from '../../lib/types';
import { X, Phone, Mail, Send, Calendar, Tag, User, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMessages } from '../../hooks/useMessages';
import { triggerWorkflow } from '../../lib/n8n';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/utils';

interface LeadDetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  isOpen: boolean;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ lead, onClose, isOpen }) => {
  const { messages, loading: messagesLoading } = useMessages(lead?.id || null);
  const { addToast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    setSending(true);
    try {
      const result = await triggerWorkflow('send-message-workflow', {
          leadId: lead.id,
          content: messageText,
          channel: 'email'
      });
      
      if (result.success) {
         addToast('Message sent successfully', 'success');
         setMessageText('');
         // Optimistic update would go here if we were managing local state fully manually
      } else {
         addToast('Failed to send message', 'error');
      }
    } catch (e) {
      addToast('Error sending message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />
      
      <div className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform border-l border-gray-100 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="h-16 md:h-20 px-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="md:hidden p-2 -ml-2 text-gray-500">
               <ArrowLeft size={20} />
             </button>
             <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate max-w-[200px]">{lead.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Online</span>
                </div>
             </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
              <MoreVertical size={20} />
            </button>
            <button onClick={onClose} className="hidden md:block p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Contact Info Grid */}
          <div className="p-4 md:p-6 grid grid-cols-2 gap-4 border-b border-gray-100 bg-white">
             <div className="space-y-1">
               <label className="text-xs text-gray-400 font-medium uppercase">Phone</label>
               <div className="flex items-center gap-2 text-gray-700 text-sm">
                 <Phone size={14} className="text-primary-600 shrink-0" />
                 {lead.phone || 'No phone'}
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-400 font-medium uppercase">Email</label>
               <div className="flex items-center gap-2 text-gray-700 text-sm overflow-hidden" title={lead.email || ''}>
                 <Mail size={14} className="text-primary-600 shrink-0" />
                 <span className="truncate">{lead.email || 'No email'}</span>
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-400 font-medium uppercase">Source</label>
               <div className="flex items-center gap-2 text-gray-700 text-sm">
                 <Tag size={14} className="text-primary-600 shrink-0" />
                 {lead.source}
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-400 font-medium uppercase">Created</label>
               <div className="flex items-center gap-2 text-gray-700 text-sm">
                 <Calendar size={14} className="text-primary-600 shrink-0" />
                 {new Date(lead.created_at).toLocaleDateString()}
               </div>
             </div>
          </div>

          {/* Activity/Messages Feed */}
          <div className="p-4 md:p-6 bg-gray-50 min-h-[400px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Activity Timeline</h3>
            
            <div className="space-y-4 flex-1">
               {messagesLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-3/4 rounded-xl rounded-tl-none" />
                    <Skeleton className="h-16 w-3/4 rounded-xl rounded-tr-none ml-auto" />
                    <Skeleton className="h-16 w-1/2 rounded-xl rounded-tl-none" />
                  </div>
               )}
               
               {!messagesLoading && messages.length === 0 && (
                 <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                   <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3 text-gray-400">
                     <Mail size={20} />
                   </div>
                   <p className="text-gray-900 font-medium text-sm">No conversation yet</p>
                   <p className="text-gray-500 text-xs mt-1">Start the chat to convert this lead!</p>
                 </div>
               )}

               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                     msg.direction === 'outbound' 
                       ? 'bg-primary-600 text-white rounded-tr-sm' 
                       : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                   }`}>
                     <p>{msg.content}</p>
                     <p className={`text-[10px] mt-1 text-right ${msg.direction === 'outbound' ? 'text-primary-200' : 'text-gray-400'}`}>
                       {new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
          <div className="relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message... (Enter to send)"
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-xl resize-none focus:ring-2 focus:ring-primary-500 text-sm h-24 disabled:opacity-50"
              disabled={sending}
            />
            <div className="absolute right-2 bottom-2">
              <Button 
                size="sm" 
                onClick={handleSendMessage} 
                disabled={sending || !messageText.trim()} 
                className={cn("rounded-lg h-8 w-8 p-0 flex items-center justify-center", sending && "opacity-70")}
              >
                 {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
