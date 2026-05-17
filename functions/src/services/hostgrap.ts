import { getConfig } from '../config/env';

const HOSTGRAP_BASE = 'https://wa-api.hostgrap.com/api';

export interface HostgrapResult {
  success: boolean;
  error?: string;
  raw?: unknown;
}

interface HostgrapResponse {
  status?: string;
  message?: string;
  [k: string]: unknown;
}

async function postForm(endpoint: string, params: Record<string, string>): Promise<HostgrapResult> {
  const cfg = getConfig();
  const body = new URLSearchParams({
    email: cfg.hostgrap.email,
    api_key: cfg.hostgrap.apiKey,
    ...params,
  }).toString();

  try {
    const res = await fetch(`${HOSTGRAP_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    let data: HostgrapResponse = {};
    try {
      data = (await res.json()) as HostgrapResponse;
    } catch {
      return { success: false, error: `HostGrap returned non-JSON (HTTP ${res.status})` };
    }

    if (data.status === 'success') {
      return { success: true, raw: data };
    }
    return {
      success: false,
      error: data.message ?? `HostGrap request failed (HTTP ${res.status})`,
      raw: data,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error calling HostGrap',
    };
  }
}

const resolvePhone = (phone: string): string => getConfig().testPhoneOverride || phone;

export function sendWhatsAppMessage(phone: string, message: string): Promise<HostgrapResult> {
  return postForm('send-message.php', { phone: resolvePhone(phone), message });
}

export function sendWhatsAppImage(
  phone: string,
  imageUrl: string,
  caption: string
): Promise<HostgrapResult> {
  return postForm('send-image.php', { phone: resolvePhone(phone), image_url: imageUrl, caption });
}
