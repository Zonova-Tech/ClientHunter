// Utilities for mapping a business category to a sample image living in
// `public/sample-images/samples/` and copying it to the clipboard.

const SAMPLE_IMAGE_FILES = [
  'Apartments.png',
  'ATM.png',
  'Bakeries.png',
  'Banks.png',
  'Bar.png',
  'Beaches.png',
  'Book Stores.png',
  'Bus Station.png',
  'Bus stops.png',
  'Cafe.png',
  'Car dealers.png',
  'Car repair.png',
  'Car Wash.png',
  'cinema.png',
  'clothing stores.png',
  'Construction companies.png',
  'Convension Center.png',
  'Courts.png',
  'Coworking spaces.png',
  'Dentists.png',
  'Doctors.png',
  'Event venues.png',
  'Events Venue.png',
  'Fast food.png',
  'Fire stations.png',
  'Fuel stations.png',
  'Government Offices.png',
  'Gyms.png',
  'Home Servises .png',
  'Hospitals.png',
  'Hotels.png',
  'insurance office.png',
  'IT Company.png',
  'Library.png',
  'Museums.png',
  'Parking.png',
  'Parks.png',
  'phamecy.png',
  'place of worship.png',
  'playgrounds.png',
  'Police Stations.png',
  'post office.png',
  'Printing Services.png',
  'Real estate.png',
  'Repair services.png',
  'Salons.png',
  'Schools.png',
  'Shoppingmalls.png',
  'Software companies.png',
  'Spa.png',
  'stadium.png',
  'Supermarkets.png',
  'Taxi services.png',
  'theaters.png',
  'Tiution clasess.png',
  'Tourist attractions.png',
  'Train Station.png',
  'universities.png',
  'wedding hall.png',
  'werehouse.png',
  'Yoga Centers.png',
  'Zoo.png'
];

const normalizeKey = (value) => {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '');
};

const fileBaseName = (filename) => filename.replace(/\.[a-z0-9]+$/i, '');

const normalizedToFile = (() => {
  const map = new Map();
  for (const file of SAMPLE_IMAGE_FILES) {
    map.set(normalizeKey(fileBaseName(file)), file);
  }
  return map;
})();

// Hand-curated aliases for common Google Places category names → your sample filenames.
const CATEGORY_ALIASES = {
  hotel: 'Hotels.png',
  lodging: 'Hotels.png',
  bank: 'Banks.png',
  bakery: 'Bakeries.png',
  bar: 'Bar.png',
  cafe: 'Cafe.png',
  restaurant: 'Fast food.png',
  fastfood: 'Fast food.png',
  beauty: 'Salons.png',
  beautysalon: 'Salons.png',
  salon: 'Salons.png',
  spa: 'Spa.png',
  gym: 'Gyms.png',
  doctor: 'Doctors.png',
  dentist: 'Dentists.png',
  hospital: 'Hospitals.png',
  pharmacy: 'phamecy.png',
  carrepair: 'Car repair.png',
  cardealer: 'Car dealers.png',
  supermarket: 'Supermarkets.png',
  shoppingmall: 'Shoppingmalls.png'
};

const guessPluralVariants = (normalized) => {
  const variants = new Set([normalized]);

  // Add/remove trailing s
  if (normalized.endsWith('s')) variants.add(normalized.slice(0, -1));
  else variants.add(`${normalized}s`);

  // -y → -ies
  if (normalized.endsWith('y')) variants.add(`${normalized.slice(0, -1)}ies`);

  // -es common plural
  variants.add(`${normalized}es`);

  return [...variants];
};

export const getSampleImageFileForCategory = (category) => {
  const normalized = normalizeKey(category);
  if (!normalized) return null;

  // 1) Alias mapping
  if (CATEGORY_ALIASES[normalized]) return CATEGORY_ALIASES[normalized];

  // 2) Direct match
  if (normalizedToFile.has(normalized)) return normalizedToFile.get(normalized);

  // 3) Try plural/singular variants
  for (const variant of guessPluralVariants(normalized)) {
    if (CATEGORY_ALIASES[variant]) return CATEGORY_ALIASES[variant];
    if (normalizedToFile.has(variant)) return normalizedToFile.get(variant);
  }

  // 4) Last resort: substring match (pick the shortest candidate)
  let best = null;
  for (const [key, file] of normalizedToFile.entries()) {
    if (key.includes(normalized) || normalized.includes(key)) {
      if (!best || key.length < best.key.length) best = { key, file };
    }
  }

  return best?.file ?? null;
};

export const getSampleImageUrlForCategory = (category) => {
  const file = getSampleImageFileForCategory(category);
  if (!file) return null;
  return `/sample-images/samples/${encodeURIComponent(file)}`;
};

export const copySampleImageToClipboard = async (category) => {
  const url = getSampleImageUrlForCategory(category);
  if (!url) {
    return { success: false, message: `No sample image found for "${category}".` };
  }

  // Must be user-initiated (button click) for most browsers.
  const ClipboardItemCtor = window?.ClipboardItem;

  // If we can copy an image blob, do that.
  if (navigator?.clipboard?.write && ClipboardItemCtor) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch sample image (${response.status}).`);

    const blob = await response.blob();
    const mimeType = blob.type || 'image/png';

    await navigator.clipboard.write([
      new ClipboardItemCtor({ [mimeType]: blob })
    ]);

    return { success: true, message: 'Sample image copied to clipboard.', url };
  }

  // Fallback: copy the URL
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return { success: true, message: 'Clipboard does not support image copy; copied image URL instead.', url };
  }

  return { success: false, message: 'Clipboard API not available in this browser.', url };
};

export const __SAMPLE_IMAGE_FILES = SAMPLE_IMAGE_FILES;
