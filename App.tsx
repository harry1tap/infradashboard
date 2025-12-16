import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './src/components/layout/Layout';
import { Dashboard } from './src/pages/Dashboard';
import { LeadDetail } from './src/pages/LeadDetail';
import { Settings } from './src/pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Navigate to="/" replace />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
