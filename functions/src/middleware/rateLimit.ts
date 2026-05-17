import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MINUTES, RATE_LIMIT_MAX_REQUESTS } from '../config/env';

const windowMinutes = parseInt(RATE_LIMIT_WINDOW_MINUTES.value(), 10) || 60;
const maxRequests = parseInt(RATE_LIMIT_MAX_REQUESTS.value(), 10) || 30;

// Created at module load — non-secret params are resolved during deploy.
export const whatsappRateLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  limit: maxRequests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: `Too many WhatsApp requests. Try again in ${windowMinutes} minutes.`,
  },
});
