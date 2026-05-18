// One-shot harvester: scans Sri Lanka for active florists via the same Places
// SDK the manual Find Leads view already loads. Returns a deduped list of
// outreach-ready leads (only those with a valid SL mobile number).

import { detectLanguage } from './languageDetector';

/**
 * Region × keyword matrix. Chosen for broad coverage with ~10 queries to keep
 * the Places API spend low. Each textSearch returns up to ~20 results.
 */
const QUERIES = [
  'florist in Colombo, Sri Lanka',
  'flower shop in Gampaha, Sri Lanka',
  'florist in Kandy, Sri Lanka',
  'flower shop in Galle, Sri Lanka',
  'florist in Negombo, Sri Lanka',
  'flower shop in Jaffna, Sri Lanka',
  'florist in Kurunegala, Sri Lanka',
  'flower shop in Anuradhapura, Sri Lanka',
  'florist in Matara, Sri Lanka',
  'flower shop in Ratnapura, Sri Lanka',
  'wedding florist Sri Lanka',
  'flower delivery Sri Lanka',
];

const PLACES_FIELDS = [
  'place_id',
  'name',
  'formatted_phone_number',
  'international_phone_number',
  'formatted_address',
  'business_status',
  'rating',
  'user_ratings_total',
];

/**
 * Normalizes a Sri Lankan mobile string to E.164 (+947XXXXXXXX).
 * Returns null for landlines, foreign numbers, or unparseable input.
 */
export function normalizeSriLankanMobile(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  // Strip leading 94 / 0 prefixes
  let mobile = digits;
  if (mobile.startsWith('94')) mobile = mobile.slice(2);
  else if (mobile.startsWith('0')) mobile = mobile.slice(1);
  // SL mobile = 9 digits starting with 7
  if (mobile.length !== 9 || !mobile.startsWith('7')) return null;
  return `+94${mobile}`;
}

function extractCity(formattedAddress) {
  if (!formattedAddress) return '';
  // Address usually like "..., Colombo 03, Sri Lanka". Take the segment before "Sri Lanka".
  const parts = formattedAddress.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return '';
  const lastTwo = parts.slice(-2);
  if (/sri lanka/i.test(lastTwo[lastTwo.length - 1])) {
    return lastTwo[0] || '';
  }
  return parts[parts.length - 1];
}

function waitForMapsReady(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.google?.maps?.places) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error('Google Maps SDK not ready'));
      setTimeout(check, 250);
    };
    check();
  });
}

function textSearch(service, query) {
  return new Promise((resolve) => {
    service.textSearch({ query }, (results, status) => {
      const ok =
        status === window.google.maps.places.PlacesServiceStatus.OK ||
        status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS;
      resolve(ok ? results || [] : []);
    });
  });
}

function getDetails(service, placeId) {
  return new Promise((resolve) => {
    service.getDetails({ placeId, fields: PLACES_FIELDS }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        resolve(place);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Harvests florists across Sri Lanka. Reports progress via `onProgress(info)`.
 *
 * Returns: [{ placeId, shopName, city, phoneE164, rawPhone, address, rating }]
 */
export async function harvestFlorists({ onProgress } = {}) {
  await waitForMapsReady();
  const service = new window.google.maps.places.PlacesService(document.createElement('div'));
  const seen = new Map();
  let totalQueries = QUERIES.length;
  let qIndex = 0;

  for (const query of QUERIES) {
    qIndex++;
    onProgress?.({
      phase: 'search',
      queryIndex: qIndex,
      totalQueries,
      currentQuery: query,
      uniqueFound: seen.size,
    });

    const results = await textSearch(service, query);
    for (const r of results) {
      if (!r.place_id || seen.has(r.place_id)) continue;
      seen.set(r.place_id, r);
    }
  }

  // Fetch details only for unique placeIds.
  const candidates = Array.from(seen.values());
  const leads = [];
  let detailIndex = 0;

  for (const candidate of candidates) {
    detailIndex++;
    onProgress?.({
      phase: 'details',
      detailIndex,
      totalDetails: candidates.length,
      uniqueFound: leads.length,
    });

    const details = await getDetails(service, candidate.place_id);
    if (!details) continue;
    if (details.business_status && details.business_status !== 'OPERATIONAL') continue;

    const rawPhone =
      details.international_phone_number || details.formatted_phone_number || '';
    const phoneE164 = normalizeSriLankanMobile(rawPhone);
    if (!phoneE164) continue; // landline or no phone — not WhatsApp-reachable

    const shopName = details.name || 'Florist';
    const address = details.formatted_address || '';
    const language = detectLanguage({
      shopName,
      address,
      rating: details.rating,
      ratingCount: details.user_ratings_total,
    });

    leads.push({
      placeId: details.place_id,
      shopName,
      city: extractCity(address),
      phoneE164,
      rawPhone,
      address,
      rating: details.rating ?? null,
      ratingCount: details.user_ratings_total ?? null,
      language,
    });
  }

  onProgress?.({
    phase: 'done',
    totalDetails: candidates.length,
    uniqueFound: leads.length,
  });

  return leads;
}
