// Full-moon Poya days in Sri Lanka — public holidays, slow business days.
// We skip outreach on these dates out of cultural respect and lower response rates.
//
// Dates published by the Sri Lankan government calendar. Update annually.
// Format: 'YYYY-MM-DD' in Asia/Colombo local date.

const POYA_DAYS_2026 = [
  '2026-01-03', // Duruthu
  '2026-02-01', // Navam
  '2026-03-03', // Medin
  '2026-04-01', // Bak
  '2026-05-01', // Vesak
  '2026-05-31', // Poson
  '2026-06-29', // Esala
  '2026-07-29', // Nikini
  '2026-08-27', // Binara
  '2026-09-25', // Vap
  '2026-10-25', // Ill
  '2026-11-24', // Unduvap
  '2026-12-23', // Duruthu
];

const POYA_DAYS_2027 = [
  '2027-01-22',
  '2027-02-20',
  '2027-03-22',
  '2027-04-20',
  '2027-05-20',
  '2027-06-19',
  '2027-07-18',
  '2027-08-17',
  '2027-09-15',
  '2027-10-15',
  '2027-11-13',
  '2027-12-13',
];

const ALL_POYA_DAYS = new Set([...POYA_DAYS_2026, ...POYA_DAYS_2027]);

export function isPoyaDay(dateYMD: string): boolean {
  return ALL_POYA_DAYS.has(dateYMD);
}
