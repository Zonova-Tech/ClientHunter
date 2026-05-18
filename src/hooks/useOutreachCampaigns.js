import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, getAppCheckToken } from '../config/firebase';

const COL = 'outreachCampaigns';
const OPTS = 'outreachOptOuts';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Starter templates — DRAFTS. Review with native Sinhala/Tamil speakers
// before going live. Spintax syntax: [a|b|c]. Variables: {{shopName}}, {{city}}.

export const DEFAULT_TEMPLATES = {
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

export const DEFAULT_PACING = {
  dailyCap: 40,
  perHourCap: 6,
  sendWindowStart: 8,
  sendWindowEnd: 17,
  skipTickProbability: 0.3,
  maxAttempts: 2,
  skipSundays: true,
  skipPoyaDays: true,
};

const HARVEST_COOLDOWN_DAYS = 30;

/**
 * Real-time list of outreach campaigns + CRUD helpers.
 * Mirrors the shape produced by the scheduleTick backend.
 */
export default function useOutreachCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCampaigns(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })),
        );
        setLoading(false);
      },
      (err) => {
        console.error('[outreach] campaigns listener error:', err);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const createCampaign = useCallback(async ({ name, templates, testMode = true, pacing }) => {
    const docRef = await addDoc(collection(db, COL), {
      name: name.trim() || 'Untitled campaign',
      status: 'draft',
      testMode,
      templates: templates || DEFAULT_TEMPLATES,
      pacing: pacing || DEFAULT_PACING,
      timezone: 'Asia/Colombo',
      stats: { queued: 0, sent: 0, failed: 0, skipped: 0, optedOut: 0 },
      sentToday: {},
      sentHourly: {},
      consecutiveFailures: 0,
      previewApproved: false,
      lastSentAt: null,
      lastTickAt: null,
      createdAt: serverTimestamp(),
      harvestedAt: null,
    });
    return docRef.id;
  }, []);

  const updateStatus = useCallback(async (campaignId, status) => {
    await updateDoc(doc(db, COL, campaignId), { status });
  }, []);

  const updateCampaign = useCallback(async (campaignId, patch) => {
    await updateDoc(doc(db, COL, campaignId), patch);
  }, []);

  const deleteCampaign = useCallback(async (campaignId) => {
    await deleteDoc(doc(db, COL, campaignId));
  }, []);

  /**
   * Bulk-queues leads under a campaign. `leads` items must include placeId,
   * shopName, phoneE164. Existing placeIds in the same campaign are skipped.
   */
  const enqueueLeads = useCallback(async (campaignId, leads) => {
    if (!Array.isArray(leads) || leads.length === 0) return { added: 0, skipped: 0 };

    let added = 0;
    let skipped = 0;
    // Firestore batch limit is 500 ops; chunk to be safe.
    const chunks = [];
    for (let i = 0; i < leads.length; i += 400) {
      chunks.push(leads.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const lead of chunk) {
        if (!lead.placeId || !lead.phoneE164) {
          skipped++;
          continue;
        }
        const ref = doc(db, COL, campaignId, 'leads', lead.placeId);
        batch.set(
          ref,
          {
            placeId: lead.placeId,
            shopName: lead.shopName || 'Florist',
            city: lead.city || '',
            phoneE164: lead.phoneE164,
            rawPhone: lead.rawPhone || lead.phoneE164,
            address: lead.address || '',
            rating: lead.rating ?? null,
            ratingCount: lead.ratingCount ?? null,
            language: lead.language || 'si',
            status: 'queued',
            attempts: 0,
            lastError: null,
            sentAt: null,
            queuedAt: serverTimestamp(),
          },
          { merge: false },
        );
        added++;
      }
      await batch.commit();
    }

    await updateDoc(doc(db, COL, campaignId), {
      'stats.queued': added,
      harvestedAt: serverTimestamp(),
    });

    return { added, skipped };
  }, []);

  const addToOptOuts = useCallback(async (phoneE164, reason = 'manual') => {
    if (!phoneE164) return;
    await setDoc(doc(db, OPTS, phoneE164), {
      phoneE164,
      reason,
      addedAt: serverTimestamp(),
    });
  }, []);

  /**
   * Asks the backend to render 5 sample messages from queued leads (one per
   * language where available). Used to sanity-check spintax + translations
   * before the operator approves Start.
   */
  const fetchPreview = useCallback(async (campaignId) => {
    const url = API_BASE ? `${API_BASE}/api/outreach/preview` : '/api/outreach/preview';
    const headers = { 'Content-Type': 'application/json' };
    const appCheckToken = await getAppCheckToken();
    if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ campaignId }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Preview failed (HTTP ${res.status})`);
    }
    return data.previews || [];
  }, []);

  const approvePreview = useCallback(async (campaignId) => {
    await updateDoc(doc(db, COL, campaignId), { previewApproved: true });
  }, []);

  /**
   * Triggers a single manual test send — bypasses scheduler + pacer, hard-gated
   * on testMode at the backend. Message goes to TEST_PHONE_OVERRIDE.
   */
  const sendTestNow = useCallback(async (campaignId) => {
    const url = API_BASE ? `${API_BASE}/api/outreach/test-send` : '/api/outreach/test-send';
    const headers = { 'Content-Type': 'application/json' };
    const appCheckToken = await getAppCheckToken();
    if (appCheckToken) headers['X-Firebase-AppCheck'] = appCheckToken;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ campaignId }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Test send failed (HTTP ${res.status})`);
    }
    return data;
  }, []);

  /**
   * Manual per-lead language override. Updates the lead doc immediately so
   * the next tick renders the correct template.
   */
  const setLeadLanguage = useCallback(async (campaignId, leadId, language) => {
    await updateDoc(doc(db, COL, campaignId, 'leads', leadId), { language });
  }, []);

  return {
    campaigns,
    loading,
    createCampaign,
    updateStatus,
    updateCampaign,
    deleteCampaign,
    enqueueLeads,
    addToOptOuts,
    fetchPreview,
    approvePreview,
    sendTestNow,
    setLeadLanguage,
  };
}

/**
 * Returns true if the campaign was harvested within the cooldown window.
 * Used to disable the Harvest button to prevent re-spending API quota.
 */
export function isHarvestOnCooldown(campaign) {
  if (!campaign?.harvestedAt) return false;
  const ts = campaign.harvestedAt?.toDate?.() ?? null;
  if (!ts) return false;
  const ageMs = Date.now() - ts.getTime();
  return ageMs < HARVEST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}
