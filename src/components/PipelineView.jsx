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
import { LEAD_STATUSES, normalizeLeadStatus } from '../utils/leadUtils';

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
  onMarkContacted,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || normalizeLeadStatus(lead.status) === statusFilter;
      const matchesScore = scoreFilter === 'all' || lead.leadScore === scoreFilter;
      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [leads, searchTerm, statusFilter, scoreFilter]);

  const stats = useMemo(() => {
    return LEAD_STATUSES.map(status => ({
      ...status,
      count: leads.filter(l => normalizeLeadStatus(l.status) === status.value).length
    }));
  }, [leads]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
          <Loader2 className="w-16 h-16 text-fuchsia-400 animate-spin relative" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-12 overflow-auto">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 sm:mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3 py-1 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/15 border border-fuchsia-500/30 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">Inventory Management</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter">Your Sales <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">Pipeline</span></h1>
        <p className="text-lg text-slate-400 font-bold max-w-2xl leading-relaxed">
          Monitor your leads across the conversion lifecycle. Use advanced filters to prioritize high-intent prospects.
        </p>
      </div>

      {/* Analytics Hub */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
        {stats.map(status => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
            className={`glass-card p-4 sm:p-6 flex flex-col items-start transition-all duration-300 group hover:-translate-y-1 ${
              statusFilter === status.value
                ? 'ring-2 ring-fuchsia-500/60 shadow-[0_0_30px_-10px_rgba(232,121,249,0.5)]'
                : 'hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-3 h-3 rounded-full ${status.color} shadow-lg shadow-current`}></span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{status.label}</span>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white group-hover:scale-110 transition-transform origin-left">{status.count}</p>
          </button>
        ))}
      </div>

      {/* Control Center */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 mb-10 sm:mb-12">
        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-6 w-5 h-5 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, tags, or internal notes..."
              className="w-full pl-16 pr-6 py-4 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-bold placeholder-slate-600 focus:outline-none focus:border-fuchsia-500/50 transition-all shadow-xl"
            />
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="appearance-none pl-6 pr-14 py-4 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:border-fuchsia-500/50 transition-all cursor-pointer w-full sm:min-w-[200px] shadow-xl"
          >
            <option value="all">Priority: All</option>
            <option value="Hot">🔥 Hot Leads</option>
            <option value="Warm">⭐ Potential</option>
            <option value="Cold">New Entry</option>
          </select>
          <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400 pointer-events-none" />
        </div>

        {(statusFilter !== 'all' || scoreFilter !== 'all' || searchTerm) && (
          <button
            onClick={() => { setStatusFilter('all'); setScoreFilter('all'); setSearchTerm(''); }}
            className="px-6 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-fuchsia-200 hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 transition-all w-full sm:w-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto">
        {leads.length > 0 && (
          <div className="flex items-center justify-between mb-8 opacity-80">
            <p className="text-xs font-black uppercase tracking-widest text-fuchsia-300/80 underline underline-offset-8 decoration-fuchsia-500/40">
              Inventory Batch ({filteredLeads.length} items matched)
            </p>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Chronological Sequence
            </div>
          </div>
        )}

        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 pb-20">
            {filteredLeads.map(lead => (
              <PipelineCard
                key={lead.id}
                lead={lead}
                onUpdateStatus={onUpdateStatus}
                onUpdateNotes={onUpdateNotes}
                onUpdateContact={onUpdateContact}
                onMarkContacted={onMarkContacted}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : leads.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center glass-card">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border border-fuchsia-500/20 bg-gradient-to-br from-violet-600/15 to-fuchsia-600/10">
              <Filter className="w-10 h-10 text-fuchsia-400/60" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">No Pipeline Matches</h3>
            <p className="text-slate-400 font-bold max-w-xs">Adjust your targeting parameters to find leads in this segment.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center glass-card border-dashed">
            <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 border border-fuchsia-500/30 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/15 to-pink-600/20 animate-float shadow-[0_0_40px_-10px_rgba(232,121,249,0.4)]">
              <Inbox className="w-12 h-12 text-fuchsia-300" />
            </div>
            <h3 className="text-4xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300">Pipeline Empty</h3>
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest max-w-sm leading-relaxed">
              Scan for potential clients in the search bay to begin building your portfolio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineView;
