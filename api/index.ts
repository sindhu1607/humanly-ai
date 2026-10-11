import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server.ts';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // If Vercel rewrote the route, recover original path from headers or query
    const matchedPath = req.headers['x-matched-path'] as string;
    if (matchedPath && matchedPath.startsWith('/api') && req.url !== matchedPath) {
      req.url = matchedPath;
    } else if (req.query && req.query.path) {
      const subPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
      if (subPath && !req.url.includes(subPath)) {
        req.url = `/api/${subPath}`;
      }
    }

    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Function Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error?.message || 'Server error occurred during request processing',
        code: 'SERVERLESS_INVOCATION_ERROR',
      });
    }
  }
}

export { app };
