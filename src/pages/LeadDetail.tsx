import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Send, Phone, Mail } from 'lucide-react';
import { triggerWorkflow } from '../lib/n8n';

export const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, loading: messagesLoading } = useMessages(id || null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // In a real app, you'd fetch the specific lead details here via another hook
  // const { lead } = useLead(id);
  const mockLeadName = "Alice Johnson"; // Placeholder

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    
    setSending(true);
    // Trigger n8n workflow to send message (SMS/Email)
    const response = await triggerWorkflow('send-message-workflow', {
      leadId: id,
      content: newMessage,
      channel: 'email'
    });

    if (response.success) {
      console.log('Workflow triggered:', response.executionId);
      setNewMessage('');
      // In a real app, optimistic UI update or waiting for Supabase subscription
    } else {
      alert('Failed to send message: ' + response.error);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{mockLeadName}</h1>
        <div className="ml-auto flex gap-2">
           <Button variant="secondary" size="sm"><Phone size={16} className="mr-2"/> Call</Button>
           <Button variant="secondary" size="sm"><Mail size={16} className="mr-2"/> Email</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Lead Information">
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-500">Email</label>
                <div className="font-medium">alice@example.com</div>
              </div>
              <div>
                <label className="block text-gray-500">Phone</label>
                <div className="font-medium">+1 555 0101</div>
              </div>
              <div>
                <label className="block text-gray-500">Source</label>
                <div className="font-medium">Website</div>
              </div>
              <div>
                <label className="block text-gray-500">Stage</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  New Lead
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Messages/Activity */}
        <div className="lg:col-span-2">
          <Card title="Communication History" className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 bg-gray-50 rounded-md border border-gray-100">
              {messagesLoading ? (
                <div className="p-4 text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No messages yet.</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                        msg.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className={`text-xs block mt-1 opacity-70 ${msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-md border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Button disabled={sending} onClick={handleSendMessage}>
                {sending ? '...' : <Send size={18} />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
