import React, { useState } from 'react';
import { 
  Star, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Plus, 
  Copy,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { 
  getLeadBadgeStyle, 
  formatPhoneForDisplay,
  getPrimaryCategory,
  handleWhatsAppCommunication
} from '../utils/leadUtils';
import { copySampleImageToClipboard } from '../utils/sampleImages';

/**
 * LeadCard Component
 * Displays a potential lead with premium glassmorphic styling
 */
const LeadCard = ({ place, onAddToPipeline, isInPipeline = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [copyingSample, setCopyingSample] = useState(false);
  const [copySampleResult, setCopySampleResult] = useState(null);
  const [showContactNumber, setShowContactNumber] = useState(false);

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
    <div className={`glass-card group overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] ${badgeStyle.glow ? 'border-amber-500/30' : 'border-white/5'}`}>
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
          <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-blue-400 backdrop-blur-md border border-white/10">
            {category}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-2xl font-black text-white line-clamp-2 group-hover:text-blue-400 transition-colors tracking-tighter min-w-0 flex-1">
            {place.displayName}
          </h3>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContactNumber((v) => !v)}
                aria-label={showContactNumber ? 'Hide contact number' : 'Show contact number'}
                aria-expanded={showContactNumber}
                title={showContactNumber ? 'Hide contact number' : 'Show contact number'}
                className="w-10 h-10 rounded-xl bg-green-500/5 flex items-center justify-center border border-green-500/10 hover:border-green-500/30 transition-all"
              >
                <Phone className="w-4 h-4 text-green-400" />
              </button>

              {showContactNumber && (
                <div className="absolute right-0 top-full mt-2 px-3 py-2 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl whitespace-nowrap">
                  <span className="text-sm font-black text-slate-200 tracking-tight">
                    {formatPhoneForDisplay(place.nationalPhoneNumber)}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openInMaps}
              aria-label="Open location in Google Maps"
              title="Open in Google Maps"
              className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center border border-white/5 hover:border-blue-500/30 transition-all"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-white font-black text-lg">{place.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {place.userRatingCount?.toLocaleString() || 0}
          </div>
        </div>

        <div className="mb-8" />

        {/* Action Layer */}
        <div className="mt-auto grid grid-cols-3 gap-3">
          <button
            onClick={() => handleWhatsAppCommunication(place.nationalPhoneNumber, place.displayName, category)}
            aria-label="Initiate contact"
            title="Initiate contact"
            className="h-14 w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all border-2 border-emerald-500/30 active:scale-95 flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            onClick={handleAddToPipeline}
            disabled={adding || addResult?.success || isInPipeline}
            aria-label={adding ? 'Processing' : (addResult?.success || isInPipeline ? 'In pipeline' : 'Add to pipeline')}
            title={adding ? 'Processing...' : (addResult?.success || isInPipeline ? 'In pipeline' : 'Add to pipeline')}
            className={`h-14 w-full rounded-2xl transition-all border-2 flex items-center justify-center ${
              addResult?.success || isInPipeline
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 active:scale-95'
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
            className="h-14 w-full bg-slate-900 hover:bg-slate-800 text-slate-400 border-2 border-slate-700 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
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
