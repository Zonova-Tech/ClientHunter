import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import whatsappRoutes from './routes/whatsapp';

export function buildApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(corsMiddleware);
  app.use(express.json({ limit: '64kb' }));

  // Promo images are bundled with the function and served as static files.
  // Path resolves relative to compiled lib/ folder.
  const promoImagesPath = path.join(__dirname, '../public/promo-images');
  app.use('/promo-images', express.static(promoImagesPath, { maxAge: '7d' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/whatsapp', whatsappRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
