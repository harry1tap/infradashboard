import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export const Layout = () => {
  const { isSidebarOpen, closeSidebar } = useApp();

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <div className="flex-1 flex flex-col overflow-hidden relative">
           <Outlet />
        </div>
      </div>
    </div>
  );
};