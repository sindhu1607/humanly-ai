/**
 * Safe API response parser and HTTP client utility.
 * Prevents "Unexpected token 'A', 'A server e'... is not valid JSON" errors
 * by validating content-type and HTTP status before parsing.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Safely parse a fetch Response object, guaranteeing no unhandled JSON SyntaxError exceptions.
 */
export async function safeParseApiResponse<T = any>(
  response: Response,
  fallbackMessage = 'Request failed'
): Promise<ApiResponse<T>> {
  const status = response.status;
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const isJson = contentType.includes('application/json');

  let parsedJson: any = null;
  let rawText = '';

  try {
    if (isJson) {
      parsedJson = await response.json();
    } else {
      rawText = (await response.text()).trim();
      // Fallback: If body looks like JSON despite headers, attempt parse
      if (rawText.startsWith('{') || rawText.startsWith('[')) {
        try {
          parsedJson = JSON.parse(rawText);
        } catch {
          // Keep rawText
        }
      }
    }
  } catch (parseError) {
    console.warn('[API Client] Non-JSON response received:', parseError);
  }

  // 1. Success response (2xx)
  if (response.ok) {
    if (parsedJson !== null) {
      return { ok: true, data: parsedJson as T, status };
    }
    return { ok: true, data: rawText as unknown as T, status };
  }

  // 2. Error response (!response.ok)
  let errorMessage = '';

  if (parsedJson && typeof parsedJson === 'object' && parsedJson.error) {
    errorMessage = String(parsedJson.error);
  } else if (rawText) {
    // Handle HTML error pages (e.g. from Vercel edge/proxy 404, 500, 502, 504)
    if (
      rawText.startsWith('<!DOCTYPE') ||
      rawText.startsWith('<html') ||
      rawText.includes('<head>')
    ) {
      if (status === 504) {
        errorMessage = 'AI gateway timed out. Please try again with slightly shorter text.';
      } else if (status === 502 || status === 503) {
        errorMessage = 'AI backend server is temporarily unavailable. Please retry in a moment.';
      } else if (status === 404) {
        errorMessage = 'API route not found on server (/api/process-all). Please check deployment routing.';
      } else {
        errorMessage = `Server error (${status}). Please try again or verify server logs.`;
      }
    } else if (
      rawText.toLowerCase().includes('server error') ||
      rawText.toLowerCase().includes('function_invocation_failed')
    ) {
      errorMessage =
        'Server function execution error. Please verify GEMINI_API_KEY is configured in Vercel environment variables.';
    } else if (rawText.length < 240) {
      // Clean short plain-text message
      errorMessage = rawText;
    } else {
      errorMessage = `${fallbackMessage} (HTTP ${status}).`;
    }
  } else {
    // Empty body error
    if (status === 401 || status === 403) {
      errorMessage = 'Unauthorized: Missing or invalid Gemini API key.';
    } else if (status === 429) {
      errorMessage = 'Quota / rate limit reached: Google Gemini API is temporarily saturated. Please retry shortly.';
    } else if (status === 503) {
      errorMessage = 'GEMINI_API_KEY is not configured on the server. Please enter your API key.';
    } else {
      errorMessage = `${fallbackMessage} (HTTP ${status}).`;
    }
  }

  return {
    ok: false,
    error: errorMessage,
    status,
  };
}
