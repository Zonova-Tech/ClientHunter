import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import { buildApp } from './app';
import { SECRETS } from './config/env';
import { initFirebaseAdmin } from './config/firebase';
import { runOutreachTick } from './outreach/scheduleTick';

setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

initFirebaseAdmin();
const app = buildApp();

export const api = onRequest(
  {
    secrets: SECRETS,
    timeoutSeconds: 30,
    memory: '256MiB',
    cors: false, // CORS handled inside Express
  },
  app
);

// Outreach cron: ticks every 10 minutes, but only acts on campaigns whose
// status === 'running'. Pacing, send-window, and jitter live in the tick itself.
export const outreachTick = onSchedule(
  {
    schedule: 'every 10 minutes',
    timeZone: 'Asia/Colombo',
    secrets: SECRETS,
    timeoutSeconds: 120,
    memory: '256MiB',
  },
  async () => {
    await runOutreachTick();
  },
);
