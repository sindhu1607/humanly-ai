import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from './index.ts';

/**
 * Catch-all Vercel serverless function router.
 * Matches any /api/:path* subroute directly on Vercel's file-system router.
 */
export default function catchAllHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
