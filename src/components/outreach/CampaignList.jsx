import React from 'react';
import { Plus, Zap, Pause, CheckCircle2, AlertCircle, Circle } from 'lucide-react';

const STATUS_META = {
  draft:    { label: 'Draft',    icon: Circle,        color: 'var(--text-muted)' },
  running:  { label: 'Running',  icon: Zap,           color: 'var(--success)' },
  paused:   { label: 'Paused',   icon: Pause,         color: 'var(--warning)' },
  stopped:  { label: 'Stopped',  icon: AlertCircle,   color: 'var(--danger)' },
  done:     { label: 'Done',     icon: CheckCircle2,  color: 'var(--text-secondary)' },
};

const CampaignList = ({ campaigns, loading, onOpen, onCreate }) => {
  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
      <header
        className="px-6 lg:px-10 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight leading-tight">
            Outreach Console
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Automated WhatsApp campaigns — runs 8am–5pm, paced and jittered.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="btn-primary px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New campaign
        </button>
      </header>

      <div className="px-6 lg:px-10 py-6">
        {loading && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading campaigns…
          </p>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="surface rounded-xl p-10 text-center">
            <h3 className="text-[17px] font-semibold mb-1">No campaigns yet</h3>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Create one to harvest leads and start automated outreach.
            </p>
            <button
              onClick={onCreate}
              className="btn-primary px-4 py-2 rounded-md text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create your first campaign
            </button>
          </div>
        )}

        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} onClick={() => onOpen(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignCard = ({ campaign, onClick }) => {
  const meta = STATUS_META[campaign.status] || STATUS_META.draft;
  const Icon = meta.icon;
  const stats = campaign.stats || {};
  const total =
    (stats.queued || 0) + (stats.sent || 0) + (stats.failed || 0) + (stats.optedOut || 0);
  const sent = stats.sent || 0;
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="surface rounded-xl p-4 text-left hover:bg-zinc-900 transition-colors"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold truncate">{campaign.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
            <span className="text-[12px]" style={{ color: meta.color }}>
              {meta.label}
            </span>
            {campaign.testMode && (
              <span
                className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
              >
                Test mode
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        <span>
          <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
            {sent}
          </span>{' '}
          sent
        </span>
        <span>•</span>
        <span>
          <span className="font-mono">{stats.queued || 0}</span> queued
        </span>
        {(stats.failed || 0) > 0 && (
          <>
            <span>•</span>
            <span style={{ color: 'var(--danger)' }}>
              <span className="font-mono">{stats.failed}</span> failed
            </span>
          </>
        )}
      </div>

      {total > 0 && (
        <div
          className="mt-3 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--surface-elevated)' }}
        >
          <div
            className="h-full transition-all"
            style={{ width: `${pct}%`, background: 'var(--primary)' }}
          />
        </div>
      )}
    </button>
  );
};

export default CampaignList;
