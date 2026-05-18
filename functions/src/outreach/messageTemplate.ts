// Renders the per-language campaign template for a given lead, with:
//   - Variable substitution: {{shopName}}, {{city}}
//   - Spintax variation:     [Hi|Hello|Hey] picks one alternative
//   - Deterministic seed:    same leadId → same generated message every time
//
// Output stays semantically identical across variants — anti-spam variation
// is in surface words only. No misleading personalization.

import type { OutreachLead, OutreachCampaign } from './types';

export type Language = 'si' | 'ta' | 'en';

export interface MultiLanguageTemplates {
  si: { body: string };
  ta: { body: string };
  en: { body: string };
}

/**
 * Selects the right template for the lead and renders it.
 * Falls back to English then Sinhala if the lead's language is missing.
 */
export function renderMessageForLead(
  campaign: Pick<OutreachCampaign, 'templates'>,
  lead: Pick<OutreachLead, 'shopName' | 'city' | 'language' | 'placeId'>,
): string {
  const lang: Language = (lead.language as Language) || 'si';
  const tpl = campaign.templates?.[lang]?.body
    ?? campaign.templates?.en?.body
    ?? campaign.templates?.si?.body
    ?? '';

  const rand = seededRandom(lead.placeId || lead.shopName || 'fallback');
  const withSpintax = expandSpintax(tpl, rand);
  return substituteVars(withSpintax, lead);
}

/**
 * Returns a deterministic [0, 1) pseudo-random generator seeded by the lead id.
 * Same lead → same sequence → same generated message on retries. This stops
 * us sending two different-sounding messages if a retry fires.
 */
function seededRandom(seed: string): () => number {
  let h = 2166136261 >>> 0; // FNV-1a-ish seed
  for (let i = 0; i < seed.length; i++) {
    h = (h ^ seed.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    return ((h >>> 16) & 0x7fff) / 0x7fff;
  };
}

/**
 * Replaces [a|b|c] with one of the alternatives, picked via the seeded RNG.
 * Supports flat (non-nested) spintax. Brackets are square so they don't clash
 * with the {{var}} syntax.
 */
export function expandSpintax(text: string, rand: () => number): string {
  return text.replace(/\[([^\[\]]+)\]/g, (match, content: string) => {
    if (!content.includes('|')) return match;
    const options = content.split('|').map((s) => s.trim());
    const idx = Math.floor(rand() * options.length);
    return options[Math.min(idx, options.length - 1)];
  });
}

function substituteVars(
  text: string,
  lead: Pick<OutreachLead, 'shopName' | 'city'>,
): string {
  const vars: Record<string, string> = {
    shopName: (lead.shopName || 'there').trim(),
    city: (lead.city || 'Sri Lanka').trim(),
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match;
  });
}

// ===========================================================================
// Starter templates — DRAFTS. Review with a native Sinhala/Tamil speaker
// before going live. Variation count: si ≈ 96, ta ≈ 96, en ≈ 384.
// ===========================================================================

export const DEFAULT_TEMPLATES: MultiLanguageTemplates = {
  // Sinhala in native script (අකුරු) with English technical terms left in English —
  // the natural mix educated SL business owners use. Reads more polished than Singlish
  // and is accessible to shop owners who don't comfortably read Roman transliteration.
  si: {
    body: [
      '[ආයුබෝවන්|හෙලෝ|සුභ දවසක්] {{shopName}} 🌸',
      '',
      '[මම|අපි] Zonova Flowers වෙතින් සම්බන්ධ වෙනවා. [අපි සකස් කරලා තියෙන්නේ|අපි හදලා තියෙන්නේ] මල් කඩ සඳහා නොමිලේ platform එකක් — online orders, inventory, සහ customer management එක තැනකින් කරන්න පුළුවන්. AI වලින් bouquet images හදන්න පුළුවන් feature එකකුත් තියෙනවා.',
      '',
      '[විනාඩි 5කට බලන්න පුළුවන්ද?|Quick demo එකක් බලන්න කැමතිද?] [කිසිම ගාස්තුවක් නෑ|සම්පූර්ණයෙන්ම නොමිලේ].',
      '',
      '[එපා නම් STOP කියලා reply කරන්න|Interest නැත්නම් STOP reply කරන්න].',
      '— Zonova Team',
    ].join('\n'),
  },
  // Tamil in native script (தமிழ்) with English technical terms left in English —
  // matches how Tamil-speaking SL business owners typically receive professional messages.
  ta: {
    body: [
      '[வணக்கம்|வாழ்த்துக்கள்|நல்வரவு] {{shopName}} 🌸',
      '',
      '[நான்|நாங்கள்] Zonova Flowers-இல் இருந்து தொடர்பு கொள்கிறேன். [நாங்கள் உருவாக்கி இருக்கிறோம்|நாங்கள் build செய்து இருக்கிறோம்] மலர் கடைகளுக்கு ஒரு free platform — online orders, inventory, customers எல்லாம் ஒரே platform-ல் manage செய்ய முடியும். AI மூலம் bouquet images-ஐயும் generate செய்யலாம்.',
      '',
      '[5 நிமிடம் பார்க்க முடியுமா?|Quick demo பார்க்க விருப்பமா?] [எந்த cost-உம் இல்லை|முற்றிலும் free].',
      '',
      '[வேண்டாம் என்றால் STOP reply செய்யுங்கள்|Interest இல்லை என்றால் STOP reply செய்யுங்கள்].',
      '— Zonova Team',
    ].join('\n'),
  },
  // Pure English. Heavier spintax — easy to vary in English.
  en: {
    body: [
      '[Hi|Hello|Good day] {{shopName}},',
      '',
      "[I'm reaching out from|My name's _ from|I'm contacting you on behalf of] Zonova Flowers — [a free platform built for|a new tool we've made for|a free service designed for] flower shops in Sri Lanka.",
      '',
      '[It helps you|You can use it to|It lets you] manage online orders, inventory, and customers in one place, with built-in AI bouquet image generation and a mobile storefront for your shop.',
      '',
      '[Would you be open to a 5-minute look?|Could we show you a quick demo?|Worth a 5-minute look?] [No cost, no commitment.|Free, with no obligation.|It is free to try.]',
      '',
      "[Reply STOP if you'd rather not hear from us.|Reply STOP to opt out.]",
      '— Zonova Team',
    ].join('\n'),
  },
};
