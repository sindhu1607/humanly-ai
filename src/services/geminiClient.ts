import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
export const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];

let geminiClientInstance: GoogleGenAI | null = null;

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export function setRuntimeGeminiKey(key: string): void {
  process.env.GEMINI_API_KEY = key.trim();
  geminiClientInstance = null;
}

export function formatGeminiErrorMessage(err: any): string {
  if (!err) return 'Gemini API call failed.';
  const errMsg = typeof err === 'string' ? err : err.message || '';

  if (errMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') || errMsg.includes('Expected OAuth 2')) {
    return 'Invalid key format: Expected a Gemini API key starting with "AIza..." from Google AI Studio, not an OAuth bearer token.';
  }
  if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('invalid API key')) {
    return 'The configured Gemini API key is invalid or unauthorized. Please verify your GEMINI_API_KEY.';
  }
  if (errMsg.includes('UNAUTHENTICATED') || errMsg.includes('API_KEY_SERVICE_BLOCKED')) {
    return 'Authentication failed: Please check your Gemini API key from Google AI Studio (must start with "AIza...").';
  }
  if (errMsg.includes('PERMISSION_DENIED')) {
    return 'Permission denied: Please ensure the Gemini API is enabled for your Google AI Studio project.';
  }
  if (errMsg.includes('no longer available') || errMsg.includes('deprecated') || errMsg.includes('not found')) {
    return 'The selected model is unavailable or deprecated. HumanlyAI is configured to use the latest supported model (gemini-3.8-flash).';
  }
  if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
    return 'Gemini API rate limit or quota exceeded. Please wait a moment before trying again.';
  }
  if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('overloaded')) {
    return 'Gemini AI service is temporarily experiencing high demand. Please try again in a few moments.';
  }
  if (errMsg.includes('ETIMEDOUT') || errMsg.includes('timeout') || errMsg.includes('AbortError')) {
    return 'Gemini API request timed out. Please check your network connection and retry.';
  }

  // Attempt JSON parsing if error payload is JSON
  try {
    const parsed = JSON.parse(errMsg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // Keep sanitized errMsg
  }

  return errMsg || 'Unexpected error communicating with Gemini AI service.';
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment or .env file.'
    );
  }

  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'humanlyai-service',
        },
      },
    });
  }

  return geminiClientInstance;
}

/**
 * Executes a Gemini request with automatic retries and fallback models
 * to handle temporary 503 capacity spikes gracefully without returning fabricated results.
 */
export async function generateContentWithRetry(
  params: GenerateContentParameters
): Promise<GenerateContentResponse> {
  const ai = getGeminiClient();
  const modelsToTry = [
    params.model || GEMINI_MODEL,
    ...FALLBACK_MODELS.filter(m => m !== (params.model || GEMINI_MODEL)),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isTemporary && attempt < 1) {
          // Wait briefly before retry
          await new Promise(r => setTimeout(r, 1200));
          continue;
        }
        // If not temporary or second attempt failed, break to try fallback model
        break;
      }
    }
  }

  throw new Error(formatGeminiErrorMessage(lastError));
}
