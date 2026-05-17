import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import SearchView from './components/SearchView';
import PipelineView from './components/PipelineView';
import useLeads from './hooks/useLeads';
import { normalizeLeadStatus } from './utils/leadUtils';

/**
 * Main App Component
 * Client Hunter - Lead Generation & CRM Tool
 */
function App() {
  console.log("🚀 UI Updates Loaded: Padding and Font Sizes applied.");
  const [activeView, setActiveView] = useState('search');
  
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    addLead,
    updateLeadStatus,
    updateLeadNotes,
    updateLeadContact,
    markLeadContacted,
    markLeadContactedByPlaceId,
    deleteLead
  } = useLeads();

  // Calculate stats for sidebar
  const stats = useMemo(() => {
    return {
      totalLeads: leads.length,
      hotLeads: leads.filter(l => l.leadScore === 'Hot').length,
      contacted: leads.filter(l => {
        const status = normalizeLeadStatus(l.status);
        return status === 'Contacted' || status === 'Lead';
      }).length
    };
  }, [leads]);

  // Get saved lead IDs to mark in search results
  const savedLeadIds = useMemo(() => {
    return leads.map(l => l.placeId);
  }, [leads]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        stats={stats}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeView === 'search' ? (
          <SearchView
            onAddToPipeline={addLead}
            savedLeadIds={savedLeadIds}
            onWhatsAppSent={markLeadContactedByPlaceId}
          />
        ) : (
          <PipelineView
            leads={leads}
            loading={leadsLoading}
            error={leadsError}
            onUpdateStatus={updateLeadStatus}
            onUpdateNotes={updateLeadNotes}
            onUpdateContact={updateLeadContact}
            onMarkContacted={markLeadContacted}
            onDelete={deleteLead}
          />
        )}
      </main>
    </div>
  );
}

export default App;
