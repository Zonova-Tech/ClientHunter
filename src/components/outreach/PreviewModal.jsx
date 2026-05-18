import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

const LANG_META = {
  si: { label: 'Sinhala', color: 'var(--primary)' },
  ta: { label: 'Tamil',   color: 'var(--warning)' },
  en: { label: 'English', color: 'var(--success)' },
};

/**
 * Shows 5 rendered sample messages from queued leads before the operator
 * approves the campaign for sending. Each refresh re-fetches (RNG is seeded
 * by leadId so the same lead always produces the same message — useful for
 * debugging, but rerolling chooses different sample leads).
 */
const PreviewModal = ({ campaign, onClose, onApprove, onFetch }) => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);

  const loadSamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const previews = await onFetch(campaign.id);
      setSamples(previews);
    } catch (err) {
      setError(err.message || 'Failed to load previews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.id]);

  const approve = async () => {
    setApproving(true);
    try {
      await onApprove(campaign.id);
      onClose(true);
    } catch (err) {
      console.error('[outreach] approve failed:', err);
      setApproving(false);
    }
  };

  const hasNoQueued = !loading && samples.length === 0 && !error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={() => onClose()}
    >
      <div
        className="surface rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-[17px] font-semibold">Preview sample messages</h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Real messages rendered from queued leads. Approve to allow sending.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSamples}
              disabled={loading}
              className="btn-ghost w-8 h-8 rounded-md flex items-center justify-center"
              title="Reroll samples"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onClose()}
              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-zinc-800"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Rendering samples…
            </div>
          )}

          {error && (
            <div
              className="rounded-md p-3 flex items-start gap-2 text-sm"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--danger)',
              }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {hasNoQueued && (
            <div
              className="rounded-md p-4 text-sm text-center"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
            >
              No queued leads yet. Harvest some florists first, then come back to preview.
            </div>
          )}

          {!loading && samples.map((s) => {
            const meta = LANG_META[s.language] || LANG_META.si;
            return (
              <div
                key={s.leadId}
                className="rounded-lg p-4"
                style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold truncate">{s.shopName}</div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {s.city} · <span className="font-mono">{s.phoneE164}</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: meta.color,
                      border: `1px solid ${meta.color}33`,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <pre
                  className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed m-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {s.message}
                </pre>
              </div>
            );
          })}
        </div>

        <div
          className="px-5 py-3 flex items-center justify-between gap-2 sticky bottom-0"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        >
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {campaign.previewApproved
              ? 'Already approved — sending allowed.'
              : 'Approval is required before the scheduler will send.'}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onClose()} className="btn-ghost px-4 py-2 rounded-md text-sm">
              Close
            </button>
            <button
              onClick={approve}
              disabled={approving || hasNoQueued || campaign.previewApproved}
              className="btn-primary px-4 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              {campaign.previewApproved ? 'Approved' : approving ? 'Approving…' : 'Approve & allow sending'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
