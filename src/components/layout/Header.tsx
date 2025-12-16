import React, { useEffect, useRef } from 'react';
import { Search, Bell, Mail, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { toggleSidebar } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
          <p className="hidden md:block text-sm text-gray-500">Welcome back, Totok Michael</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search task" 
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-full text-sm border-none focus:ring-2 focus:ring-primary-500 w-48 lg:w-64 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500">⌘K</div>
        </div>

        <button className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-500">
           <Search size={20} />
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative hidden sm:block">
            <Mail size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-200">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-100 border-2 border-white shadow-sm flex items-center justify-center text-primary-700 font-bold text-xs md:text-sm">
               TM
             </div>
             <div className="hidden lg:block text-sm">
               <p className="font-semibold text-gray-900">Totok Michael</p>
               <p className="text-gray-400 text-xs">tmichael20@mail.com</p>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};
