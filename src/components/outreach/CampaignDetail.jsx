import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Sparkles,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { harvestFlorists } from '../../utils/floristHarvester';
import { isHarvestOnCooldown } from '../../hooks/useOutreachCampaigns';
import PreviewModal from './PreviewModal';

const STATUS_COLORS = {
  queued:    'var(--text-muted)',
  sending:   'var(--warning)',
  sent:      'var(--success)',
  failed:    'var(--danger)',
  skipped:   'var(--text-muted)',
  opted_out: 'var(--text-muted)',
};

const LANG_META = {
  si: { label: 'SI', full: 'Sinhala', color: 'var(--primary)' },
  ta: { label: 'TA', full: 'Tamil',   color: 'var(--warning)' },
  en: { label: 'EN', full: 'English', color: 'var(--success)' },
};

const CampaignDetail = ({
  campaign,
  onBack,
  onUpdateStatus,
  onEnqueue,
  onDelete,
  onFetchPreview,
  onApprovePreview,
  onSendTestNow,
  onSetLeadLanguage,
}) => {
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [harvestState, setHarvestState] = useState(null);
  const [harvestError, setHarvestError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [langFilter, setLangFilter] = useState('all');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, message } | { error }

  useEffect(() => {
    if (!campaign?.id) return;
    const q = query(
      collection(db, 'outreachCampaigns', campaign.id, 'leads'),
      orderBy('queuedAt', 'asc'),
      limit(500),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLeadsLoading(false);
      },
      (err) => {
        console.error('[outreach] leads listener error:', err);
        setLeadsLoading(false);
      },
    );
    return unsub;
  }, [campaign?.id]);

  const stats = campaign.stats || {};
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
  const sentToday = campaign.sentToday?.[todayKey] || 0;

  const langCounts = useMemo(() => {
    const c = { si: 0, ta: 0, en: 0 };
    leads.forEach((l) => {
      if (l.status === 'queued' && c[l.language] !== undefined) c[l.language]++;
    });
    return c;
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const order = ['queued', 'sending', 'sent', 'failed', 'opted_out', 'skipped'];
    return [...leads]
      .filter((l) => langFilter === 'all' || l.language === langFilter)
      .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  }, [leads, langFilter]);

  const cooldownActive = isHarvestOnCooldown(campaign);
  const hasQueued = (stats.queued || 0) > 0;
  const previewApproved = !!campaign.previewApproved;

  const canStart = campaign.status !== 'running' && hasQueued && previewApproved;
  const canPause = campaign.status === 'running';
  const canStop = campaign.status === 'running' || campaign.status === 'paused';

  const runHarvest = async () => {
    if (harvestState) return;
    if (cooldownActive) {
      const ok = window.confirm(
        'Harvest was already run within the last 30 days. Running again spends more Google Places API credit. Continue?',
      );
      if (!ok) return;
    }
    setHarvestError(null);
    setHarvestState({ phase: 'search', queryIndex: 0, totalQueries: 0 });
    try {
      const harvested = await harvestFlorists({
        onProgress: (p) => setHarvestState(p),
      });
      const { added, skipped } = await onEnqueue(campaign.id, harvested);
      setHarvestState({ phase: 'finished', added, skipped, total: harvested.length });
    } catch (err) {
      console.error('[outreach] harvest failed:', err);
      setHarvestError(err.message || 'Harvest failed');
      setHarvestState(null);
    }
  };

  const runTestSend = async () => {
    if (testSending) return;
    setTestResult(null);
    setTestSending(true);
    try {
      const result = await onSendTestNow(campaign.id);
      setTestResult({
        ok: true,
        shopName: result.shopName,
        language: result.language,
        messagePreview: result.messagePreview,
      });
    } catch (err) {
      setTestResult({ error: err.message || 'Test send failed' });
    } finally {
      setTestSending(false);
    }
  };

  const confirmDelete = async () => {
    const ok = window.confirm(
      `Delete campaign "${campaign.name}"? This removes the campaign doc but leaves the queued leads orphaned in Firestore.`,
    );
    if (!ok) return;
    await onDelete(campaign.id);
    onBack();
  };

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
      <header
        className="px-6 lg:px-10 py-5 flex items-center gap-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={onBack} className="btn-ghost w-8 h-8 rounded-md flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-semibold tracking-tight truncate">{campaign.name}</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Status: <span style={{ color: 'var(--text-primary)' }}>{campaign.status}</span>
            {campaign.testMode && (
              <span
                className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'var(--surface-elevated)' }}
              >
                Test mode
              </span>
            )}
            {previewApproved && (
              <span
                className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
                style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Preview approved
              </span>
            )}
          </p>
        </div>
        <button
          onClick={confirmDelete}
          className="btn-ghost px-3 py-2 rounded-md text-sm flex items-center gap-2"
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </header>

      <div className="px-6 lg:px-10 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Sent" value={stats.sent || 0} color="var(--success)" />
          <Stat label="Today" value={sentToday} color="var(--primary)" />
          <Stat label="Queued" value={stats.queued || 0} />
          <Stat label="Failed" value={stats.failed || 0} color="var(--danger)" />
          <Stat label="Opted out" value={stats.optedOut || 0} />
        </div>

        {/* Language distribution */}
        {(langCounts.si + langCounts.ta + langCounts.en) > 0 && (
          <div className="surface rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Queued by language
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {(['si', 'ta', 'en']).map((lang) => {
                const m = LANG_META[lang];
                return (
                  <div key={lang} className="flex items-center gap-2">
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(255,255,255,0.04)', color: m.color, border: `1px solid ${m.color}33` }}
                    >
                      {m.label}
                    </span>
                    <span className="text-[14px] font-mono font-semibold">{langCounts[lang]}</span>
                    <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {m.full}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="surface rounded-xl p-4">
          {!previewApproved && hasQueued && (
            <div
              className="mb-3 rounded-md p-3 flex items-start gap-2 text-[12px]"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: 'var(--warning)',
              }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Preview the first 5 rendered messages and approve before the scheduler can send.
                Sending is hard-gated until you do.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onUpdateStatus(campaign.id, 'running')}
              disabled={!canStart}
              title={!previewApproved ? 'Approve preview first' : ''}
              className="btn-primary px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <Play className="w-4 h-4" />
              {campaign.status === 'paused' ? 'Resume' : 'Start'}
            </button>
            <button
              onClick={() => onUpdateStatus(campaign.id, 'paused')}
              disabled={!canPause}
              className="btn-ghost px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={() => onUpdateStatus(campaign.id, 'stopped')}
              disabled={!canStop}
              className="btn-ghost px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
            <button
              onClick={() => setShowPreview(true)}
              disabled={!hasQueued}
              className="btn-ghost px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <Eye className="w-4 h-4" />
              {previewApproved ? 'View preview' : 'Preview & approve'}
            </button>
            <button
              onClick={runTestSend}
              disabled={!campaign.testMode || !hasQueued || testSending}
              title={!campaign.testMode ? 'Disabled — campaign is not in test mode' : 'Sends one message immediately, bypasses scheduler + send window'}
              className="btn-ghost px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
              style={{ color: 'var(--whatsapp)' }}
            >
              {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send test now
            </button>
            <div className="flex-1" />
            <button
              onClick={runHarvest}
              disabled={!!harvestState && harvestState.phase !== 'finished'}
              className="btn-ghost px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
            >
              {harvestState && harvestState.phase !== 'finished' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {cooldownActive ? 'Re-harvest islandwide' : 'Harvest islandwide florists'}
            </button>
          </div>

          {harvestState && <HarvestProgress state={harvestState} />}
          {harvestError && (
            <div
              className="mt-3 rounded-md p-3 text-sm flex items-start gap-2"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--danger)',
              }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {harvestError}
            </div>
          )}

          {testResult?.ok && (
            <div
              className="mt-3 rounded-md p-3 text-sm"
              style={{
                background: 'rgba(34,197,94,0.10)',
                border: '1px solid rgba(34,197,94,0.25)',
                color: 'var(--success)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">
                  Test message sent to TEST_PHONE_OVERRIDE — "{testResult.shopName}" ({testResult.language.toUpperCase()})
                </span>
              </div>
              <pre
                className="text-[12px] whitespace-pre-wrap font-sans leading-relaxed m-0 mt-2 p-2 rounded"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  color: 'var(--text-primary)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {testResult.messagePreview}
              </pre>
            </div>
          )}
          {testResult?.error && (
            <div
              className="mt-3 rounded-md p-3 text-sm flex items-start gap-2"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--danger)',
              }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              Test send failed: {testResult.error}
            </div>
          )}

          {(campaign.consecutiveFailures || 0) >= 5 && (
            <div
              className="mt-3 rounded-md p-3 text-sm flex items-start gap-2"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--danger)',
              }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              Auto-paused after 5 consecutive failures. Check HostGrap credits/quota, then Start to retry.
            </div>
          )}
        </div>

        {/* Leads table */}
        <div className="surface rounded-xl overflow-hidden">
          <div
            className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="text-[14px] font-semibold">Leads ({visibleLeads.length})</h2>
            <div className="flex items-center gap-1">
              {(['all', 'si', 'ta', 'en']).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  className="text-[12px] px-2.5 py-1 rounded transition-colors"
                  style={{
                    background: langFilter === lang ? 'var(--primary)' : 'transparent',
                    color: langFilter === lang ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {lang === 'all' ? 'All' : LANG_META[lang].label}
                </button>
              ))}
            </div>
          </div>

          {leads.length === 0 && !leadsLoading && (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No leads yet — click <em>Harvest islandwide florists</em> to queue some up.
            </div>
          )}

          {visibleLeads.length > 0 && (
            <LeadTable
              leads={visibleLeads}
              onSetLanguage={(leadId, lang) => onSetLeadLanguage(campaign.id, leadId, lang)}
            />
          )}
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          campaign={campaign}
          onClose={() => setShowPreview(false)}
          onApprove={onApprovePreview}
          onFetch={onFetchPreview}
        />
      )}
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div className="surface rounded-lg p-3">
    <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
      {label}
    </div>
    <div className="text-[22px] font-semibold font-mono" style={{ color: color || 'var(--text-primary)' }}>
      {value}
    </div>
  </div>
);

const HarvestProgress = ({ state }) => {
  if (state.phase === 'finished') {
    return (
      <div
        className="mt-3 rounded-md p-3 text-sm"
        style={{
          background: 'rgba(34,197,94,0.10)',
          border: '1px solid rgba(34,197,94,0.25)',
          color: 'var(--success)',
        }}
      >
        Harvest done — queued {state.added} new leads. Skipped {state.skipped || 0}.
      </div>
    );
  }
  const message =
    state.phase === 'search'
      ? `Scanning region ${state.queryIndex}/${state.totalQueries}: ${state.currentQuery}`
      : `Fetching phone numbers ${state.detailIndex}/${state.totalDetails} (kept ${state.uniqueFound})`;

  return (
    <div className="mt-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
      {message}
    </div>
  );
};

const LeadTable = ({ leads, onSetLanguage }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-[11px] uppercase tracking-wider"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
          >
            <th className="text-left px-4 py-2 font-medium">Shop</th>
            <th className="text-left px-4 py-2 font-medium">City</th>
            <th className="text-left px-4 py-2 font-medium">Phone</th>
            <th className="text-left px-4 py-2 font-medium">Lang</th>
            <th className="text-left px-4 py-2 font-medium">Status</th>
            <th className="text-left px-4 py-2 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="px-4 py-2 truncate max-w-[220px]">{lead.shopName}</td>
              <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>
                {lead.city || '—'}
              </td>
              <td className="px-4 py-2 font-mono text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {lead.phoneE164}
              </td>
              <td className="px-4 py-2">
                <select
                  value={lead.language || 'si'}
                  onChange={(e) => onSetLanguage(lead.id, e.target.value)}
                  disabled={lead.status !== 'queued'}
                  className="text-[11px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: (LANG_META[lead.language] || LANG_META.si).color,
                    border: `1px solid ${(LANG_META[lead.language] || LANG_META.si).color}33`,
                  }}
                  title={(LANG_META[lead.language] || LANG_META.si).full}
                >
                  <option value="si">SI</option>
                  <option value="ta">TA</option>
                  <option value="en">EN</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <span
                  className="text-[11px] uppercase tracking-wider font-medium"
                  style={{ color: STATUS_COLORS[lead.status] || 'var(--text-muted)' }}
                >
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {lead.lastError || (lead.attempts > 1 ? `attempt ${lead.attempts}` : '')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignDetail;
