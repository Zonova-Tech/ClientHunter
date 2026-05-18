import React, { useState } from 'react';
import CampaignList from './CampaignList';
import CampaignDetail from './CampaignDetail';
import CreateCampaignModal from './CreateCampaignModal';
import useOutreachCampaigns from '../../hooks/useOutreachCampaigns';

const OutreachView = () => {
  const {
    campaigns,
    loading,
    createCampaign,
    updateStatus,
    enqueueLeads,
    deleteCampaign,
    fetchPreview,
    approvePreview,
    sendTestNow,
    setLeadLanguage,
  } = useOutreachCampaigns();

  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const selected = selectedId ? campaigns.find((c) => c.id === selectedId) : null;

  return (
    <>
      {selected ? (
        <CampaignDetail
          campaign={selected}
          onBack={() => setSelectedId(null)}
          onUpdateStatus={updateStatus}
          onEnqueue={enqueueLeads}
          onDelete={deleteCampaign}
          onFetchPreview={fetchPreview}
          onApprovePreview={approvePreview}
          onSendTestNow={sendTestNow}
          onSetLeadLanguage={setLeadLanguage}
        />
      ) : (
        <CampaignList
          campaigns={campaigns}
          loading={loading}
          onOpen={setSelectedId}
          onCreate={() => setShowCreate(true)}
        />
      )}

      {showCreate && (
        <CreateCampaignModal
          onClose={(newId) => {
            setShowCreate(false);
            if (newId) setSelectedId(newId);
          }}
          onCreate={createCampaign}
        />
      )}
    </>
  );
};

export default OutreachView;
