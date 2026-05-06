// Utilities for mapping a business category to a sample image living in
// `public/sample-images/samples/` and copying it to the clipboard.

// Google Drive-backed sample image IDs.
// NOTE: Browsers cannot fetch Google Drive image bytes due to CORS, so image-copy to clipboard
// only works when images are served from this app (same-origin) via `public/sample-images/samples/`.
// Use `npm run download:samples` to download the Drive folder locally.
export const GOOGLE_DRIVE_CATEGORY_FILE_IDS = {
  apartments: '1lGBlcM0Ort1PoevaDV0f__a7YGTUVfcy',
  atm: '1OI1aucFIbM76l2WVWT2fCShpARNM807e',
  bakeries: '1GI-ubpZBdjzuYT508k86hvj3yNHRCZjv',
  banks: '1yUDmv3pQjKCMoIU20UIKuMUUlozsj3zF',
  bar: '1JmDgM7WmVvHkuZ58oNgSj0a8Ol0URDOb',
  beaches: '1TEo8vjIs_32XVOpAoShDF6-BNKn-Adhv',
  bookstores: '1PvX1mLs4r-VwTzoxPuksdkvkKDA45OTK',
  busstation: '1MEbu9etpPVEWnUuFBbHa0Uek1BPT_2cL',
  busstops: '1FMqwaviL73bFJ9GQp6MRPYcyMOmdjpBB',
  cafe: '13tlWpTcnvS9rNpkq9U4_g2rg2Fzn34jy',
  cardealers: '1mHehmja_LlDd4xzvi4R5DL_ddgah1ZvT',
  carrepair: '1XP2rtAj01rIaV6iaWF9JIyx-EAwpWGyq',
  carwash: '16VwH6v23cJ06W3ey4oPuX0MkUG40Ipxg',
  cinema: '1qDaHNl-UO29jGffqFsqpPB9Gy4v6QRBJ',
  clothingstores: '1uy1tuNFiAcHOBVABoGR7HKHaQrJ9bn04',
  constructioncompanies: '1hdCl4uk8BVQva_BPG_daJmgZmocbTLJx',
  convensioncenter: '1h4cpvgOhkrT1MARLYLDOx7Rh_4-5TNHe',
  courts: '1oMgjg2Fdj48KUi5h96ox5_sX0BNP9S8T',
  coworkingspaces: '1Dlhyi4R4yh-0S1hiK8y-3V00oYWzInty',
  dentists: '1T978m0b7Gyup2HaSWw01vrPyOJoM9gvO',
  doctors: '1vODtMjSiO_ol9FY2nB116UUHyJwm9oTv',
  eventvenues: '1b0J7x_EmrC-ASWwE_EgPS71F9Tvm7ZF5',
  eventsvenue: '1o68GXpJw6wM7MpWJmJLQrxirsY_-2NMU',
  fastfood: '1J-jLOAigXlOVDGTfhr8X_L9Wex5sSIoO',
  firestations: '1Yz8jqpOj0gksQgygHEPMcm-5YU82NVuH',
  fuelstations: '1Ls6U_lOEZLFkuRVU0zj3ILKr8t-6jh-n',
  governmentoffices: '1exhANJlaffbiCykA20BgB_flpvP8Z1qD',
  gyms: '1DirMshrRc7FaBI4S2KSVt-oUpQ9ruIfO',
  homeservises: '1O64KtWCchb7bIxFJCMKGlZORuLS6vOCw',
  hospitals: '1gjIFHBAnPZ6kGLqwfkWnbazI8Cv7yLvA',
  hotels: '1bSPbVihys0nlAEIqeaFigFXUIJG8xbSo',
  insuranceoffice: '1JBqSoMBxHFwoZtjWySJUIFWCxeAz3QNt',
  itcompany: '1trdG1sDkW3ZqwgJEVY2AO2_SMz_y-XzV',
  library: '1_yGowZUI33WOlbdUoZTFlxiAYklSN5Jm',
  museums: '1hFRebN-TmsfnxHUpkV6piNMxQVMH_AvT',
  parking: '1B2bN3trnROWkRYQ-HosWF7dLQoPz5x3t',
  parks: '115U3u1wU48rDCOFnRvbuUozV4uLfmVUR',
  phamecy: '1vxeiFtPBtKRiLz4e0l7qFRcx0OL90pSn',
  placeofworship: '1Jkh7xVyqD5QwtCtAheBF3LQbiUVs76NL',
  playgrounds: '1UZzLIDQ_oJU4eIJEv5RrXtcds1bWf6KA',
  policestations: '1n9BRwCV_Cst2E7_L1ffqGAJv0ns9gC57',
  postoffice: '1lykUfZINcNqab8fBFz9eimBlzfyO5HAx',
  printingservices: '1EI4Gpb9AxIuybdjqC8S74diM7gErodTv',
  realestate: '1eecmTFB7uv8lHOgWp5Uvrje_65SKMtde',
  repairservices: '1XH4YIJ8ZpzMFf2tgVyz2hXCuaUJyKeKV',
  salons: '1zXwxvBvAGaETtYSJwJNiEvN8QPtsLv4l',
  schools: '1GEeT_snJ27BkGc6nBAFalsm8heX_0rjU',
  shoppingmalls: '1H0QoF3ODyJk8CE4hTxsMXKyQhGsaVFIu',
  softwarecompanies: '1cn8fiX2mLdGHNYLJoiy2PVhSdnPNOIxL',
  spa: '1g4y-LozjlX_F0z4zjX61oYJmaB2hHUjW',
  stadium: '1Rkk6XGKQd9rk6BpcI2NF1NKgtwYAeUHy',
  supermarkets: '15owilFrasC0W5YlYUU70kNQvBA-Z_rAM',
  taxiservices: '1HW2phvYpFqhAFWyTM-HqWIwGq_DSdZUb',
  theaters: '1JdQMRhuGtVuubYCllIguL_YGYtIi7TNh',
  tiutionclasess: '1Se80un26bnVrLyNRSOe-OHSf8UIB4rrP',
  touristattractions: '1KvXuhR-UKsMRXa4-LNm4G33E4S-r7JO5',
  trainstation: '1cDWbXd_lf6thQmXpvTDE2eTcvKi2vGzK',
  universities: '1Qra9aw42Zz8xptr6B8fUNR-fUCAOV2ch',
  weddinghall: '1DK28Bpjt2H6qAlgUA7xreQHZ7h1oY590',
  werehouse: '15HZTYwreEpqUXKnMSLzPsAF_Bm3GBDxC',
  yogacenters: '1W-vALCEKGPVBDoMz7385vsPV7b9XO3LM',
  zoo: '150ACUw-Py-iBwQ-dyfiG8csWAX03dUHK',
};

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

const getGoogleDriveDownloadUrl = (fileId) => {
  if (!fileId) return null;

  // `drive.googleusercontent.com` tends to behave better for direct content fetches.
  // Fetch will follow redirects; files must be publicly accessible.
  return `https://drive.googleusercontent.com/uc?id=${encodeURIComponent(fileId)}&export=download`;
};

const getFileExtensionFromMime = (mimeType) => {
  if (!mimeType) return 'png';
  const normalized = String(mimeType).toLowerCase();
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  return 'png';
};

const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
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
  shoppingmall: 'Shoppingmalls.png',
  homeservices: 'Home Servises .png',
  tuitionclasses: 'Tiution clasess.png',
  warehouse: 'werehouse.png'
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

export const getGoogleDriveFileIdForCategory = (category) => {
  const normalized = normalizeKey(category);
  if (!normalized) return null;

  // Try direct normalized key
  if (GOOGLE_DRIVE_CATEGORY_FILE_IDS[normalized]) return GOOGLE_DRIVE_CATEGORY_FILE_IDS[normalized];

  // Reuse local alias logic so e.g. "lodging" can map to "hotel" etc.
  if (CATEGORY_ALIASES[normalized]) {
    const aliasedNormalized = normalizeKey(fileBaseName(CATEGORY_ALIASES[normalized]));
    if (GOOGLE_DRIVE_CATEGORY_FILE_IDS[aliasedNormalized]) return GOOGLE_DRIVE_CATEGORY_FILE_IDS[aliasedNormalized];
  }

  // Try plural/singular variants
  for (const variant of guessPluralVariants(normalized)) {
    if (GOOGLE_DRIVE_CATEGORY_FILE_IDS[variant]) return GOOGLE_DRIVE_CATEGORY_FILE_IDS[variant];
  }

  return null;
};

export const getDriveSampleImageUrlForCategory = (category) => {
  const driveId = getGoogleDriveFileIdForCategory(category);
  return driveId ? getGoogleDriveDownloadUrl(driveId) : null;
};

export const getSampleImageUrlForCategory = (category) => {
  // Prefer same-origin URLs so we can fetch the image bytes (clipboard copy).
  const file = getSampleImageFileForCategory(category);
  if (file) return `/sample-images/samples/${encodeURIComponent(file)}`;
  return getDriveSampleImageUrlForCategory(category);
};

export const copySampleImageToClipboard = async (category, options = {}) => {
  const { download = false } = options;
  const url = getSampleImageUrlForCategory(category);
  if (!url) {
    return { success: false, message: `No sample image found for "${category}".` };
  }

  const driveUrl = getDriveSampleImageUrlForCategory(category);

  // Must be user-initiated (button click) for most browsers.
  const ClipboardItemCtor = window?.ClipboardItem;

  // If we can copy an image blob, do that.
  if (navigator?.clipboard?.write && ClipboardItemCtor) {
    try {
      const response = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const mimeType = blob.type || 'image/png';

      await navigator.clipboard.write([
        new ClipboardItemCtor({ [mimeType]: blob })
      ]);

      if (download) {
        const ext = getFileExtensionFromMime(mimeType);
        const safeBase = normalizeKey(category) || 'sample';
        downloadBlob(blob, `${safeBase}.${ext}`);
      }

      return { success: true, message: 'Sample image copied to clipboard.', url };
    } catch (err) {
      // Google Drive blocks CORS, so we can't fetch bytes from Drive to copy the image.
      // Fall back to copying the URL.
      const fallbackUrl = driveUrl || url;
      if (navigator?.clipboard?.writeText && fallbackUrl) {
        await navigator.clipboard.writeText(fallbackUrl);
        return {
          success: true,
          url: fallbackUrl,
          message:
            'Could not copy the image itself (missing local sample images). Copied the image URL instead. Run `npm run download:samples` to enable image copy.'
        };
      }
      return { success: false, url: fallbackUrl, message: 'Failed to copy sample image.' };
    }
  }

  // Fallback: copy the URL
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return { success: true, message: 'Clipboard does not support image copy; copied image URL instead.', url };
  }

  return { success: false, message: 'Clipboard API not available in this browser.', url };
};

export const __SAMPLE_IMAGE_FILES = SAMPLE_IMAGE_FILES;
