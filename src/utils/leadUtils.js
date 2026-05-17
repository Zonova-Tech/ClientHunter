/**
 * Lead Utilities
 * Utility functions for phone formatting, lead scoring, and WhatsApp detection
 */

import { getSampleImageUrlForCategory, getSampleImageFileForCategory } from './sampleImages';
import { sendWhatsAppImage, sendWhatsAppText, WhatsAppApiError } from '../services/whatsappService';

/**
 * Resolves a (possibly relative) sample image path into an absolute URL that
 * external services like HostGrap can fetch. Returns null if no image is available.
 *
 * Important: HostGrap downloads images from the public internet, so localhost
 * URLs will fail in development. Use a publicly-reachable Drive URL or deploy preview.
 */
export const getAbsoluteSampleImageUrl = (category) => {
  const file = getSampleImageFileForCategory(category);
  if (!file) return null;

  // In dev: VITE_API_BASE_URL points to emulator/local backend.
  // In production: empty — Firebase Hosting rewrites /promo-images/** to the function.
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const origin = apiBase || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!origin) return null;

  try {
    return `${origin}/promo-images/${encodeURIComponent(file)}`;
  } catch {
    return null;
  }
};

/**
 * Returns the standard outreach message for a business.
 */
export const buildOutreachMessage = (businessName) =>
  `Hi! I'm from Zonova Tech (Pvt) Ltd. I noticed ${businessName} doesn't have a website yet. ` +
  `We build websites for businesses and would love to help you get online. Would you be interested in a quick chat?`;

/**
 * Validates if a Sri Lankan phone number is a mobile number
 * Mobile numbers start with 07 or +94 7 (we want mobile for WhatsApp)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if it's a valid Sri Lankan mobile number
 */
export const isValidSriLankanMobile = (phone) => {
  if (!phone) return false;

  // Remove all spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check for Sri Lankan mobile patterns
  // Format: 07XXXXXXXX or +947XXXXXXXX or 947XXXXXXXX
  const mobilePatterns = [
    /^07\d{8}$/,        // Local format: 0771234567
    /^\+947\d{8}$/,     // International with +: +94771234567
    /^947\d{8}$/,       // International without +: 94771234567
    /^07\d{1}\s?\d{3}\s?\d{4}$/, // With spaces: 077 123 4567
  ];

  return mobilePatterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Formats a Sri Lankan phone number for WhatsApp
 * Removes spaces, replaces leading 0 with 94
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number for WhatsApp (e.g., 94771234567)
 */
export const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '');

  // Remove leading + if present
  cleanPhone = cleanPhone.replace(/^\+/, '');

  // If starts with 0, replace with 94
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.substring(1);
  }

  // If doesn't start with 94, add it
  if (!cleanPhone.startsWith('94')) {
    cleanPhone = '94' + cleanPhone;
  }

  return cleanPhone;
};

/**
 * Generates WhatsApp URL
 * @param {string} phone - The phone number
 * @param {string} message - Optional pre-filled message
 * @returns {string} - WhatsApp URL
 */
export const getWhatsAppUrl = (phone, message = '') => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const baseUrl = `https://wa.me/${formattedPhone}`;

  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }

  return baseUrl;
};

/**
 * Calculates lead score based on rating count and rating
 * @param {number} ratingCount - Number of reviews
 * @param {number} rating - Average rating
 * @returns {'Hot' | 'Warm' | 'Cold'} - Lead score category
 */
export const calculateLeadScore = (ratingCount, rating) => {
  if (ratingCount > 100 && rating > 4.0) {
    return 'Hot';
  }
  if (ratingCount > 50) {
    return 'Warm';
  }
  return 'Cold';
};

/**
 * Gets badge styling based on lead score
 * @param {'Hot' | 'Warm' | 'Cold'} score - Lead score
 * @returns {object} - Badge styling object with text, bg color, and icon
 */
export const getLeadBadgeStyle = (score) => {
  switch (score) {
    case 'Hot':
      return {
        text: '🔥 HOT LEAD',
        bgColor: 'bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500',
        textColor: 'text-white',
        borderColor: 'border-orange-400',
        glow: true
      };
    case 'Warm':
      return {
        text: '⭐ Potential',
        bgColor: 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600',
        textColor: 'text-white',
        borderColor: 'border-fuchsia-400',
        glow: false
      };
    case 'Cold':
      return {
        text: 'New Lead',
        bgColor: 'bg-gradient-to-r from-cyan-600 to-sky-600',
        textColor: 'text-white',
        borderColor: 'border-cyan-400',
        glow: false
      };
    default:
      return {
        text: 'Unknown',
        bgColor: 'bg-slate-700',
        textColor: 'text-slate-200',
        borderColor: 'border-slate-500',
        glow: false
      };
  }
};

/**
 * Filters places based on Client Hunter criteria
 * @param {Array} places - Array of places from Google Places API
 * @returns {Array} - Filtered and sorted array of suitable leads
 */
export const filterSuitableLeads = (places) => {
  if (!places || !Array.isArray(places)) return [];

  return places
    .filter(place => {
      // Must have at least 10 reviews
      const ratingCount = place.userRatingCount || 0;
      if (ratingCount < 10) return false;

      // Must NOT have a website (our target clients)
      if (place.websiteUri) return false;

      // Must be operational
      if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') return false;

      // Must have a valid Sri Lankan mobile number
      const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || '';
      if (!isValidSriLankanMobile(phone)) return false;

      return true;
    })
    .map(place => ({
      ...place,
      leadScore: calculateLeadScore(place.userRatingCount, place.rating),
      formattedWhatsapp: formatPhoneForWhatsApp(place.nationalPhoneNumber || place.internationalPhoneNumber)
    }))
    .sort((a, b) => b.userRatingCount - a.userRatingCount); // Sort by rating count (highest first)
};

/**
 * Formats a phone number for display
 * @param {string} phone - The phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return 'No phone';

  // Clean the phone number
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Format as 077 123 4567
  if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
  }

  return phone;
};

/**
 * Extracts primary category from place types
 * @param {Array} types - Array of place types
 * @returns {string} - Primary category name
 */
export const getPrimaryCategory = (types) => {
  if (!types || !Array.isArray(types) || types.length === 0) {
    return 'Business';
  }

  // Priority categories for display
  const priorityTypes = [
    'restaurant', 'cafe', 'bar', 'bakery', 'hotel', 'lodging',
    'beauty_salon', 'spa', 'gym', 'dentist', 'doctor', 'hospital',
    'car_repair', 'car_dealer', 'clothing_store', 'jewelry_store',
    'electronics_store', 'furniture_store', 'florist', 'pet_store'
  ];

  // Find first matching priority type
  const primaryType = types.find(type => priorityTypes.includes(type));

  if (primaryType) {
    // Convert snake_case to Title Case
    return primaryType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Fallback to first type
  return types[0]
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Status options for leads
 */
export const LEAD_STATUSES = [
  { value: 'New', label: 'New', color: 'bg-cyan-400' },
  { value: 'Contacted', label: 'Contacted', color: 'bg-fuchsia-500' },
  { value: 'Lead', label: 'Lead', color: 'bg-emerald-400' }
];

/**
 * Normalizes legacy lead statuses into the current 3-status model.
 * Keeps older saved leads readable without requiring a DB migration.
 * @param {string} status
 * @returns {'New' | 'Contacted' | 'Lead'}
 */
export const normalizeLeadStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();

  if (!normalized) return 'New';
  if (normalized === 'new') return 'New';
  if (normalized === 'contacted') return 'Contacted';
  if (normalized === 'lead') return 'Lead';

  // Legacy statuses collapse into "Lead"
  if (normalized === 'qualified' || normalized === 'interested' || normalized === 'closed') return 'Lead';

  return 'New';
};

/**
 * Gets status meta (label/color) for any status (including legacy ones).
 * @param {string} status
 */
export const getLeadStatusMeta = (status) => {
  const normalized = normalizeLeadStatus(status);
  return LEAD_STATUSES.find(s => s.value === normalized) || LEAD_STATUSES[0];
};

/**
 * Gets status color class
 * @param {string} status - Lead status
 * @returns {string} - Tailwind color class
 */
export const getStatusColor = (status) => {
  return getLeadStatusMeta(status).color;
};


/**
 * Sends a WhatsApp outreach message (image + caption) through the ClientHunter
 * backend, which proxies to HostGrap.
 *
 * Returns: { success, errorCode?, errorMessage?, imageSent }
 *  - imageSent === false means the image step failed but the text was sent anyway.
 */
export const handleWhatsAppCommunication = async (phone, businessName, category, customMessage) => {
  const message = customMessage?.trim() || buildOutreachMessage(businessName);
  const imageUrl = getAbsoluteSampleImageUrl(category);

  const apiError = (err) => ({
    success: false,
    errorCode: err instanceof WhatsAppApiError ? err.code : 'unknown',
    errorMessage: err?.message || 'WhatsApp send failed',
  });

  // Try image+caption first (single HostGrap call). If no image is available,
  // or the image send fails, fall back to a plain text message.
  if (imageUrl) {
    try {
      await sendWhatsAppImage(phone, imageUrl, message);
      return { success: true, imageSent: true };
    } catch (err) {
      console.warn('[whatsapp] image send failed, falling back to text:', err);
      try {
        await sendWhatsAppText(phone, message);
        return { success: true, imageSent: false };
      } catch (textErr) {
        return { ...apiError(textErr), imageSent: false };
      }
    }
  }

  try {
    await sendWhatsAppText(phone, message);
    return { success: true, imageSent: false };
  } catch (err) {
    return { ...apiError(err), imageSent: false };
  }
};

/**
 * Opens the lead in wa.me as a manual fallback (no API needed).
 * Used by the "Open manually" option when the API path fails or the user
 * wants to compose the message themselves.
 */
export const openWhatsAppManually = (phone, businessName) => {
  const message = buildOutreachMessage(businessName);
  const url = getWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
};