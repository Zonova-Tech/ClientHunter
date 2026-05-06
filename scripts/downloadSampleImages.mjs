import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('public', 'sample-images', 'samples');

// Public Google Drive folder: https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t
// These file IDs were extracted from the folder (public share link).
const DRIVE_FILES = [
  { name: 'Apartments.png', id: '1lGBlcM0Ort1PoevaDV0f__a7YGTUVfcy' },
  { name: 'ATM.png', id: '1OI1aucFIbM76l2WVWT2fCShpARNM807e' },
  { name: 'Bakeries.png', id: '1GI-ubpZBdjzuYT508k86hvj3yNHRCZjv' },
  { name: 'Banks.png', id: '1yUDmv3pQjKCMoIU20UIKuMUUlozsj3zF' },
  { name: 'Bar.png', id: '1JmDgM7WmVvHkuZ58oNgSj0a8Ol0URDOb' },
  { name: 'Beaches.png', id: '1TEo8vjIs_32XVOpAoShDF6-BNKn-Adhv' },
  { name: 'Book Stores.png', id: '1PvX1mLs4r-VwTzoxPuksdkvkKDA45OTK' },
  { name: 'Bus Station.png', id: '1MEbu9etpPVEWnUuFBbHa0Uek1BPT_2cL' },
  { name: 'Bus stops.png', id: '1FMqwaviL73bFJ9GQp6MRPYcyMOmdjpBB' },
  { name: 'Cafe.png', id: '13tlWpTcnvS9rNpkq9U4_g2rg2Fzn34jy' },
  { name: 'Car dealers.png', id: '1mHehmja_LlDd4xzvi4R5DL_ddgah1ZvT' },
  { name: 'Car repair.png', id: '1XP2rtAj01rIaV6iaWF9JIyx-EAwpWGyq' },
  { name: 'Car Wash.png', id: '16VwH6v23cJ06W3ey4oPuX0MkUG40Ipxg' },
  { name: 'cinema.png', id: '1qDaHNl-UO29jGffqFsqpPB9Gy4v6QRBJ' },
  { name: 'clothing stores.png', id: '1uy1tuNFiAcHOBVABoGR7HKHaQrJ9bn04' },
  { name: 'Construction companies.png', id: '1hdCl4uk8BVQva_BPG_daJmgZmocbTLJx' },
  { name: 'Convension Center.png', id: '1h4cpvgOhkrT1MARLYLDOx7Rh_4-5TNHe' },
  { name: 'Courts.png', id: '1oMgjg2Fdj48KUi5h96ox5_sX0BNP9S8T' },
  { name: 'Coworking spaces.png', id: '1Dlhyi4R4yh-0S1hiK8y-3V00oYWzInty' },
  { name: 'Dentists.png', id: '1T978m0b7Gyup2HaSWw01vrPyOJoM9gvO' },
  { name: 'Doctors.png', id: '1vODtMjSiO_ol9FY2nB116UUHyJwm9oTv' },
  { name: 'Event venues.png', id: '1b0J7x_EmrC-ASWwE_EgPS71F9Tvm7ZF5' },
  { name: 'Events Venue.png', id: '1o68GXpJw6wM7MpWJmJLQrxirsY_-2NMU' },
  { name: 'Fast food.png', id: '1J-jLOAigXlOVDGTfhr8X_L9Wex5sSIoO' },
  { name: 'Fire stations.png', id: '1Yz8jqpOj0gksQgygHEPMcm-5YU82NVuH' },
  { name: 'Fuel stations.png', id: '1Ls6U_lOEZLFkuRVU0zj3ILKr8t-6jh-n' },
  { name: 'Government Offices.png', id: '1exhANJlaffbiCykA20BgB_flpvP8Z1qD' },
  { name: 'Gyms.png', id: '1DirMshrRc7FaBI4S2KSVt-oUpQ9ruIfO' },
  { name: 'Home Servises .png', id: '1O64KtWCchb7bIxFJCMKGlZORuLS6vOCw' },
  { name: 'Hospitals.png', id: '1gjIFHBAnPZ6kGLqwfkWnbazI8Cv7yLvA' },
  { name: 'Hotels.png', id: '1bSPbVihys0nlAEIqeaFigFXUIJG8xbSo' },
  { name: 'insurance office.png', id: '1JBqSoMBxHFwoZtjWySJUIFWCxeAz3QNt' },
  { name: 'IT Company.png', id: '1trdG1sDkW3ZqwgJEVY2AO2_SMz_y-XzV' },
  { name: 'Library.png', id: '1_yGowZUI33WOlbdUoZTFlxiAYklSN5Jm' },
  { name: 'Museums.png', id: '1hFRebN-TmsfnxHUpkV6piNMxQVMH_AvT' },
  { name: 'Parking.png', id: '1B2bN3trnROWkRYQ-HosWF7dLQoPz5x3t' },
  { name: 'Parks.png', id: '115U3u1wU48rDCOFnRvbuUozV4uLfmVUR' },
  { name: 'phamecy.png', id: '1vxeiFtPBtKRiLz4e0l7qFRcx0OL90pSn' },
  { name: 'place of worship.png', id: '1Jkh7xVyqD5QwtCtAheBF3LQbiUVs76NL' },
  { name: 'playgrounds.png', id: '1UZzLIDQ_oJU4eIJEv5RrXtcds1bWf6KA' },
  { name: 'Police Stations.png', id: '1n9BRwCV_Cst2E7_L1ffqGAJv0ns9gC57' },
  { name: 'post office.png', id: '1lykUfZINcNqab8fBFz9eimBlzfyO5HAx' },
  { name: 'Printing Services.png', id: '1EI4Gpb9AxIuybdjqC8S74diM7gErodTv' },
  { name: 'Real estate.png', id: '1eecmTFB7uv8lHOgWp5Uvrje_65SKMtde' },
  { name: 'Repair services.png', id: '1XH4YIJ8ZpzMFf2tgVyz2hXCuaUJyKeKV' },
  { name: 'Salons.png', id: '1zXwxvBvAGaETtYSJwJNiEvN8QPtsLv4l' },
  { name: 'Schools.png', id: '1GEeT_snJ27BkGc6nBAFalsm8heX_0rjU' },
  { name: 'Shoppingmalls.png', id: '1H0QoF3ODyJk8CE4hTxsMXKyQhGsaVFIu' },
  { name: 'Software companies.png', id: '1cn8fiX2mLdGHNYLJoiy2PVhSdnPNOIxL' },
  { name: 'Spa.png', id: '1g4y-LozjlX_F0z4zjX61oYJmaB2hHUjW' },
  { name: 'stadium.png', id: '1Rkk6XGKQd9rk6BpcI2NF1NKgtwYAeUHy' },
  { name: 'Supermarkets.png', id: '15owilFrasC0W5YlYUU70kNQvBA-Z_rAM' },
  { name: 'Taxi services.png', id: '1HW2phvYpFqhAFWyTM-HqWIwGq_DSdZUb' },
  { name: 'theaters.png', id: '1JdQMRhuGtVuubYCllIguL_YGYtIi7TNh' },
  { name: 'Tiution clasess.png', id: '1Se80un26bnVrLyNRSOe-OHSf8UIB4rrP' },
  { name: 'Tourist attractions.png', id: '1KvXuhR-UKsMRXa4-LNm4G33E4S-r7JO5' },
  { name: 'Train Station.png', id: '1cDWbXd_lf6thQmXpvTDE2eTcvKi2vGzK' },
  { name: 'universities.png', id: '1Qra9aw42Zz8xptr6B8fUNR-fUCAOV2ch' },
  { name: 'wedding hall.png', id: '1DK28Bpjt2H6qAlgUA7xreQHZ7h1oY590' },
  { name: 'werehouse.png', id: '15HZTYwreEpqUXKnMSLzPsAF_Bm3GBDxC' },
  { name: 'Yoga Centers.png', id: '1W-vALCEKGPVBDoMz7385vsPV7b9XO3LM' },
  { name: 'Zoo.png', id: '150ACUw-Py-iBwQ-dyfiG8csWAX03dUHK' },
];

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 5;

const driveDownloadUrl = (id) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;

const fileExistsNonEmpty = async (filePath) => {
  try {
    const s = await stat(filePath);
    return s.isFile() && s.size > 0;
  } catch {
    return false;
  }
};

const downloadFile = async ({ name, id }) => {
  const outPath = path.join(OUTPUT_DIR, name);

  if (!FORCE && (await fileExistsNonEmpty(outPath))) {
    return { name, skipped: true };
  }

  const res = await fetch(driveDownloadUrl(id), { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${name}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) {
    throw new Error(`Downloaded 0 bytes for ${name}`);
  }

  await writeFile(outPath, buf);
  return { name, bytes: buf.length };
};

const runPool = async (items, worker, concurrency) => {
  const results = [];
  let index = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      results.push(await worker(current));
      // small yield to keep things responsive
      await new Promise((r) => setTimeout(r, 10));
    }
  });

  await Promise.all(runners);
  return results;
};

await mkdir(OUTPUT_DIR, { recursive: true });

console.log(`Downloading ${DRIVE_FILES.length} images to ${OUTPUT_DIR}`);
console.log(FORCE ? 'Mode: force re-download' : 'Mode: skip existing');

let downloaded = 0;
let skipped = 0;

try {
  const results = await runPool(
    DRIVE_FILES,
    async (f) => {
      const r = await downloadFile(f);
      if (r.skipped) {
        skipped++;
        console.log(`skip  ${r.name}`);
      } else {
        downloaded++;
        console.log(`done  ${r.name} (${Math.round(r.bytes / 1024)} KB)`);
      }
      return r;
    },
    CONCURRENCY
  );

  // sanity
  if (!results.length) throw new Error('No results');

  console.log(`\nSummary: downloaded ${downloaded}, skipped ${skipped}`);
} catch (err) {
  console.error('\nDownload failed:', err);
  process.exitCode = 1;
}
