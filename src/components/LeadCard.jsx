import React, { useState } from 'react';
import {
  Star,
  Phone,
  MapPin,
  Plus,
  Copy,
  Check,
  X,
  Loader2,
  Building2
} from 'lucide-react';
import {
  getLeadBadgeStyle,
  getPrimaryCategory
} from '../utils/leadUtils';
import { copySampleImageToClipboard } from '../utils/sampleImages';
import WhatsAppSendButton from './WhatsAppSendButton';

const LeadCard = ({ place, onAddToPipeline, isInPipeline = false, onWhatsAppSent }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [copyingSample, setCopyingSample] = useState(false);
  const [copySampleResult, setCopySampleResult] = useState(null);

  const badge = getLeadBadgeStyle(place.leadScore);
  const category = getPrimaryCategory(place.types);

  const getPhotoUrl = () => {
    if (place.photos && place.photos.length > 0) {
      try { return place.photos[0].getUrl({ maxWidth: 240 }); } catch { return null; }
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
    if (telHref) window.location.href = telHref;
  };

  const openInMaps = () => {
    const placeId = place.placeId || place.id;
    let url = 'https://www.google.com/maps';
    if (placeId) {
      url = `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}&query=${encodeURIComponent(place.displayName || 'Business')}`;
    } else if (place.formattedAddress) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.formattedAddress)}`;
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
    } catch {
      setCopySampleResult({ success: false, message: 'Failed to copy sample image.' });
    } finally {
      setCopyingSample(false);
      setTimeout(() => setCopySampleResult(null), 2500);
    }
  };

  const alreadyAdded = addResult?.success || isInPipeline;
  const phoneAvailable = !!getPhoneForTel();

  const badgeClass = place.leadScore === 'Hot'
    ? 'badge-hot'
    : place.leadScore === 'Warm'
      ? 'badge-potential'
      : 'badge-cold';

  return (
    <article className="surface rounded-xl overflow-hidden flex flex-col transition-colors hover:border-zinc-700">
      <div className="flex p-4 gap-4">
        {/* Photo thumbnail */}
        <div
          className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface-elevated)' }}
        >
          {photoUrl && !imageError ? (
            <img
              src={photoUrl}
              alt={place.displayName}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          ) : (
            <Building2 className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[15px] leading-tight truncate">
              {place.displayName}
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide shrink-0 ${badgeClass}`}>
              {badge.text.replace(/[🔥⭐]/g, '').trim()}
            </span>
          </div>

          <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-muted)' }}>
            {category}
          </p>

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--warning)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {place.rating?.toFixed(1) || 'N/A'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="font-mono">{place.userRatingCount?.toLocaleString() || 0} reviews</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="px-4 pb-4 flex items-center gap-1.5">
        <WhatsAppSendButton
          phone={place.nationalPhoneNumber}
          businessName={place.displayName}
          category={category}
          rating={place.rating}
          ratingCount={place.userRatingCount}
          onSent={() => onWhatsAppSent?.(place.placeId || place.id)}
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

        <button
          type="button"
          onClick={handleAddToPipeline}
          disabled={adding || alreadyAdded}
          aria-label={alreadyAdded ? 'Already in pipeline' : 'Add to pipeline'}
          title={alreadyAdded ? 'Already in pipeline' : 'Add to pipeline'}
          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: alreadyAdded ? 'var(--primary-soft)' : 'var(--primary)',
            color: alreadyAdded ? 'var(--primary)' : 'white',
            border: alreadyAdded ? '1px solid var(--border)' : 'none',
            opacity: adding ? 0.6 : 1,
          }}
        >
          {adding
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : alreadyAdded
              ? <Check className="w-4 h-4" />
              : <Plus className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>
    </article>
  );
};

export default LeadCard;
