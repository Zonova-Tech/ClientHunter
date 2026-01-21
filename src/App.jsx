import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import SearchView from './components/SearchView';
import PipelineView from './components/PipelineView';
import useLeads from './hooks/useLeads';

/**
 * Main App Component
 * Client Hunter - Lead Generation & CRM Tool
 */
function App() {
  const [activeView, setActiveView] = useState('search');
  
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    addLead,
    updateLeadStatus,
    updateLeadNotes,
    updateLeadContact,
    deleteLead
  } = useLeads();

  // Calculate stats for sidebar
  const stats = useMemo(() => {
    return {
      totalLeads: leads.length,
      hotLeads: leads.filter(l => l.leadScore === 'Hot').length,
      contacted: leads.filter(l => l.status === 'Contacted' || l.status === 'Interested' || l.status === 'Closed').length
    };
  }, [leads]);

  // Get saved lead IDs to mark in search results
  const savedLeadIds = useMemo(() => {
    return leads.map(l => l.placeId);
  }, [leads]);

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        stats={stats}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {activeView === 'search' ? (
          <SearchView
            onAddToPipeline={addLead}
            savedLeadIds={savedLeadIds}
          />
        ) : (
          <PipelineView
            leads={leads}
            loading={leadsLoading}
            error={leadsError}
            onUpdateStatus={updateLeadStatus}
            onUpdateNotes={updateLeadNotes}
            onUpdateContact={updateLeadContact}
            onDelete={deleteLead}
          />
        )}
      </main>
    </div>
  );
}

export default App;
