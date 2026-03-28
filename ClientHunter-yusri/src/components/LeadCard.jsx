import React, { useState } from 'react';
import { 
  Star, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Plus, 
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { 
  getLeadBadgeStyle, 
  getWhatsAppUrl, 
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

  const handleAddToPipeline = async () => {
    setAdding(true);
    const result = await onAddToPipeline({ ...place, category });
    setAddResult(result);
    setAdding(false);
    setTimeout(() => setAddResult(null), 3000);
  };

  const handleTestWhatsApp = () => {
    window.open(getWhatsAppUrl(place.nationalPhoneNumber), '_blank');
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
      <div className="relative h-56 overflow-hidden">
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
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-white mb-4 line-clamp-1 group-hover:text-blue-400 transition-colors tracking-tighter">
          {place.displayName}
        </h3>

        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-white font-black text-lg">{place.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {place.userRatingCount?.toLocaleString() || 0} Engagement
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 text-slate-300 group/item">
            <div className="w-10 h-10 rounded-xl bg-green-500/5 flex items-center justify-center border border-green-500/10 group-hover/item:border-green-500/30 transition-all">
              <Phone className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-bold tracking-tight">{formatPhoneForDisplay(place.nationalPhoneNumber)}</span>
          </div>

          <div className="flex items-start gap-4 text-slate-400 group/item">
            <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center border border-white/5 group-hover/item:border-blue-500/30 transition-all shrink-0">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-bold leading-relaxed line-clamp-2 pt-2">{place.formattedAddress}</span>
          </div>
        </div>

        {/* Action Layer */}
        <div className="mt-auto space-y-3">
          <button
            onClick={() => handleWhatsAppCommunication(place.nationalPhoneNumber, place.displayName, category)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/10 active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            Initiate Contact
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddToPipeline}
              disabled={adding || addResult?.success || isInPipeline}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                addResult?.success || isInPipeline
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 active:scale-95'
              }`}
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : (addResult?.success || isInPipeline ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
              {adding ? 'Processing...' : (addResult?.success || isInPipeline ? 'In Pipeline' : 'Add to Pipeline')}
            </button>

            <button
              onClick={handleCopySampleImage}
              disabled={copyingSample}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 border-2 border-slate-700 rounded-2xl transition-all active:scale-95"
              title={copySampleResult?.message || 'Copy sample image'}
            >
              {copyingSample
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : (copySampleResult?.success
                  ? <Check className="w-5 h-5" />
                  : (copySampleResult
                    ? <X className="w-5 h-5" />
                    : <Copy className="w-5 h-5" />))}
            </button>

            <button
              onClick={handleTestWhatsApp}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 border-2 border-slate-700 rounded-2xl transition-all active:scale-95"
              title="Intelligence Check"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
