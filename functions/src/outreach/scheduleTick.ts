// Cron loop for outreach campaigns. Runs every 10 minutes (configured at export site).
// Per tick: scan running campaigns, for each: respect pacer, claim one lead atomically,
// send via HostGrap, update counters. Single concern per file.

import { logger } from 'firebase-functions/v2';
import admin from 'firebase-admin';
import { getFirestore } from '../config/firebase';
import { sendWhatsAppMessage } from '../services/hostgrap';
import { logMessageSend } from '../services/auditLog';
import { shouldSendThisTick } from './pacer';
import { renderMessageForLead } from './messageTemplate';
import type { OutreachCampaign, OutreachLead } from './types';

const CAMPAIGNS_COLLECTION = 'outreachCampaigns';
const OPT_OUTS_COLLECTION = 'outreachOptOuts';

/**
 * Entry point — called by the onSchedule trigger.
 */
export async function runOutreachTick(): Promise<void> {
  const db = getFirestore();

  const runningSnap = await db
    .collection(CAMPAIGNS_COLLECTION)
    .where('status', '==', 'running')
    .get();

  if (runningSnap.empty) {
    logger.info('outreach.tick.skip', { reason: 'no_running_campaigns' });
    return;
  }

  logger.info('outreach.tick.start', { running: runningSnap.size });

  for (const campaignDoc of runningSnap.docs) {
    try {
      await processCampaign(db, campaignDoc.id, campaignDoc.data() as OutreachCampaign);
    } catch (err) {
      logger.error('outreach.tick.campaign_error', {
        campaignId: campaignDoc.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

async function processCampaign(
  db: admin.firestore.Firestore,
  campaignId: string,
  campaign: OutreachCampaign,
): Promise<void> {
  // Always touch lastTickAt so the UI can show a heartbeat.
  await db.collection(CAMPAIGNS_COLLECTION).doc(campaignId).update({
    lastTickAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Hard gate: never send until the operator has previewed sample messages.
  if (!campaign.previewApproved) {
    logger.info('outreach.tick.campaign_skip', {
      campaignId,
      reason: 'preview_not_approved',
    });
    return;
  }

  const decision = shouldSendThisTick(campaign);

  if (!decision.allow) {
    logger.info('outreach.tick.campaign_skip', {
      campaignId,
      reason: decision.reason,
    });
    return;
  }

  const lead = await claimNextLead(db, campaignId);
  if (!lead) {
    // Nothing left to send → mark campaign done.
    await db.collection(CAMPAIGNS_COLLECTION).doc(campaignId).update({
      status: 'done',
    });
    logger.info('outreach.campaign.done', { campaignId });
    return;
  }

  // Opt-out check — skip atomically, don't count against caps.
  const optedOut = await isOptedOut(db, lead.phoneE164);
  if (optedOut) {
    await db
      .collection(CAMPAIGNS_COLLECTION)
      .doc(campaignId)
      .collection('leads')
      .doc(lead.id)
      .update({ status: 'opted_out' });
    await db
      .collection(CAMPAIGNS_COLLECTION)
      .doc(campaignId)
      .update({
        'stats.optedOut': admin.firestore.FieldValue.increment(1),
        'stats.queued': admin.firestore.FieldValue.increment(-1),
      });
    logger.info('outreach.lead.opted_out_skip', { campaignId, leadId: lead.id });
    return;
  }

  const message = renderMessageForLead(campaign, lead);
  const result = await sendWhatsAppMessage(lead.phoneE164, message);

  const ref = db
    .collection(CAMPAIGNS_COLLECTION)
    .doc(campaignId)
    .collection('leads')
    .doc(lead.id);
  const campaignRef = db.collection(CAMPAIGNS_COLLECTION).doc(campaignId);

  if (result.success) {
    await ref.update({
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      lastError: null,
    });

    await campaignRef.update({
      'stats.sent': admin.firestore.FieldValue.increment(1),
      'stats.queued': admin.firestore.FieldValue.increment(-1),
      [`sentToday.${decision.now.date}`]: admin.firestore.FieldValue.increment(1),
      [`sentHourly.${decision.now.hourKey}`]: admin.firestore.FieldValue.increment(1),
      consecutiveFailures: 0,
      lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    void logMessageSend({
      type: 'text',
      status: 'success',
      phone: lead.phoneE164,
      message,
      ip: 'scheduler',
      userAgent: `outreach-tick:${campaignId}`,
    });

    logger.info('outreach.lead.sent', {
      campaignId,
      leadId: lead.id,
      shopName: lead.shopName,
    });
  } else {
    const attempts = (lead.attempts ?? 0) + 1;
    const exhausted = attempts >= campaign.pacing.maxAttempts;

    await ref.update({
      status: exhausted ? 'failed' : 'queued',
      attempts,
      lastError: result.error ?? 'unknown_error',
    });

    const failureUpdate: Record<string, unknown> = {
      consecutiveFailures: admin.firestore.FieldValue.increment(1),
    };
    if (exhausted) {
      failureUpdate['stats.failed'] = admin.firestore.FieldValue.increment(1);
      failureUpdate['stats.queued'] = admin.firestore.FieldValue.increment(-1);
    }
    await campaignRef.update(failureUpdate);

    void logMessageSend({
      type: 'text',
      status: 'failed',
      phone: lead.phoneE164,
      message,
      errorMessage: result.error,
      ip: 'scheduler',
      userAgent: `outreach-tick:${campaignId}`,
    });

    logger.warn('outreach.lead.failed', {
      campaignId,
      leadId: lead.id,
      attempts,
      exhausted,
      error: result.error,
    });
  }
}

/**
 * Atomically picks the oldest queued lead and marks it as `sending`.
 * Uses a transaction so concurrent ticks never double-send.
 */
async function claimNextLead(
  db: admin.firestore.Firestore,
  campaignId: string,
): Promise<(OutreachLead & { id: string }) | null> {
  const leadsCol = db.collection(CAMPAIGNS_COLLECTION).doc(campaignId).collection('leads');

  return db.runTransaction(async (tx) => {
    const candidateSnap = await tx.get(
      leadsCol.where('status', '==', 'queued').orderBy('queuedAt', 'asc').limit(1),
    );
    if (candidateSnap.empty) return null;

    const doc = candidateSnap.docs[0];
    tx.update(doc.ref, { status: 'sending' });
    return { id: doc.id, ...(doc.data() as OutreachLead) };
  });
}

async function isOptedOut(
  db: admin.firestore.Firestore,
  phoneE164: string,
): Promise<boolean> {
  const doc = await db.collection(OPT_OUTS_COLLECTION).doc(phoneE164).get();
  return doc.exists;
}
