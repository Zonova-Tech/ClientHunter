import { defineSecret, defineString } from 'firebase-functions/params';

// Secrets — set via: firebase functions:secrets:set HOSTGRAP_API_KEY
export const HOSTGRAP_EMAIL = defineSecret('HOSTGRAP_EMAIL');
export const HOSTGRAP_API_KEY = defineSecret('HOSTGRAP_API_KEY');
export const HOSTGRAP_ADMIN_PHONE = defineSecret('HOSTGRAP_ADMIN_PHONE');

// Non-secret params — set via firebase.json or env
export const ALLOWED_ORIGINS = defineString('ALLOWED_ORIGINS', {
  default:
    'https://client-hunter-app-a3de6.web.app,https://client-hunter-app-a3de6.firebaseapp.com',
});
export const REQUIRE_APP_CHECK = defineString('REQUIRE_APP_CHECK', { default: 'true' });
export const TEST_PHONE_OVERRIDE = defineString('TEST_PHONE_OVERRIDE', { default: '' });
export const RATE_LIMIT_WINDOW_MINUTES = defineString('RATE_LIMIT_WINDOW_MINUTES', {
  default: '60',
});
export const RATE_LIMIT_MAX_REQUESTS = defineString('RATE_LIMIT_MAX_REQUESTS', {
  default: '30',
});

export const SECRETS = [HOSTGRAP_EMAIL, HOSTGRAP_API_KEY, HOSTGRAP_ADMIN_PHONE];

export function getConfig() {
  return {
    hostgrap: {
      email: HOSTGRAP_EMAIL.value(),
      apiKey: HOSTGRAP_API_KEY.value(),
      adminPhone: HOSTGRAP_ADMIN_PHONE.value(),
    },
    cors: {
      allowedOrigins: ALLOWED_ORIGINS.value()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    },
    requireAppCheck: REQUIRE_APP_CHECK.value().toLowerCase() === 'true',
    testPhoneOverride: TEST_PHONE_OVERRIDE.value(),
    rateLimit: {
      windowMinutes: parseInt(RATE_LIMIT_WINDOW_MINUTES.value(), 10) || 60,
      maxRequests: parseInt(RATE_LIMIT_MAX_REQUESTS.value(), 10) || 30,
    },
  };
}
