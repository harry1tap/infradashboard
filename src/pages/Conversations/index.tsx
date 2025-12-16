import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { cn, formatDuration } from '../../lib/utils';
import { Phone, MoreVertical, Search, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Lead } from '../../lib/types';

export const Conversations = () => {
  const [searchParams] = useSearchParams();
  const urlLeadId = searchParams.get('leadId');
  const { conversations, loading: listLoading } = useConversations();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  // Effect: Handle selection logic (URL param > first item)
  useEffect(() => {
    if (listLoading) return;

    if (urlLeadId) {
      // Logic to support deep linking even if the conversation isn't in the "Recent" list yet could be added here
      // For now, we assume it's in the list or we just select it if found
      setSelectedLeadId(urlLeadId);
    } else if (!selectedLeadId && conversations.length > 0) {
      setSelectedLeadId(conversations[0].lead.id);
    }
  }, [conversations, listLoading, urlLeadId, selectedLeadId]);

  // Find conversation logic. 
  // If deep linked lead isn't in recent conversations list, we might want to fetch it separately in a real app.
  // For this scope, we'll try to find it in the list.
  const selectedConversation = conversations.find(c => c.lead.id === selectedLeadId);

  // Fallback for visual display if we selected a lead ID but don't have the summary object 
  // (e.g. came from Leads table but no messages exchanged yet)
  // In a real app we'd fetch the lead details here.
  const displayChat = selectedLeadId && selectedConversation;

  return (
    <PageWrapper title="Conversations">
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Left Sidebar: Conversation List */}
        <div className="w-1/3 min-w-[300px] border-r border-gray-100 flex flex-col bg-gray-50/30">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
               <div className="p-4 space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                     <div className="flex-1 space-y-2">
                       <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                       <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                     </div>
                   </div>
                 ))}
               </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <MessageSquare size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conversations.map(({ lead, lastMessage, unread }) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 transition-colors relative group",
                      selectedLeadId === lead.id ? "bg-primary-50 hover:bg-primary-50" : "bg-white"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={cn("font-semibold text-sm", unread ? "text-gray-900" : "text-gray-700")}>
                        {lead.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {formatDuration(Date.now() - new Date(lastMessage.sent_at).getTime())}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "text-xs truncate max-w-[80%]",
                        unread ? "text-gray-800 font-medium" : "text-gray-500"
                      )}>
                        {lastMessage.direction === 'outbound' && <span className="text-gray-400 mr-1">You:</span>}
                        {lastMessage.content}
                      </p>
                      
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="flex-1 flex flex-col bg-white">
          {displayChat ? (
            <ChatWindow lead={selectedConversation!.lead} />
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <MessageSquare size={48} className="mb-4 text-gray-300" />
               <p>{selectedLeadId && !selectedConversation ? 'Loading conversation details...' : 'Select a conversation to start chatting'}</p>
             </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

// Sub-component for the chat area to isolate specific message logic
const ChatWindow = ({ lead }: { lead: Lead }) => {
  const { messages, loading } = useMessages(lead.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, loading]);

  return (
    <>
      {/* Chat Header */}
      <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm border-2 border-white ring-1 ring-gray-100">
            {lead.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{lead.name}</h2>
            <p className="text-xs text-gray-500">{lead.phone || lead.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
             <Phone size={18} />
           </Button>
           <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
             <MoreVertical size={18} />
           </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-white space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <p className="text-sm">No messages yet</p>
           </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.direction === 'outbound';
            return (
              <div 
                key={msg.id} 
                className={cn("flex w-full", isOutbound ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group",
                  isOutbound 
                    ? "bg-primary-600 text-white rounded-br-none" 
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                )}>
                  <p>{msg.content}</p>
                  <span className={cn(
                    "text-[10px] block mt-1 opacity-70",
                    isOutbound ? "text-primary-100 text-right" : "text-gray-400"
                  )}>
                    {new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};