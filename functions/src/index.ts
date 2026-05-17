import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { buildApp } from './app';
import { SECRETS } from './config/env';
import { initFirebaseAdmin } from './config/firebase';

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
