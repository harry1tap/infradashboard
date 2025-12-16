import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lead } from '../lib/types';

interface AppContextType {
  clientId: string;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // Hardcoded for now, normally would come from Auth provider
  const [clientId] = useState('demo-client-id-123');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile, layout handles desktop

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AppContext.Provider 
      value={{ 
        clientId, 
        selectedLead, 
        setSelectedLead,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};