import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { DEFAULT_TEMPLATES, DEFAULT_PACING } from '../../hooks/useOutreachCampaigns';

const TABS = [
  { id: 'si', label: 'Sinhala', hint: 'Sinhala–English mix (Singlish) for most SL florists' },
  { id: 'ta', label: 'Tamil',   hint: 'Tamil–English mix for Northern/Eastern + plantation shops' },
  { id: 'en', label: 'English', hint: 'For upscale, English-styled, or high-rating shops' },
];

const CreateCampaignModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('Sri Lanka florists — Q1 outreach');
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [activeTab, setActiveTab] = useState('si');
  const [dailyCap, setDailyCap] = useState(DEFAULT_PACING.dailyCap);
  const [perHourCap, setPerHourCap] = useState(DEFAULT_PACING.perHourCap);
  const [submitting, setSubmitting] = useState(false);

  const updateTemplate = (lang, body) => {
    setTemplates((prev) => ({ ...prev, [lang]: { body } }));
  };

  const submit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const id = await onCreate({
        name,
        templates,
        testMode: true,
        pacing: {
          ...DEFAULT_PACING,
          dailyCap: Math.max(1, Math.min(200, dailyCap)),
          perHourCap: Math.max(1, Math.min(30, perHourCap)),
        },
      });
      onClose(id);
    } catch (err) {
      console.error('[outreach] createCampaign failed:', err);
      setSubmitting(false);
    }
  };

  const activeBody = templates[activeTab]?.body ?? '';
  const variationCount = estimateVariations(activeBody);

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
            <h2 className="text-[17px] font-semibold">Create outreach campaign</h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Test mode on by default — sends route to TEST_PHONE_OVERRIDE.
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-zinc-800"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Field label="Campaign name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full py-2 px-3 text-sm"
              autoFocus
            />
          </Field>

          {/* Multi-language template editor */}
          <div>
            <div className="text-[13px] font-medium mb-2">Message templates</div>
            <div
              className="flex gap-1 p-1 rounded-md mb-3"
              style={{ background: 'var(--surface-elevated)' }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex-1 px-3 py-1.5 rounded text-[13px] transition-colors"
                  style={{
                    background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: activeTab === t.id ? 500 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="text-[12px] mb-2" style={{ color: 'var(--text-muted)' }}>
              {TABS.find((t) => t.id === activeTab)?.hint}
            </p>

            <textarea
              value={activeBody}
              onChange={(e) => updateTemplate(activeTab, e.target.value)}
              rows={11}
              className="input w-full py-2 px-3 text-sm font-mono leading-relaxed"
              style={{ resize: 'vertical' }}
            />

            <div className="flex items-center justify-between text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>{activeBody.length} chars</span>
              <span>~{variationCount.toLocaleString()} unique variants</span>
            </div>

            <div
              className="mt-2 rounded-md p-2.5 text-[11px] leading-relaxed"
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Syntax:</strong>{' '}
              <code>{'{{shopName}}'}</code> / <code>{'{{city}}'}</code> = variables.{' '}
              <code>[Hi|Hello|Hey]</code> = picks one per send (anti-spam variation).
            </div>

            {activeTab !== 'en' && (
              <div
                className="mt-3 rounded-md p-3 flex items-start gap-2 text-[12px]"
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: 'var(--warning)',
                }}
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Starter draft — review with a native {activeTab === 'si' ? 'Sinhala' : 'Tamil'} speaker
                  before approving. Bad translations are worse than English.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Daily cap" hint="Messages per 24h">
              <input
                type="number"
                value={dailyCap}
                onChange={(e) => setDailyCap(parseInt(e.target.value, 10) || 0)}
                className="input w-full py-2 px-3 text-sm"
                min="1"
                max="200"
              />
            </Field>
            <Field label="Hourly cap" hint="Messages per hour">
              <input
                type="number"
                value={perHourCap}
                onChange={(e) => setPerHourCap(parseInt(e.target.value, 10) || 0)}
                className="input w-full py-2 px-3 text-sm"
                min="1"
                max="30"
              />
            </Field>
          </div>

          <div
            className="rounded-lg p-3 text-[12px] leading-relaxed"
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--primary)' }}>Defaults applied:</strong> 08:00–17:00 send window
            (Asia/Colombo), Sundays + Poya days skipped, 30% random tick-skip, 5-failure auto-pause.
            Campaign starts in <code>draft</code> — you'll need to preview sample messages and approve
            before it can actually send.
          </div>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-end gap-2 sticky bottom-0"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        >
          <button onClick={() => onClose()} className="btn-ghost px-4 py-2 rounded-md text-sm">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || submitting}
            className="btn-primary px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create campaign'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <div className="text-[13px] font-medium mb-1.5">{label}</div>
    {children}
    {hint && (
      <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
        {hint}
      </div>
    )}
  </label>
);

// Multiplies the option counts inside each [a|b|c] block. Rough estimate
// of how many unique surface forms the spintax can produce.
function estimateVariations(text) {
  let total = 1;
  const re = /\[([^\[\]]+)\]/g;
  let m;
  while ((m = re.exec(text))) {
    const content = m[1];
    if (content.includes('|')) {
      total *= content.split('|').length;
    }
  }
  return total;
}

export default CreateCampaignModal;
