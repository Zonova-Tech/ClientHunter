import React, { useState } from 'react';
import {
  Star,
  Phone,
  Copy,
  Trash2,
  Edit3,
  Save,
  Check,
  X,
  MapPin,
  Globe,
  Mail,
  ChevronDown,
  Loader2,
  Building2
} from 'lucide-react';
import {
  LEAD_STATUSES,
  getLeadStatusMeta,
  normalizeLeadStatus
} from '../utils/leadUtils';
import { copySampleImageToClipboard } from '../utils/sampleImages';
import WhatsAppSendButton from './WhatsAppSendButton';

const PipelineCard = ({
  lead,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateContact,
  onMarkContacted,
  onDelete
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [email, setEmail] = useState(lead.email || '');
  const [webUrl, setWebUrl] = useState(lead.webUrl || '');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copyingSample, setCopyingSample] = useState(false);
  const [copySampleResult, setCopySampleResult] = useState(null);

  const category = lead.category || 'Business';
  const photoUrl = lead.images && lead.images[0] ? lead.images[0] : null;
  const statusMeta = getLeadStatusMeta(lead.status);
  const statusValue = normalizeLeadStatus(lead.status);

  const getPhoneForTel = () => {
    const phone = lead?.phone || '';
    if (!phone) return null;
    const normalized = phone.replace(/[^\d+]/g, '');
    return normalized ? `tel:${normalized}` : null;
  };
  const phoneAvailable = !!getPhoneForTel();

  const handleCall = () => { if (phoneAvailable) window.location.href = getPhoneForTel(); };

  const openInMaps = () => {
    const placeId = lead.placeId;
    let url = 'https://www.google.com/maps';
    if (placeId) {
      url = `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}&query=${encodeURIComponent(lead.businessName || 'Business')}`;
    } else if (lead.address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveNotes = async () => {
    await onUpdateNotes(lead.id, notes);
    if (email !== lead.email) await onUpdateContact(lead.id, 'email', email);
    if (webUrl !== lead.webUrl) await onUpdateContact(lead.id, 'webUrl', webUrl);
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus) => {
    await onUpdateStatus(lead.id, newStatus);
    setShowStatusDropdown(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove "${lead.businessName}" from your pipeline?`)) {
      setDeleting(true);
      await onDelete(lead.id);
    }
  };

  const handleCopySampleImage = async () => {
    setCopyingSample(true);
    try {
      const result = await copySampleImageToClipboard(lead.category);
      setCopySampleResult(result);
    } catch {
      setCopySampleResult({ success: false, message: 'Failed to copy sample image.' });
    } finally {
      setCopyingSample(false);
      setTimeout(() => setCopySampleResult(null), 2500);
    }
  };

  const badgeClass = lead.leadScore === 'Hot'
    ? 'badge-hot'
    : lead.leadScore === 'Warm'
      ? 'badge-potential'
      : 'badge-cold';

  const badgeLabel = lead.leadScore === 'Hot' ? 'Hot' : lead.leadScore === 'Warm' ? 'Potential' : 'New';

  const statusDotClass =
    statusValue === 'Contacted' ? 'dot-contacted'
    : statusValue === 'Lead' ? 'dot-lead'
    : 'dot-new';

  return (
    <article
      className="surface rounded-xl overflow-hidden flex flex-col transition-all hover:border-zinc-700"
      style={{ opacity: deleting ? 0.5 : 1 }}
    >
      {/* Top section */}
      <div className="flex p-4 gap-4">
        <div
          className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface-elevated)' }}
        >
          {photoUrl && !imageError ? (
            <img
              src={photoUrl}
              alt={lead.businessName}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          ) : (
            <Building2 className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[15px] leading-tight truncate">{lead.businessName}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide shrink-0 ${badgeClass}`}>
              {badgeLabel}
            </span>
          </div>

          <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{category}</p>

          <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--warning)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {lead.rating?.toFixed(1) || 'N/A'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="font-mono">{lead.ratingCount?.toLocaleString() || 0}</span>
            </span>

            {/* Status dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(v => !v)}
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide hover:text-white transition-colors"
                aria-label={`Status: ${statusMeta.label}`}
                title="Change status"
              >
                <span className={`dot ${statusDotClass}`} />
                {statusMeta.label}
                <ChevronDown className={`w-3 h-3 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStatusDropdown && (
                <div
                  className="absolute top-full left-0 mt-1.5 surface rounded-md py-1 min-w-[140px] z-20 shadow-2xl animate-fade-in"
                >
                  {LEAD_STATUSES.map(s => {
                    const dot = s.value === 'Contacted' ? 'dot-contacted' : s.value === 'Lead' ? 'dot-lead' : 'dot-new';
                    const active = statusValue === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => handleStatusChange(s.value)}
                        className="w-full px-3 py-1.5 text-left text-xs font-medium flex items-center gap-2 transition-colors"
                        style={{
                          background: active ? 'var(--primary-soft)' : 'transparent',
                          color: active ? 'var(--primary)' : 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                      >
                        <span className={`dot ${dot}`} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact / notes (read mode) */}
      {!isEditing && (lead.email || lead.webUrl || lead.notes) && (
        <div className="px-4 pb-3 space-y-2">
          {(lead.email || lead.webUrl) && (
            <div className="flex flex-col gap-1.5 text-xs">
              {lead.email && (
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.webUrl && (
                <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <Globe className="w-3.5 h-3.5" />
                  <a href={lead.webUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                    {lead.webUrl}
                  </a>
                </div>
              )}
            </div>
          )}
          {lead.notes && (
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              "{lead.notes}"
            </p>
          )}
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="px-4 pb-3 space-y-3 animate-fade-in">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <div className="flex items-center gap-2 input px-3 py-2">
              <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Website
            </label>
            <div className="flex items-center gap-2 input px-3 py-2">
              <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://..."
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal lead details…"
              rows={3}
              className="input w-full px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="px-4 pb-4 flex items-center gap-1.5 mt-auto">
        <WhatsAppSendButton
          phone={lead.phone}
          businessName={lead.businessName}
          category={category}
          rating={lead.rating}
          ratingCount={lead.ratingCount}
          onSent={() => onMarkContacted?.(lead.id)}
        />

        <button
          type="button"
          onClick={handleCall}
          disabled={!phoneAvailable}
          aria-label="Call"
          title={phoneAvailable ? 'Call' : 'No phone number'}
          className="btn-ghost w-10 h-10 rounded-md flex items-center justify-center shrink-0"
        >
          <Phone className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={openInMaps}
          aria-label="Open in Google Maps"
          title="Open in Google Maps"
          className="btn-ghost w-10 h-10 rounded-md flex items-center justify-center shrink-0"
        >
          <MapPin className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleCopySampleImage}
          disabled={copyingSample}
          aria-label={copySampleResult?.message || 'Copy sample image'}
          title={copySampleResult?.message || 'Copy sample image'}
          className="btn-ghost w-10 h-10 rounded-md flex items-center justify-center shrink-0"
        >
          {copyingSample
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : copySampleResult?.success
              ? <Check className="w-4 h-4" style={{ color: 'var(--success)' }} />
              : copySampleResult
                ? <X className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                : <Copy className="w-4 h-4" />}
        </button>

        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSaveNotes}
              aria-label="Save"
              title="Save"
              className="btn-primary w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel"
              title="Cancel"
              className="btn-ghost w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
              title="Edit"
              className="btn-ghost w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete"
              title="Delete"
              className="btn-danger w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </article>
  );
};

export default PipelineCard;
