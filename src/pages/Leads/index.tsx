import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../hooks/useLeads';
import { useLeadStages } from '../../hooks/useLeadStages';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Lead } from '../../lib/types';
import { Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, Calendar, ArrowRight } from 'lucide-react';
import { cn, formatDuration } from '../../lib/utils';

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: keyof Lead | 'stage_name' | 'response_status';
  direction: SortDirection;
}

export const Leads = () => {
  const navigate = useNavigate();
  const { leads, loading: leadsLoading } = useLeads();
  const { stages } = useLeadStages();
  
  // State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageId, setSelectedStageId] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // State for Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });

  // Unique Sources for Dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set(leads.map(l => l.source));
    return Array.from(sources).sort();
  }, [leads]);

  // Handle Sort Click
  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filter and Sort Data
  const processedLeads = useMemo(() => {
    let filtered = [...leads];

    // 1. Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(q) || 
        (l.email && l.email.toLowerCase().includes(q)) || 
        (l.phone && l.phone.includes(q))
      );
    }

    // 2. Stage Filter
    if (selectedStageId !== 'all') {
      filtered = filtered.filter(l => l.stage_id === selectedStageId);
    }

    // 3. Source Filter
    if (selectedSource !== 'all') {
      filtered = filtered.filter(l => l.source === selectedSource);
    }

    // 4. Date Filter
    if (dateFrom) {
      filtered = filtered.filter(l => new Date(l.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      // Add one day to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      filtered = filtered.filter(l => new Date(l.created_at) < endDate);
    }

    // 5. Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Lead];
      let bValue: any = b[sortConfig.key as keyof Lead];

      // Custom Sort Keys
      if (sortConfig.key === 'stage_name') {
        const stageA = stages.find(s => s.id === a.stage_id);
        const stageB = stages.find(s => s.id === b.stage_id);
        aValue = stageA?.sort_order || 0;
        bValue = stageB?.sort_order || 0;
      } else if (sortConfig.key === 'response_status') {
         aValue = a.response_time_seconds || 999999;
         bValue = b.response_time_seconds || 999999;
      }

      // Handle nulls
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';

      // Date comparison
      if (sortConfig.key === 'created_at' || sortConfig.key === 'last_contact') {
         aValue = new Date(aValue).getTime();
         bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, searchQuery, selectedStageId, selectedSource, dateFrom, dateTo, sortConfig, stages]);

  // Helper to render sort icon
  const SortIcon = ({ columnKey }: { columnKey: SortConfig['key'] }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-gray-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-primary-600 ml-1" />
      : <ChevronDown size={14} className="text-primary-600 ml-1" />;
  };

  const getStageName = (id: string) => {
    const stage = stages.find(s => s.id === id);
    return stage ? stage.name : 'Unknown';
  };

  const getResponseTimeBadge = (seconds: number | null) => {
    if (!seconds) return <span className="text-gray-400 text-xs">-</span>;
    
    let color = 'bg-gray-100 text-gray-600';
    if (seconds < 60) color = 'bg-green-100 text-green-700';
    else if (seconds < 300) color = 'bg-yellow-100 text-yellow-700'; // < 5 mins
    else color = 'bg-red-100 text-red-700';

    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", color)}>
        {formatDuration(seconds * 1000)}
      </span>
    );
  };

  const handleRowClick = (leadId: string) => {
    navigate(`/conversations?leadId=${leadId}`);
  };

  return (
    <PageWrapper title="Leads">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-140px)]">
        
        {/* Filters Area */}
        <div className="p-4 border-b border-gray-100 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Filter size={16} className="text-gray-500" />
                <select 
                  className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 font-medium p-0 pr-6 cursor-pointer"
                  value={selectedStageId}
                  onChange={(e) => setSelectedStageId(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
             </div>

             <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Filter size={16} className="text-gray-500" />
                <select 
                  className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 font-medium p-0 pr-6 cursor-pointer"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
             </div>

             <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Calendar size={16} className="text-gray-500" />
                <input 
                  type="date" 
                  className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 p-0"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date" 
                  className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 p-0"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Name <SortIcon columnKey="name" /></div>
                </th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th 
                  className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center">Source <SortIcon columnKey="source" /></div>
                </th>
                <th 
                  className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('stage_name')}
                >
                  <div className="flex items-center">Stage <SortIcon columnKey="stage_name" /></div>
                </th>
                <th 
                  className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('response_status')}
                >
                  <div className="flex items-center">Resp. Time <SortIcon columnKey="response_status" /></div>
                </th>
                <th 
                  className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">Created <SortIcon columnKey="created_at" /></div>
                </th>
                <th 
                  className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('last_contact')}
                >
                  <div className="flex items-center">Last Contact <SortIcon columnKey="last_contact" /></div>
                </th>
                <th className="px-6 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leadsLoading ? (
                 <tr>
                   <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                     <div className="flex justify-center mb-2">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                     </div>
                     Loading leads...
                   </td>
                 </tr>
              ) : processedLeads.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                     No leads found matching filters.
                   </td>
                 </tr>
              ) : (
                processedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => handleRowClick(lead.id)}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex flex-col">
                        <span>{lead.phone || '-'}</span>
                        <span className="text-xs text-gray-400">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize bg-white">{lead.source}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                        {getStageName(lead.stage_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getResponseTimeBadge(lead.response_time_seconds)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                       {new Date(lead.created_at).toLocaleDateString()} 
                       <span className="text-xs text-gray-400 block">
                         {formatDuration(Date.now() - new Date(lead.created_at).getTime())} ago
                       </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                       {lead.last_contact ? (
                          <>
                            {new Date(lead.last_contact).toLocaleDateString()}
                            <span className="text-xs text-gray-400 block">
                             {formatDuration(Date.now() - new Date(lead.last_contact).getTime())} ago
                            </span>
                          </>
                       ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-600 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Count */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 font-medium text-center">
           Showing {processedLeads.length} leads
        </div>
      </div>
    </PageWrapper>
  );
};