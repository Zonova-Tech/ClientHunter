import { getAppCheckToken } from '../config/firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class WhatsAppApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'WhatsAppApiError';
    this.status = status ?? 0;
    this.code = code ?? 'unknown';
  }
}

function classify(status) {
  if (status === 401) return 'unauthorized';
  if (status === 429) return 'rate_limited';
  if (status === 400) return 'bad_request';
  if (status === 502) return 'upstream_failed';
  if (status >= 500) return 'server_error';
  return 'unknown';
}

async function callApi(path, body) {
  // Empty API_BASE means same-origin (Firebase Hosting rewrites /api/** to the function).
  const url = API_BASE ? `${API_BASE}${path}` : path;

  const headers = { 'Content-Type': 'application/json' };
  const appCheckToken = await getAppCheckToken();
  if (appCheckToken) {
    headers['X-Firebase-AppCheck'] = appCheckToken;
  }

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new WhatsAppApiError(
      err?.message || 'Network error contacting WhatsApp service',
      { code: 'network_error' }
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — fall through to error path below.
  }

  if (!res.ok || !data?.success) {
    throw new WhatsAppApiError(
      data?.error || `WhatsApp request failed (HTTP ${res.status})`,
      { status: res.status, code: classify(res.status) }
    );
  }

  return data;
}

/**
 * Sends a plain-text WhatsApp message.
 * @param {string} phone   Sri Lankan mobile (any of: 077..., +9477..., 9477...)
 * @param {string} message Message body (≤4096 chars)
 */
export function sendWhatsAppText(phone, message) {
  return callApi('/api/whatsapp/send', { phone, message });
}

/**
 * Sends an image with optional caption. `imageUrl` must be a publicly
 * fetchable absolute URL (HostGrap downloads it from the public internet).
 */
export function sendWhatsAppImage(phone, imageUrl, caption) {
  return callApi('/api/whatsapp/send-image', {
    phone,
    image_url: imageUrl,
    caption: caption ?? '',
  });
}
