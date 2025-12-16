import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Settings = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const n8nUrl = import.meta.env.VITE_N8N_MCP_URL;
  
  const isSupabaseReady = supabaseUrl && !supabaseUrl.includes('placeholder');
  const isN8nReady = n8nUrl && !n8nUrl.includes('placeholder');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <Card title="System Connections">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-md">
            <div>
              <p className="font-medium">Supabase Database</p>
              <p className="text-sm text-gray-500">
                {isSupabaseReady ? 'Connected via env variables' : 'Not configured (using mock data)'}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${isSupabaseReady ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-md">
            <div>
              <p className="font-medium">n8n MCP Integration</p>
              <p className="text-sm text-gray-500">
                 {isN8nReady ? 'Endpoint configured' : 'Not configured'}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${isN8nReady ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </Card>

      <Card title="General Preferences">
        <div className="space-y-4">
           <p className="text-sm text-gray-600">These are placeholder settings for demonstration.</p>
           <Button variant="primary">Save Changes</Button>
        </div>
      </Card>
    </div>
  );
};