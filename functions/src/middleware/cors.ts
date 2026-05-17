import cors from 'cors';
import { getConfig } from '../config/env';

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = getConfig().cors.allowedOrigins;
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Firebase-AppCheck'],
});
