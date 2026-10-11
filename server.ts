import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  GEMINI_MODEL,
  hasGeminiKey,
  formatGeminiErrorMessage,
  setRuntimeGeminiKey,
} from './src/services/geminiClient.ts';
import {
  analyzeRoboticLanguage,
  humanizeText,
} from './src/services/aiServices.ts';
import {
  processHumanizeWorkflow,
  revalidateText,
  validateInputParams,
} from './src/services/orchestrator.ts';
import { HumanlyContext, HumanlyTone } from './src/types/humanly.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Safe Body Parser (restricted from 10mb down to 500kb for security)
app.use(express.json({ limit: '500kb' }));

// Allowed Origins for CORS Security
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : []),
]);

// CORS Middleware with origin restriction and Vercel support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isVercel = Boolean(process.env.VERCEL);
  const isAllowedOrigin =
    !origin ||
    !isProd ||
    isVercel ||
    ALLOWED_ORIGINS.has(origin) ||
    (origin && origin.endsWith('.vercel.app'));

  if (isAllowedOrigin && origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Direct same-origin request
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

function getErrorStatusCode(error: any): number {
  const msg = error?.message || String(error);
  if (msg.includes('rate limit') || msg.includes('quota') || msg.includes('429')) return 429;
  if (
    msg.includes('not configured') ||
    msg.includes('missing') ||
    msg.includes('503') ||
    msg.includes('unavailable')
  ) {
    return 503;
  }
  if (msg.includes('timed out')) return 504;
  if (msg.includes('invalid') || msg.includes('too short') || msg.includes('too long')) return 400;
  return 500;
}

// Health check endpoints (both /health and /api/health for Vercel routing flexibility)
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'HumanlyAI Backend',
    uptimeSeconds: Math.floor(process.uptime()),
    model: GEMINI_MODEL,
    aiKeyConfigured: hasGeminiKey(),
    timestamp: new Date().toISOString(),
  });
};

app.get(['/health', '/api/health'], handleHealth);

// Configuration status endpoint
app.get(['/api/config-status', '/config-status'], (_req: Request, res: Response) => {
  const configured = hasGeminiKey();
  res.json({
    configured,
    model: GEMINI_MODEL,
    status: configured ? 'ready' : 'missing_api_key',
    message: configured
      ? 'Gemini AI integration is active and connected.'
      : 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your environment or .env file.',
  });
});

// POST /api/set-api-key - Dynamically configure & verify Gemini API key
app.post(['/api/set-api-key', '/set-api-key'], async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, test = true } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 15) {
      res.status(400).json({
        error: 'Please provide a valid Gemini API key (typically starts with AIzaSy... and is at least 20 characters).',
      });
      return;
    }

    const trimmedKey = apiKey.trim();

    // Verify key against Gemini API if requested
    if (test) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const testClient = new GoogleGenAI({ apiKey: trimmedKey });
        
        let verified = false;
        let lastError: any = null;
        const modelsToTest = [GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3-flash-preview'];

        for (const modelToTry of modelsToTest) {
          try {
            await testClient.models.generateContent({
              model: modelToTry,
              contents: 'Ping',
            });
            verified = true;
            break;
          } catch (modelErr: any) {
            lastError = modelErr;
            const errMsg = modelErr?.message || '';
            // If it is a key authentication error, stop immediately
            if (
              errMsg.includes('API_KEY_INVALID') ||
              errMsg.includes('401') ||
              errMsg.includes('UNAUTHENTICATED') ||
              errMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED')
            ) {
              break;
            }
          }
        }

        if (!verified) {
          const userMsg = formatGeminiErrorMessage(lastError);
          res.status(400).json({
            error: `Key verification failed: ${userMsg}`,
          });
          return;
        }
      } catch (testErr: any) {
        const userMsg = formatGeminiErrorMessage(testErr);
        res.status(400).json({
          error: `Key verification failed: ${userMsg}`,
        });
        return;
      }
    }

    // Set runtime in-memory key
    setRuntimeGeminiKey(trimmedKey);

    // Persist to .env file when running in persistent environment (skip on read-only Vercel serverless)
    if (!process.env.VERCEL) {
      try {
        const envPath = path.resolve(__dirname, '.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }

        if (envContent.includes('GEMINI_API_KEY=')) {
          envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${trimmedKey}"`);
        } else {
          envContent += `\nGEMINI_API_KEY="${trimmedKey}"\nGEMINI_MODEL="${GEMINI_MODEL}"\nPORT=${PORT}\n`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
      } catch (fsErr) {
        console.warn('Could not write .env file:', fsErr);
      }
    }

    res.json({
      success: true,
      model: GEMINI_MODEL,
      message: process.env.VERCEL
        ? 'Gemini API key active for this session! (Tip: Set GEMINI_API_KEY in Vercel Project Settings for permanent persistence).'
        : 'Gemini API key successfully verified, activated, and saved!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to configure API key' });
  }
});

// POST /api/analyze - Robotic Language Analysis
app.post(['/api/analyze', '/analyze'], async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, context = 'general_professional' } = req.body;
    const validation = validateInputParams(text, context, 'professional');
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    if (!hasGeminiKey()) {
      res.status(503).json({
        error:
          'Gemini API key is not configured on the server. Please check your GEMINI_API_KEY environment variable.',
      });
      return;
    }

    console.log(`[API] /api/analyze - textLength: ${text.length}, context: ${context}`);
    const result = await analyzeRoboticLanguage(text, context as HumanlyContext);
    res.json(result);
  } catch (error: any) {
    const status = getErrorStatusCode(error);
    const userMessage = formatGeminiErrorMessage(error);
    console.error(`[API Error ${status}] /api/analyze:`, userMessage);
    res.status(status).json({ error: userMessage });
  }
});

// POST /api/humanize - AI Humanization
app.post(['/api/humanize', '/humanize'], async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      context = 'general_professional',
      tone = 'professional',
      protectedTerms = [],
    } = req.body;

    const validation = validateInputParams(text, context, tone);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    if (!hasGeminiKey()) {
      res.status(503).json({
        error:
          'Gemini API key is not configured on the server. Please check your GEMINI_API_KEY environment variable.',
      });
      return;
    }

    console.log(
      `[API] /api/humanize - textLength: ${text.length}, context: ${context}, tone: ${tone}, protectedTermsCount: ${Array.isArray(protectedTerms) ? protectedTerms.length : 0}`
    );

    const result = await humanizeText(
      text,
      context as HumanlyContext,
      tone as HumanlyTone,
      Array.isArray(protectedTerms) ? protectedTerms : []
    );
    res.json(result);
  } catch (error: any) {
    const status = getErrorStatusCode(error);
    const userMessage = formatGeminiErrorMessage(error);
    console.error(`[API Error ${status}] /api/humanize:`, userMessage);
    res.status(status).json({ error: userMessage });
  }
});

// POST /api/validate - Revalidate or validate arbitrary rewritten text
app.post(['/api/validate', '/validate'], async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      originalText,
      rewrittenText,
      context = 'general_professional',
      protectedTerms = [],
    } = req.body;

    if (
      !originalText ||
      !rewrittenText ||
      typeof originalText !== 'string' ||
      typeof rewrittenText !== 'string'
    ) {
      res.status(400).json({
        error: 'Both originalText and rewrittenText are required string inputs for validation.',
      });
      return;
    }

    if (originalText.trim().length < 5 || rewrittenText.trim().length < 5) {
      res.status(400).json({
        error: 'Validation inputs must be at least 5 characters long.',
      });
      return;
    }

    if (originalText.length > 20000 || rewrittenText.length > 20000) {
      res.status(400).json({
        error: 'Input text exceeds the maximum allowed limit of 20,000 characters.',
      });
      return;
    }

    if (!hasGeminiKey()) {
      res.status(503).json({
        error:
          'Gemini API key is not configured on the server. Please check your GEMINI_API_KEY environment variable.',
      });
      return;
    }

    console.log(
      `[API] /api/validate - origLen: ${originalText.length}, rewriteLen: ${rewrittenText.length}`
    );

    const validation = await revalidateText(
      originalText,
      rewrittenText,
      context as HumanlyContext,
      Array.isArray(protectedTerms) ? protectedTerms : []
    );
    res.json(validation);
  } catch (error: any) {
    const status = getErrorStatusCode(error);
    const userMessage = formatGeminiErrorMessage(error);
    console.error(`[API Error ${status}] /api/validate:`, userMessage);
    res.status(status).json({ error: userMessage });
  }
});

// POST /api/process-all - Full End-to-End Workflow Pipeline
app.post(['/api/process-all', '/process-all'], async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      context = 'general_professional',
      tone = 'professional',
      protectedTerms = [],
    } = req.body;

    const validation = validateInputParams(text, context, tone);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    if (!hasGeminiKey()) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your environment or .env file.',
      });
      return;
    }

    console.log(
      `[API] /api/process-all - textLength: ${text.length}, context: ${context}, tone: ${tone}`
    );

    const result = await processHumanizeWorkflow({
      text,
      context: context as HumanlyContext,
      tone: tone as HumanlyTone,
      protectedTerms: Array.isArray(protectedTerms) ? protectedTerms : [],
    });

    res.json(result);
  } catch (error: any) {
    const status = getErrorStatusCode(error);
    const userMessage = formatGeminiErrorMessage(error);
    console.error(`[API Error ${status}] /api/process-all:`, userMessage);
    res.status(status).json({ error: userMessage });
  }
});

// Catch-all 404 handler for unmatched API routes (guarantees valid JSON instead of HTML)
app.all(['/api', '/api/*'], (req: Request, res: Response) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
    code: 'NOT_FOUND',
  });
});

// Global Error Handler guaranteeing JSON responses
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[API Uncaught Error]:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred',
    code: 'INTERNAL_ERROR',
  });
});

// Setup dev vs production static serving
async function startServer() {
  if (!isProd) {
    // Development mode with Vite middleware (dynamic import so production/serverless bundles never bundle Vite)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built client assets
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HumanlyAI server running on http://0.0.0.0:${PORT}`);
    console.log(`AI Model: ${GEMINI_MODEL} | API Key configured: ${hasGeminiKey()}`);
  });
}

// Only start standalone HTTP server when not running in serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;

