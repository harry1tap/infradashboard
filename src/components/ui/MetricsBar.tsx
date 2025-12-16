import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight, Users, Clock, Zap, Calendar } from 'lucide-react';
import { Lead } from '../../lib/types';
import { Skeleton } from './Skeleton';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: any;
  color: string;
  loading?: boolean;
  warning?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendUp, icon: Icon, color, loading, warning }) => (
  <div className={cn(
    "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow",
    warning && "border-red-200 bg-red-50/30"
  )}>
    <div className="flex justify-between items-start mb-4">
      {loading ? (
        <Skeleton className="h-10 w-10 rounded-xl" />
      ) : (
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
           <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
      )}
      
      {loading ? (
        <Skeleton className="h-6 w-16 rounded-full" />
      ) : trend && (
        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="ml-1">{trend}</span>
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      {loading ? (
         <Skeleton className="h-8 w-24 mt-2" />
      ) : (
        <p className={cn("text-2xl font-bold text-gray-900 mt-1", warning && "text-red-600")}>{value}</p>
      )}
    </div>

    {/* Decorative background shape */}
    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gray-50 opacity-50 group-hover:scale-110 transition-transform"></div>
  </div>
);

export const MetricsBar = ({ leads }: { leads: Lead[] }) => {
  const isLoading = !leads; 
  
  const totalLeads = leads ? leads.length : 0;
  
  // Calculate Avg Response Time
  let totalResponse = 0;
  let countResponse = 0;
  if (leads) {
    leads.forEach(l => {
        if (l.response_time_seconds) {
        totalResponse += l.response_time_seconds;
        countResponse++;
        }
    });
  }
  const avgResponseSeconds = countResponse > 0 ? totalResponse / countResponse : 0;
  const avgResponseMinutes = Math.round(avgResponseSeconds / 60);
  
  const isResponseTimeHigh = avgResponseMinutes > 5;

  // Booked Appointments: leads where stage_id is '4' (Booked)
  const bookedLeads = leads ? leads.filter(l => l.stage_id === '4').length : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <MetricCard 
        title="Total Leads" 
        value={totalLeads.toString()} 
        trend="Active" 
        trendUp={true}
        icon={Users}
        color="bg-primary-500"
        loading={isLoading}
      />
      <MetricCard 
        title="Avg Response Time" 
        value={`${avgResponseMinutes}m`} 
        trend={isResponseTimeHigh ? "Needs Attention" : "Good"} 
        trendUp={!isResponseTimeHigh}
        icon={Clock}
        color={isResponseTimeHigh ? "bg-red-500" : "bg-blue-500"}
        loading={isLoading}
        warning={isResponseTimeHigh}
      />
      <MetricCard 
        title="Conversion Rate" 
        value={totalLeads > 0 ? `${Math.round((bookedLeads/totalLeads)*100)}%` : "0%"} 
        trend="On Track" 
        trendUp={true}
        icon={Zap}
        color="bg-orange-500"
        loading={isLoading}
      />
       <MetricCard 
        title="Booked Appointments" 
        value={bookedLeads.toString()} 
        trend="This Month" 
        trendUp={true}
        icon={Calendar}
        color="bg-emerald-600"
        loading={isLoading}
      />
    </div>
  );
};