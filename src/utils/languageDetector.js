// Classifies a Sri Lankan business into si | ta | en based on geography, name,
// and review profile. Runs at harvest time in the browser. Results stored on
// the lead doc so the scheduler doesn't have to re-classify at send time.
//
// This is heuristic. Misclassifications are expected — the UI exposes a manual
// override per lead. Tune the lists below as we learn from real campaigns.

// Tamil-majority regions. Matched against address case-insensitively.
const TAMIL_REGIONS = [
  'jaffna',
  'kilinochchi',
  'mullaitivu',
  'mannar',
  'vavuniya',
  'batticaloa',
  'trincomalee',
  // Hill country plantation Tamil communities
  'hatton',
  'talawakelle',
  'nuwara eliya', // mixed, defaults to Tamil for traditional shops
];

// Tokens in a shop name that strongly suggest Tamil-speaking ownership.
const TAMIL_NAME_TOKENS = [
  'malar',
  'pookkadai',
  'pookadai',
  'pookal',
  'pookkal',
  'poo',
  'roja',
  'thamarai',
  'iyer',
  'pillai',
  'kandaswamy',
];

// Tokens that strongly suggest Sinhala-speaking ownership.
const SINHALA_NAME_TOKENS = [
  'hewamal',
  'sevana',
  'pokuna',
  'manel',
  'olu',
  'nelum',
  'araliya',
  'aluth',
  'siri',
  'lanka',
  'kade',
  'mal kade',
];

// English-cosmopolitan signals — shops styling themselves for international clients.
const ENGLISH_NAME_TOKENS = [
  'florist',
  'flowers',
  'boutique',
  'petals',
  'stems',
  'garden',
  'blossom',
  'bloom',
  'design',
  'studio',
  'gallery',
  'co.',
  '& co',
  'and co',
];

function lc(s) {
  return (s || '').toLowerCase();
}

function regionLanguage(address) {
  const a = lc(address);
  return TAMIL_REGIONS.some((r) => a.includes(r)) ? 'ta' : 'si';
}

function nameSignal(shopName) {
  const n = lc(shopName);
  const tokens = n.split(/[\s,.\-_'"&()]+/).filter(Boolean);

  let ta = 0;
  let si = 0;
  let en = 0;

  for (const t of tokens) {
    if (TAMIL_NAME_TOKENS.includes(t)) ta++;
    if (SINHALA_NAME_TOKENS.includes(t)) si++;
    if (ENGLISH_NAME_TOKENS.includes(t)) en++;
  }

  if (ta > 0 && ta >= si) return 'ta';
  if (si > 0 && si > ta) return 'si';
  if (en > 0 && ta === 0 && si === 0) return 'en';
  return null;
}

function isUpscale(rating, ratingCount) {
  return (rating || 0) >= 4.5 && (ratingCount || 0) >= 500;
}

/**
 * Returns 'si' | 'ta' | 'en' for a lead. Defaults to 'si' (majority language) when nothing matches.
 * The detector is intentionally generous toward keeping Sinhala/Tamil for small shops
 * and only escalates to English for clearly upscale + English-styled brands.
 */
export function detectLanguage({ shopName, address, rating, ratingCount }) {
  const name = nameSignal(shopName);
  const upscale = isUpscale(rating, ratingCount);

  // Name signal wins if confident.
  if (name === 'ta') return 'ta';
  if (name === 'si') return 'si';

  // Upscale + English-styled name → English.
  if (name === 'en' && upscale) return 'en';

  // Otherwise geography decides.
  const region = regionLanguage(address);

  // Very upscale shops in Colombo lean English even without an English name.
  if (upscale && region === 'si' && /colombo/i.test(address || '')) return 'en';

  return region;
}

export const LANGUAGE_LABELS = {
  si: 'Sinhala',
  ta: 'Tamil',
  en: 'English',
};
