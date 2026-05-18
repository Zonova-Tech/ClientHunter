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
  Loader2
} from 'lucide-react';
import {
  getLeadBadgeStyle,
  LEAD_STATUSES,
  getLeadStatusMeta,
  normalizeLeadStatus
} from '../utils/leadUtils';
import { copySampleImageToClipboard } from '../utils/sampleImages';
import WhatsAppSendButton from './WhatsAppSendButton';

/**
 * PipelineCard Component
 * Displays a saved lead with status management and notes
 */
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

  const badgeStyle = getLeadBadgeStyle(lead.leadScore);
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

  const handleCall = () => {
    const telHref = getPhoneForTel();
    if (!telHref) return;
    window.location.href = telHref;
  };

  const openInMaps = () => {
    const placeId = lead.placeId;
    let url = '';

    if (placeId) {
      url = `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}&query=${encodeURIComponent(lead.businessName || 'Business')}`;
    } else if (lead.address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`;
    } else {
      url = 'https://www.google.com/maps';
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveNotes = async () => {
    await onUpdateNotes(lead.id, notes);
    if (email !== lead.email) {
      await onUpdateContact(lead.id, 'email', email);
    }
    if (webUrl !== lead.webUrl) {
      await onUpdateContact(lead.id, 'webUrl', webUrl);
    }
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus) => {
    await onUpdateStatus(lead.id, newStatus);
    setShowStatusDropdown(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove "${lead.businessName}" from your pipeline?`)) {
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

  return (
    <div className={`glass-card group overflow-hidden flex flex-col h-full transition-all duration-500 ${deleting ? 'opacity-50 grayscale' : 'hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(232,121,249,0.35)]'} ${badgeStyle.glow ? 'border-orange-500/40 hot-lead-glow' : 'border-white/10'}`}>
      {/* Visual Header */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={lead.businessName}
            className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${
              imageLoaded ? 'opacity-70 group-hover:opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <div className="text-5xl opacity-20 filter grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all">🏢</div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/10 ${badgeStyle.bgColor} ${badgeStyle.textColor}`}>
            {badgeStyle.text}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
          <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
            {category}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-white backdrop-blur-md border border-white/15 hover:border-fuchsia-400/40 transition-all"
              aria-label={`Status: ${statusMeta.label}`}
              title="Change status"
            >
              <span className={`w-2 h-2 rounded-full ${statusMeta.color}`}></span>
              {statusMeta.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-fuchsia-500/20 overflow-hidden z-20 min-w-[170px] animate-in slide-in-from-top-2 duration-300">
                {LEAD_STATUSES.map(status => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handleStatusChange(status.value)}
                    className={`w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-fuchsia-500/10 transition-all flex items-center gap-3 ${
                      statusValue === status.value ? 'bg-fuchsia-500/10 text-fuchsia-300' : ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10 flex-nowrap">
          <h3 className="text-2xl font-black text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-300 group-hover:to-pink-300 transition-all tracking-tighter min-w-0 flex-1">
            {lead.businessName}
          </h3>

          <button
            type="button"
            onClick={openInMaps}
            aria-label="Open location in Google Maps"
            title="Open in Google Maps"
            className="w-10 h-10 shrink-0 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/20 transition-all"
          >
            <MapPin className="w-4 h-4 text-cyan-300" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Remove from pipeline"
            title={deleting ? 'Removing...' : 'Remove from pipeline'}
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border transition-all ${
              deleting
                ? 'bg-slate-900 text-slate-600 border-white/5 opacity-60 cursor-not-allowed'
                : 'bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border-rose-500/30 hover:border-rose-400/60'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white font-black text-lg">{lead.rating?.toFixed(1) || 'N/A'}</span>
          </div>

          <div className="text-slate-400 text-xs font-black tracking-widest shrink-0">
            {lead.ratingCount?.toLocaleString() || 0}
          </div>
        </div>

        {/* Editable Segment */}
        {isEditing ? (
          <div className="space-y-4 mb-4 p-4 bg-slate-950/50 rounded-2xl border border-fuchsia-500/20 animate-in fade-in duration-500">
            <div>
              <label className="block text-[10px] font-black text-fuchsia-300/80 uppercase tracking-widest mb-2">Electronic Mail</label>
              <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl px-4 py-3 border border-white/10 focus-within:border-fuchsia-500/40 transition-colors">
                <Mail className="w-4 h-4 text-fuchsia-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="bg-transparent text-sm font-bold text-white outline-none w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-fuchsia-300/80 uppercase tracking-widest mb-2">Digital HQ (URL)</label>
              <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl px-4 py-3 border border-white/10 focus-within:border-fuchsia-500/40 transition-colors">
                <Globe className="w-4 h-4 text-cyan-400" />
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-transparent text-sm font-bold text-white outline-none w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-fuchsia-300/80 uppercase tracking-widest mb-2">Tactical Intelligence (Notes)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal lead details..."
                rows={3}
                className="w-full bg-slate-900/80 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none border border-white/10 focus:border-fuchsia-500/40 transition-colors resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            {(lead.email || lead.webUrl) && (
              <div className="grid grid-cols-1 gap-2">
                {lead.email && (
                  <div className="flex items-center gap-3 text-slate-300 group/link">
                    <Mail className="w-4 h-4 text-fuchsia-400 group-hover/link:text-fuchsia-300 transition-colors" />
                    <span className="text-xs font-bold tracking-tight">{lead.email}</span>
                  </div>
                )}
                {lead.webUrl && (
                  <div className="flex items-center gap-3 text-cyan-300 group/link">
                    <Globe className="w-4 h-4" />
                    <a href={lead.webUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline decoration-cyan-500/40 hover:decoration-cyan-300 transition-colors">
                      {lead.webUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
            {lead.notes && (
              <div className="bg-gradient-to-br from-violet-950/40 to-slate-900/40 rounded-2xl p-5 border border-fuchsia-500/15">
                <p className="text-sm font-bold text-slate-200 leading-relaxed italic opacity-90">"{lead.notes}"</p>
              </div>
            )}
          </div>
        )}

        {/* Action Layer */}
        <div className="mt-auto grid grid-cols-4 gap-3">
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
            disabled={!getPhoneForTel()}
            aria-label="Call phone number"
            title={getPhoneForTel() ? 'Call' : 'No phone number'}
            className={`h-14 w-full rounded-2xl transition-all border-2 active:scale-95 flex items-center justify-center ${
              getPhoneForTel()
                ? 'bg-slate-900/70 hover:bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/60'
                : 'bg-slate-900/70 text-slate-600 border-slate-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <Phone className="w-5 h-5" />
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={handleSaveNotes}
              aria-label="Save"
              title="Save"
              className="h-14 w-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white rounded-2xl transition-all border-2 border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/20 active:scale-95 flex items-center justify-center"
            >
              <Save className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopySampleImage}
              disabled={copyingSample}
              aria-label={copySampleResult?.message || 'Copy sample image'}
              title={copySampleResult?.message || 'Copy sample image'}
              className="h-14 w-full bg-slate-900/70 hover:bg-cyan-600/20 text-cyan-300 border-2 border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
            >
              {copyingSample
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : (copySampleResult?.success
                  ? <Check className="w-5 h-5" />
                  : (copySampleResult
                    ? <X className="w-5 h-5" />
                    : <Copy className="w-5 h-5" />))}
            </button>
          )}

          {isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel editing"
              title="Cancel"
              className="h-14 w-full bg-slate-900/70 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 border-2 border-slate-700 hover:border-rose-500/40 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
              title="Edit"
              className="h-14 w-full bg-slate-900/70 hover:bg-violet-600/20 text-violet-300 border-2 border-violet-500/30 hover:border-violet-400/60 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineCard;
