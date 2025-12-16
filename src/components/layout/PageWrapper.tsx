import React from 'react';
import { Header } from './Header';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, title }) => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title={title} />
      <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};