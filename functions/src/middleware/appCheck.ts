import type { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/env';
import { getAppCheck } from '../config/firebase';

export async function verifyAppCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!getConfig().requireAppCheck) return next();

  const token = req.header('X-Firebase-AppCheck');
  if (!token) {
    res.status(401).json({ success: false, error: 'Missing App Check token' });
    return;
  }
  try {
    await getAppCheck().verifyToken(token);
    return next();
  } catch (err) {
    console.warn('[appCheck] Token verification failed:', err);
    res.status(401).json({ success: false, error: 'Invalid App Check token' });
    return;
  }
}
