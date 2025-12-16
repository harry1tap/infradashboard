import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { LeadDetail } from './pages/LeadDetail';
import { Leads } from './pages/Leads';
import { Conversations } from './pages/Conversations';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Route>
        </Routes>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;