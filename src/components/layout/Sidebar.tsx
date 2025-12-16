import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, BarChart2, Settings, HelpCircle, LogOut, X, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const location = useLocation();
  const { closeSidebar } = useApp();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavItem = ({ path, icon: Icon, label, count }: { path: string; icon: any; label: string; count?: number }) => (
    <Link
      to={path}
      onClick={closeSidebar}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group",
        isActive(path) 
          ? "text-primary-800 bg-white shadow-sm ring-1 ring-gray-100" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      <div className={clsx(
        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-opacity",
        isActive(path) ? "bg-primary-800 opacity-100" : "opacity-0"
      )} />
      
      <Icon size={20} className={isActive(path) ? "text-primary-800" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
      <span className="flex-1">{label}</span>
      {count && (
        <span className="bg-primary-800 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <div className="bg-gray-50/50 border-r border-gray-200 h-full flex flex-col p-6 w-full">
      <div className="h-10 flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            U
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Unorthodox AI</span>
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={closeSidebar} className="lg:hidden text-gray-400">
           <X size={24} />
        </button>
      </div>

      <div className="space-y-8 flex-1 overflow-y-auto">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</p>
          <div className="space-y-1">
            <NavItem path="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem path="/leads" icon={Users} label="Leads" count={12} />
            <NavItem path="/conversations" icon={MessageSquare} label="Conversations" />
            <NavItem path="/calendar" icon={Calendar} label="Calendar" />
            <NavItem path="/analytics" icon={BarChart2} label="Analytics" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">General</p>
          <div className="space-y-1">
            <NavItem path="/settings" icon={Settings} label="Settings" />
            <NavItem path="/help" icon={HelpCircle} label="Help" />
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto bg-primary-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg group cursor-pointer">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110 duration-500"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <p className="font-bold text-lg mb-1">Mobile App</p>
          <p className="text-primary-200 text-xs mb-4">Manage leads on the go</p>
          <button className="w-full py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Download
          </button>
        </div>
      </div>
    </div>
  );
};