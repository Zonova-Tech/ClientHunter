import React, { useState } from 'react';
import {
  Star,
  Phone,
  MessageCircle,
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
  ExternalLink
} from 'lucide-react';
import {
  getLeadBadgeStyle,
  getWhatsAppUrl,
  formatPhoneForDisplay,
  LEAD_STATUSES,
  getStatusColor,
  handleWhatsAppCommunication
} from '../utils/leadUtils';
import { copySampleImageToClipboard } from '../utils/sampleImages';

/**
 * PipelineCard Component
 * Displays a saved lead with status management and notes
 */
const PipelineCard = ({
  lead,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateContact,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [email, setEmail] = useState(lead.email || '');
  const [webUrl, setWebUrl] = useState(lead.webUrl || '');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copyingSample, setCopyingSample] = useState(false);
  const [copySampleResult, setCopySampleResult] = useState(null);

  const badgeStyle = getLeadBadgeStyle(lead.leadScore);

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
    } catch (e) {
      setCopySampleResult({ success: false, message: 'Failed to copy sample image.' });
    } finally {
      setCopyingSample(false);
      setTimeout(() => setCopySampleResult(null), 2500);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`glass-card group overflow-hidden transition-all duration-500 ${deleting ? 'opacity-50 grayscale' : 'hover:-translate-y-2'} shadow-2xl`}>
      {/* Header with image and badges */}
      <div className="relative h-32 overflow-hidden">
        {/* Cover Image with Gradient */}
        <div className="absolute inset-0 bg-slate-900">
          {lead.images && lead.images[0] && (
            <img
              src={lead.images[0]}
              alt={lead.businessName}
              className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[3s]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-transparent to-slate-950/90"></div>
        </div>

        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 ${badgeStyle.glow ? 'hot-lead-glow' : ''} ${badgeStyle.bgColor} ${badgeStyle.textColor}`}>
            {badgeStyle.text}
          </span>
        </div>

        {/* Status Dropdown */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10 ${getStatusColor(lead.status)} hover:brightness-125 transition-all shadow-xl`}
          >
            {lead.status}
            <ChevronDown className={`w-3 h-3 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-20 min-w-[160px] animate-in slide-in-from-top-2 duration-300">
              {LEAD_STATUSES.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 ${lead.status === status.value ? 'bg-white/5 text-blue-400' : ''
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

      {/* Content Body */}
      <div className="p-8">
        {/* Business Name & Meta */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-white mb-2 tracking-tighter group-hover:text-blue-400 transition-colors">
            {lead.businessName}
          </h3>
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <span className="text-blue-400">{lead.category}</span>
            <span className="opacity-20">•</span>
            <span>Captured {formatDate(lead.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-white font-black">{lead.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {lead.ratingCount?.toLocaleString() || 0} Engagement Signal
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 group-hover:border-green-500/20 transition-colors">
            <Phone className="w-4 h-4 text-green-400 mb-2" />
            <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mobile Path</span>
            <span className="text-sm font-bold text-slate-200">{formatPhoneForDisplay(lead.phone)}</span>
          </div>
          {lead.address && (
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
              <MapPin className="w-4 h-4 text-blue-400 mb-2" />
              <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Region</span>
              <span className="text-xs font-bold text-slate-200 line-clamp-1">{lead.address}</span>
            </div>
          )}
        </div>

        {/* Editable Segment */}
        {isEditing ? (
          <div className="space-y-4 mb-8 p-4 bg-slate-950/50 rounded-2xl border border-white/5 animate-in fade-in duration-500">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Electronic Mail</label>
              <div className="flex items-center gap-3 bg-slate-900 rounded-xl px-4 py-3 border border-white/5">
                <Mail className="w-4 h-4 text-slate-500" />
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
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Digital HQ (URL)</label>
              <div className="flex items-center gap-3 bg-slate-900 rounded-xl px-4 py-3 border border-white/5">
                <Globe className="w-4 h-4 text-slate-500" />
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
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tactical Intelligence (Notes)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal lead details..."
                rows={3}
                className="w-full bg-slate-900 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none border border-white/5 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {(lead.email || lead.webUrl) && (
              <div className="grid grid-cols-1 gap-2">
                {lead.email && (
                  <div className="flex items-center gap-3 text-slate-500 group/link">
                    <Mail className="w-4 h-4 group-hover/link:text-blue-400 transition-colors" />
                    <span className="text-xs font-bold tracking-tight">{lead.email}</span>
                  </div>
                )}
                {lead.webUrl && (
                  <div className="flex items-center gap-3 text-blue-400 group/link">
                    <Globe className="w-4 h-4" />
                    <a href={lead.webUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline transition-colors">
                      {lead.webUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
            {lead.notes && (
              <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
                <p className="text-sm font-bold text-slate-300 leading-relaxed italic opacity-80">"{lead.notes}"</p>
              </div>
            )}
          </div>
        )}

        {/* Tactical Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleWhatsAppCommunication(lead.phone, lead.businessName, lead.category)}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/10 active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>

          <button
            onClick={handleCopySampleImage}
            disabled={copyingSample}
            className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/5 rounded-2xl transition-all active:scale-95"
            title={copySampleResult?.message || 'Copy sample image'}
          >
            {copyingSample
              ? <ExternalLink className="w-5 h-5 opacity-60" />
              : (copySampleResult?.success
                ? <Check className="w-5 h-5" />
                : (copySampleResult
                  ? <X className="w-5 h-5" />
                  : <Copy className="w-5 h-5" />))}
          </button>

          {isEditing ? (
            <>
              <button onClick={handleSaveNotes} className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                <Save className="w-5 h-5" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-500 rounded-2xl border border-white/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/5 rounded-2xl transition-all active:scale-95">
                <Edit3 className="w-5 h-5" />
              </button>
              <button onClick={handleDelete} disabled={deleting} className="p-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-2xl transition-all active:scale-95">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineCard;
