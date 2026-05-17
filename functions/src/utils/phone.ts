const SRI_LANKAN_MOBILE_PATTERNS = [/^947\d{8}$/];

export function normalizeSriLankanMobile(phone: string | undefined): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.slice(1);
  } else if (!cleaned.startsWith('94')) {
    cleaned = '94' + cleaned;
  }
  return SRI_LANKAN_MOBILE_PATTERNS.some((re) => re.test(cleaned)) ? cleaned : null;
}
