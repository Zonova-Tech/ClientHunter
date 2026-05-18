import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// --- Firebase App Check ---
// Used to prove that calls to the ClientHunter backend come from this real app.
// Requires a reCAPTCHA v3 site key (set VITE_RECAPTCHA_V3_SITE_KEY in .env).
// During local dev set VITE_APP_CHECK_DEBUG_TOKEN=true to use the App Check debug provider.
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;

let appCheckInstance = null;

if (typeof window !== 'undefined') {
  const debugToken = import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN;
  if (debugToken === 'true') {
    // Auto-generate a fresh token each session and print it in the console —
    // register the printed token in Firebase Console under App Check → Apps → Manage debug tokens.
    // Use this mode for one-off testing; tokens change on every reload.
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  } else if (debugToken && debugToken.length > 8) {
    // Stable mode: paste a previously-registered debug token UUID into .env.local.
    // Same token every session → register it once and forget.
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (recaptchaSiteKey) {
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.error('[firebase] App Check initialization failed:', err);
    }
  } else {
    console.warn(
      '[firebase] VITE_RECAPTCHA_V3_SITE_KEY is not set — App Check disabled. ' +
        'WhatsApp API calls will fail unless backend REQUIRE_APP_CHECK=false.'
    );
  }
}

/**
 * Fetches a short-lived Firebase App Check token to send as
 * `X-Firebase-AppCheck` header on backend API calls.
 * Returns null if App Check is not configured (caller decides how to handle).
 */
export async function getAppCheckToken() {
  if (!appCheckInstance) return null;
  try {
    const result = await getToken(appCheckInstance, /* forceRefresh */ false);
    return result.token;
  } catch (err) {
    console.error('[firebase] Failed to fetch App Check token:', err);
    return null;
  }
}
