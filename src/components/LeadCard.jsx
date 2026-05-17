import React, { useState } from 'react';
import {
  Star,
  Phone,
  MapPin,
  Plus,
  Copy,
  Check,
  X,
  Loader2
} from 'lucide-react';
import {
  getLeadBadgeStyle,
  getPrimaryCategory
} from '../utils/leadUtils';
import { copySampleImageToClipboard } from '../utils/sampleImages';
import WhatsAppSendButton from './WhatsAppSendButton';

/**
 * LeadCard Component
 * Displays a potential lead with premium glassmorphic styling
 */
const LeadCard = ({ place, onAddToPipeline, isInPipeline = false, onWhatsAppSent }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [copyingSample, setCopyingSample] = useState(false);
  const [copySampleResult, setCopySampleResult] = useState(null);

  const badgeStyle = getLeadBadgeStyle(place.leadScore);
  const category = getPrimaryCategory(place.types);
  
  const getPhotoUrl = () => {
    if (place.photos && place.photos.length > 0) {
      try {
        return place.photos[0].getUrl({ maxWidth: 600 });
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

  const getPhoneForTel = () => {
    const phone = place?.nationalPhoneNumber || place?.internationalPhoneNumber || '';
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
    const placeId = place.placeId || place.id;
    let url = '';

    if (placeId) {
      url = `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}&query=${encodeURIComponent(place.displayName || 'Business')}`;
    } else if (place.location && typeof place.location.lat === 'function' && typeof place.location.lng === 'function') {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.location.lat()},${place.location.lng()}`)}`;
    } else if (place.formattedAddress) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.formattedAddress)}`;
    } else {
      url = 'https://www.google.com/maps';
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToPipeline = async () => {
    setAdding(true);
    const result = await onAddToPipeline({ ...place, category });
    setAddResult(result);
    setAdding(false);
    setTimeout(() => setAddResult(null), 3000);
  };

  const handleCopySampleImage = async () => {
    setCopyingSample(true);
    try {
      const result = await copySampleImageToClipboard(category);
      setCopySampleResult(result);
    } catch (e) {
      setCopySampleResult({ success: false, message: 'Failed to copy sample image.' });
    } finally {
      setCopyingSample(false);
      setTimeout(() => setCopySampleResult(null), 2500);
    }
  };

  return (
    <div className={`glass-card group overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(232,121,249,0.35)] ${badgeStyle.glow ? 'border-orange-500/40 hot-lead-glow' : 'border-white/10'}`}>
      {/* Visual Header */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={place.displayName}
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
        
        {/* Overlay Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/10 ${badgeStyle.bgColor} ${badgeStyle.textColor}`}>
            {badgeStyle.text}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
            {category}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10 flex-nowrap">
          <h3 className="text-2xl font-black text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-300 group-hover:to-pink-300 transition-all tracking-tighter min-w-0 flex-1">
            {place.displayName}
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

          <div className="flex items-center gap-2 shrink-0">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white font-black text-lg">{place.rating?.toFixed(1) || 'N/A'}</span>
          </div>

          <div className="text-slate-400 text-xs font-black tracking-widest shrink-0">
            {place.userRatingCount?.toLocaleString() || 0}
          </div>
        </div>

        {/* Action Layer */}
        <div className="mt-auto grid grid-cols-4 gap-3">
          <WhatsAppSendButton
            phone={place.nationalPhoneNumber}
            businessName={place.displayName}
            category={category}
            onSent={() => onWhatsAppSent?.(place.placeId || place.id)}
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

          <button
            onClick={handleAddToPipeline}
            disabled={adding || addResult?.success || isInPipeline}
            aria-label={adding ? 'Processing' : (addResult?.success || isInPipeline ? 'In pipeline' : 'Add to pipeline')}
            title={adding ? 'Processing...' : (addResult?.success || isInPipeline ? 'In pipeline' : 'Add to pipeline')}
            className={`h-14 w-full rounded-2xl transition-all border-2 flex items-center justify-center ${
              addResult?.success || isInPipeline
                ? 'bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 text-fuchsia-300 border-fuchsia-500/40'
                : 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/20 active:scale-95'
            }`}
          >
            {adding
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : (addResult?.success || isInPipeline
                ? <Check className="w-5 h-5" />
                : <Plus className="w-5 h-5" />)}
          </button>

          <button
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
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
