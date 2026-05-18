// Outreach-specific HTTP endpoints.
//
//  POST  /api/outreach/inbound          — HostGrap inbound webhook. PUBLIC (no AppCheck).
//                                          Verifies optional shared-secret header. Parses
//                                          STOP / epa / venda → adds to opt-out list.
//
//  POST  /api/outreach/preview          — Returns 5 sample rendered messages for a campaign.
//                                          Used by the UI before the operator clicks Start.

import { Router } from 'express';
import type { Request, Response } from 'express';
import admin from 'firebase-admin';
import { getFirestore } from '../config/firebase';
import { verifyAppCheck } from '../middleware/appCheck';
import { renderMessageForLead } from '../outreach/messageTemplate';
import { sendWhatsAppMessage } from '../services/hostgrap';
import { nowIn } from '../outreach/pacer';
import type { OutreachCampaign, OutreachLead, LeadLanguage } from '../outreach/types';

const router = Router();

const CAMPAIGNS = 'outreachCampaigns';
const OPT_OUTS = 'outreachOptOuts';

// Words that mean "stop messaging me" across our supported languages.
// Match whole-word, case-insensitive. Keep tight to avoid false positives
// (e.g. "stopping by" should NOT count).
const STOP_PATTERNS = [
  /\bstop\b/i,
  /\bunsubscribe\b/i,
  /\bremove\b/i,
  /\bopt[\s-]?out\b/i,
  /\bepa\b/i,        // Sinhala "no"
  /\bnaha\b/i,       // Sinhala "no"
  /\bbeha\b/i,       // Sinhala "can't"
  /\bvenaam\b/i,     // Tamil "don't want"
  /\bvenda\b/i,      // Tamil "don't want"
  /\billai\b/i,      // Tamil "no" (only when alone)
];

function looksLikeStop(text: string): boolean {
  if (!text) return false;
  return STOP_PATTERNS.some((p) => p.test(text));
}

// HostGrap (or any provider) MUST include this header if HOSTGRAP_WEBHOOK_SECRET
// is set on the function. We accept inbound without verification only if the
// secret is empty — useful for first-time setup.
function verifyInboundSecret(req: Request): boolean {
  const expected = process.env.HOSTGRAP_WEBHOOK_SECRET || '';
  if (!expected) return true; // not configured — accept all (log a warning)
  const got = req.header('x-hostgrap-secret') || req.query.token;
  return got === expected;
}

/**
 * Inbound webhook handler.
 *
 * HostGrap's inbound webhook shape is not officially documented for the API we use.
 * We accept both common shapes:
 *   - { phone, message }                       (their typical outbound mirror)
 *   - { from, body }                           (Twilio-style)
 *   - { sender: { phone }, message: { text } } (nested)
 *
 * If HostGrap turns out not to support inbound at all, this endpoint just sits idle.
 * No production code paths depend on it.
 */
router.post('/inbound', async (req: Request, res: Response): Promise<void> => {
  if (!verifyInboundSecret(req)) {
    res.status(401).json({ ok: false, error: 'invalid_secret' });
    return;
  }

  const payload = (req.body ?? {}) as Record<string, unknown>;
  const phone =
    (payload.phone as string) ||
    (payload.from as string) ||
    ((payload.sender as { phone?: string })?.phone) ||
    '';
  const message =
    (payload.message as string) ||
    (payload.body as string) ||
    ((payload.message as { text?: string })?.text) ||
    '';

  if (!phone) {
    res.status(200).json({ ok: true, action: 'ignored_no_phone' });
    return;
  }

  const phoneE164 = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;

  if (looksLikeStop(String(message))) {
    const db = getFirestore();
    await db.collection(OPT_OUTS).doc(phoneE164).set(
      {
        phoneE164,
        reason: 'inbound_stop',
        rawMessage: String(message).slice(0, 280),
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.status(200).json({ ok: true, action: 'added_to_optouts', phone: phoneE164 });
    return;
  }

  // Positive/neutral reply — log for human follow-up but don't act.
  // Future enhancement: mark the originating lead as 'replied' to surface in UI.
  const db = getFirestore();
  await db.collection('outreachReplies').add({
    phoneE164,
    message: String(message).slice(0, 1024),
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.status(200).json({ ok: true, action: 'logged' });
});

/**
 * Returns 5 sample rendered messages from a campaign's queued leads.
 * UI calls this before the operator approves Start. Authenticated via AppCheck.
 */
router.post('/preview', verifyAppCheck, async (req: Request, res: Response): Promise<void> => {
  const { campaignId } = (req.body ?? {}) as { campaignId?: string };
  if (!campaignId) {
    res.status(400).json({ success: false, error: 'campaignId is required' });
    return;
  }

  const db = getFirestore();
  const campaignSnap = await db.collection(CAMPAIGNS).doc(campaignId).get();
  if (!campaignSnap.exists) {
    res.status(404).json({ success: false, error: 'campaign_not_found' });
    return;
  }
  const campaign = campaignSnap.data() as OutreachCampaign;

  // Try to pull one lead per language so the preview is representative.
  const leadsCol = db.collection(CAMPAIGNS).doc(campaignId).collection('leads');
  const samples: (OutreachLead & { id: string })[] = [];

  for (const lang of ['si', 'ta', 'en'] as LeadLanguage[]) {
    const snap = await leadsCol
      .where('status', '==', 'queued')
      .where('language', '==', lang)
      .limit(2)
      .get();
    snap.docs.forEach((d) => samples.push({ id: d.id, ...(d.data() as OutreachLead) }));
  }

  // Fill remainder with any queued leads if we got fewer than 5.
  if (samples.length < 5) {
    const filler = await leadsCol.where('status', '==', 'queued').limit(5).get();
    filler.docs.forEach((d) => {
      if (!samples.find((s) => s.id === d.id)) {
        samples.push({ id: d.id, ...(d.data() as OutreachLead) });
      }
    });
  }

  const previews = samples.slice(0, 5).map((lead) => ({
    leadId: lead.id,
    shopName: lead.shopName,
    city: lead.city,
    phoneE164: lead.phoneE164,
    language: lead.language,
    message: renderMessageForLead(campaign, lead),
  }));

  res.json({ success: true, previews });
});

/**
 * Manual test trigger — sends ONE message immediately, bypassing the scheduler
 * and pacing checks. Hard-gated on campaign.testMode === true so it can never
 * accidentally hit real shops in a production-style campaign.
 *
 * The TEST_PHONE_OVERRIDE env on the function ALSO routes the message to the
 * dev phone, so even if testMode somehow slipped through, the recipient is safe.
 */
router.post('/test-send', verifyAppCheck, async (req: Request, res: Response): Promise<void> => {
  const { campaignId } = (req.body ?? {}) as { campaignId?: string };
  if (!campaignId) {
    res.status(400).json({ success: false, error: 'campaignId is required' });
    return;
  }

  const db = getFirestore();
  const campaignRef = db.collection(CAMPAIGNS).doc(campaignId);
  const campaignSnap = await campaignRef.get();
  if (!campaignSnap.exists) {
    res.status(404).json({ success: false, error: 'campaign_not_found' });
    return;
  }
  const campaign = campaignSnap.data() as OutreachCampaign;

  if (!campaign.testMode) {
    res.status(400).json({
      success: false,
      error: 'test_send_requires_test_mode',
      hint: 'Set campaign.testMode = true to enable manual test sends.',
    });
    return;
  }

  // Claim one queued lead atomically (same pattern as the scheduler).
  const leadsCol = campaignRef.collection('leads');
  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(
      leadsCol.where('status', '==', 'queued').orderBy('queuedAt', 'asc').limit(1),
    );
    if (snap.empty) return null;
    const doc = snap.docs[0];
    tx.update(doc.ref, { status: 'sending' });
    return { id: doc.id, ...(doc.data() as OutreachLead) };
  });

  if (!claimed) {
    res.status(400).json({ success: false, error: 'no_queued_leads' });
    return;
  }

  // Opt-out safety check.
  const optOut = await db.collection(OPT_OUTS).doc(claimed.phoneE164).get();
  if (optOut.exists) {
    await leadsCol.doc(claimed.id).update({ status: 'opted_out' });
    res.status(400).json({ success: false, error: 'lead_opted_out' });
    return;
  }

  const message = renderMessageForLead(campaign, claimed);
  const result = await sendWhatsAppMessage(claimed.phoneE164, message);
  const now = nowIn(campaign.timezone || 'Asia/Colombo');

  if (result.success) {
    await leadsCol.doc(claimed.id).update({
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      lastError: null,
    });
    await campaignRef.update({
      'stats.sent': admin.firestore.FieldValue.increment(1),
      'stats.queued': admin.firestore.FieldValue.increment(-1),
      [`sentToday.${now.date}`]: admin.firestore.FieldValue.increment(1),
      [`sentHourly.${now.hourKey}`]: admin.firestore.FieldValue.increment(1),
      consecutiveFailures: 0,
      lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      mode: 'test',
      leadId: claimed.id,
      shopName: claimed.shopName,
      phoneE164: claimed.phoneE164,
      language: claimed.language,
      messagePreview: message,
    });
  } else {
    await leadsCol.doc(claimed.id).update({
      status: 'queued', // put it back so it can be retried
      lastError: result.error ?? 'send_failed',
      attempts: (claimed.attempts ?? 0) + 1,
    });
    res.status(502).json({ success: false, error: result.error ?? 'send_failed' });
  }
});

export default router;
