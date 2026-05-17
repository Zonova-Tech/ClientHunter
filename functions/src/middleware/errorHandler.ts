import type { ErrorRequestHandler, Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[errorHandler]', err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(status).json({ success: false, error: message });
};
