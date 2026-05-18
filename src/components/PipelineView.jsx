import React, { useState, useMemo } from 'react';
import { Filter, Search, Loader2, Inbox } from 'lucide-react';
import PipelineCard from './PipelineCard';
import { LEAD_STATUSES, normalizeLeadStatus } from '../utils/leadUtils';

const PipelineView = ({
  leads,
  loading,
  // error,  // unused
  onUpdateStatus,
  onUpdateNotes,
  onUpdateContact,
  onMarkContacted,
  onDelete,
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
      count: leads.filter(l => normalizeLeadStatus(l.status) === status.value).length,
    }));
  }, [leads]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  const dotClass = (v) => v === 'Contacted' ? 'dot-contacted' : v === 'Lead' ? 'dot-lead' : 'dot-new';
  const activeFilters = statusFilter !== 'all' || scoreFilter !== 'all' || searchTerm;

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="px-6 lg:px-10 py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {leads.length} leads · {stats.find(s => s.value === 'Contacted')?.count || 0} contacted · {stats.find(s => s.value === 'Lead')?.count || 0} active
          </p>
        </div>
      </header>

      {/* Status filter chips */}
      <div className="px-6 lg:px-10 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              background: statusFilter === 'all' ? 'var(--primary-soft)' : 'var(--surface-elevated)',
              color: statusFilter === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            All ({leads.length})
          </button>
          {stats.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(statusFilter === s.value ? 'all' : s.value)}
              className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors"
              style={{
                background: statusFilter === s.value ? 'var(--primary-soft)' : 'var(--surface-elevated)',
                color: statusFilter === s.value ? 'var(--primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <span className={`dot ${dotClass(s.value)}`} />
              {s.label} ({s.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search + score filter */}
      <div className="px-6 lg:px-10 pt-4 flex flex-col sm:flex-row gap-2 max-w-4xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, or notes…"
            className="input w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="input appearance-none pl-10 pr-8 py-2.5 text-sm cursor-pointer min-w-[160px]"
          >
            <option value="all">Priority: All</option>
            <option value="Hot">Hot leads</option>
            <option value="Warm">Potential</option>
            <option value="Cold">New</option>
          </select>
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
        {activeFilters && (
          <button
            onClick={() => { setStatusFilter('all'); setScoreFilter('all'); setSearchTerm(''); }}
            className="btn-ghost px-3 py-2 rounded-md text-sm font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Cards grid */}
      <div className="px-6 lg:px-10 py-6">
        {filteredLeads.length > 0 ? (
          <>
            <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              {filteredLeads.length} {filteredLeads.length === 1 ? 'result' : 'results'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-12">
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
          </>
        ) : leads.length > 0 ? (
          <div className="surface rounded-xl p-10 max-w-3xl flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--surface-elevated)' }}
            >
              <Filter className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">No matches</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Adjust your filters to find leads in this segment.
              </p>
            </div>
          </div>
        ) : (
          <div className="surface rounded-xl p-10 max-w-3xl flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--primary-soft)' }}
            >
              <Inbox className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Your pipeline is empty</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Use the <span style={{ color: 'var(--text-primary)' }}>Find leads</span> view to discover businesses without websites, then add them here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineView;
