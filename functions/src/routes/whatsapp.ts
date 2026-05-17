import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendWhatsAppMessage, sendWhatsAppImage } from '../services/hostgrap';
import { logMessageSend } from '../services/auditLog';
import { verifyAppCheck } from '../middleware/appCheck';
import { whatsappRateLimiter } from '../middleware/rateLimit';
import { normalizeSriLankanMobile } from '../utils/phone';

const router = Router();

router.use(verifyAppCheck);
router.use(whatsappRateLimiter);

function extractMeta(req: Request) {
  return {
    ip: (req.ip ?? req.socket.remoteAddress ?? '').toString(),
    userAgent: req.header('user-agent') ?? '',
  };
}

router.post('/send', async (req: Request, res: Response): Promise<void> => {
  const { phone, message } = (req.body ?? {}) as { phone?: string; message?: string };

  if (!phone || !message) {
    res.status(400).json({ success: false, error: 'phone and message are required' });
    return;
  }
  if (message.length > 4096) {
    res.status(400).json({ success: false, error: 'message exceeds 4096 chars' });
    return;
  }

  const normalized = normalizeSriLankanMobile(phone);
  if (!normalized) {
    res.status(400).json({ success: false, error: 'Invalid Sri Lankan mobile number' });
    return;
  }

  const result = await sendWhatsAppMessage(normalized, message);
  const meta = extractMeta(req);

  void logMessageSend({
    type: 'text',
    status: result.success ? 'success' : 'failed',
    phone: normalized,
    message,
    errorMessage: result.error,
    ...meta,
  });

  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(502).json({ success: false, error: result.error ?? 'WhatsApp send failed' });
  }
});

router.post('/send-image', async (req: Request, res: Response): Promise<void> => {
  const { phone, image_url, caption } = (req.body ?? {}) as {
    phone?: string;
    image_url?: string;
    caption?: string;
  };

  if (!phone || !image_url) {
    res.status(400).json({ success: false, error: 'phone and image_url are required' });
    return;
  }

  let validImageUrl: URL;
  try {
    validImageUrl = new URL(image_url);
    if (!/^https?:$/.test(validImageUrl.protocol)) {
      throw new Error('image_url must use http or https');
    }
  } catch {
    res.status(400).json({ success: false, error: 'Invalid image_url' });
    return;
  }

  const captionText = (caption ?? '').slice(0, 1024);
  const normalized = normalizeSriLankanMobile(phone);
  if (!normalized) {
    res.status(400).json({ success: false, error: 'Invalid Sri Lankan mobile number' });
    return;
  }

  const result = await sendWhatsAppImage(normalized, validImageUrl.toString(), captionText);
  const meta = extractMeta(req);

  void logMessageSend({
    type: 'image',
    status: result.success ? 'success' : 'failed',
    phone: normalized,
    message: captionText,
    imageUrl: validImageUrl.toString(),
    errorMessage: result.error,
    ...meta,
  });

  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(502).json({ success: false, error: result.error ?? 'WhatsApp image send failed' });
  }
});

export default router;
