import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Filter,
  Search,
  Loader2,
  Inbox,
  TrendingUp
} from 'lucide-react';
import PipelineCard from './PipelineCard';
import { LEAD_STATUSES } from '../utils/leadUtils';

/**
 * PipelineView Component
 * View and manage saved leads
 */
const PipelineView = ({ 
  leads, 
  loading, 
  error,
  onUpdateStatus, 
  onUpdateNotes,
  onUpdateContact,
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      const matchesSearch = !searchTerm || 
        lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      // Score filter
      const matchesScore = scoreFilter === 'all' || lead.leadScore === scoreFilter;
      
      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [leads, searchTerm, statusFilter, scoreFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return LEAD_STATUSES.map(status => ({
      ...status,
      count: leads.filter(l => l.status === status.value).length
    }));
  }, [leads]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Sales Pipeline</h1>
        <p className="text-slate-400">
          Track and manage your saved leads through the sales process.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {stats.map(status => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
            className={`p-4 rounded-xl border transition-all ${
              statusFilter === status.value
                ? 'bg-slate-700 border-blue-500'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${status.color}`}></span>
              <span className="text-sm text-slate-400">{status.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{status.count}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, category, or notes..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Score Filter */}
        <div className="relative">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Scores</option>
            <option value="Hot">🔥 Hot Leads</option>
            <option value="Warm">⭐ Potential</option>
            <option value="Cold">New Leads</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Clear Filters */}
        {(statusFilter !== 'all' || scoreFilter !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setScoreFilter('all');
              setSearchTerm('');
            }}
            className="px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {leads.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <TrendingUp className="w-4 h-4" />
            Sorted by date added
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {leads.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <Inbox className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Leads Yet</h3>
          <p className="text-slate-400 max-w-md">
            Start by searching for potential clients and adding them to your pipeline.
            Your saved leads will appear here.
          </p>
        </div>
      )}

      {/* No Results After Filter */}
      {leads.length > 0 && filteredLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <Filter className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Matching Leads</h3>
          <p className="text-slate-400">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}

      {/* Leads Grid */}
      {filteredLeads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map(lead => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              onUpdateStatus={onUpdateStatus}
              onUpdateNotes={onUpdateNotes}
              onUpdateContact={onUpdateContact}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PipelineView;
