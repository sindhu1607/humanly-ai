import {
  CompleteValidationResult,
  HumanizeRequest,
  HumanizeResponse,
  HumanlyContext,
  HumanlyTone,
  ValidationStatus,
} from '../types/humanly.ts';
import {
  analyzeRoboticLanguage,
  humanizeText,
  validateSemanticPreservation,
} from './aiServices.ts';
import { runDeterministicValidation } from './deterministicValidator.ts';

const VALID_CONTEXTS: Set<HumanlyContext> = new Set([
  'recruiter_feedback',
  'candidate_communication',
  'interview_questions',
  'interview_summaries',
  'professional_reports',
  'general_professional',
]);

const VALID_TONES: Set<HumanlyTone> = new Set(['professional', 'polished', 'conversational']);

export function validateInputParams(
  text: string,
  context: string,
  tone: string
): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { isValid: false, error: 'Input text cannot be empty.' };
  }

  const trimmed = text.trim();
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Input text is too short. Please provide at least a few words.' };
  }

  if (trimmed.length > 20000) {
    return {
      isValid: false,
      error: 'Input text exceeds the maximum allowed limit of 20,000 characters.',
    };
  }

  if (!VALID_CONTEXTS.has(context as HumanlyContext)) {
    return { isValid: false, error: `Invalid context: "${context}".` };
  }

  if (!VALID_TONES.has(tone as HumanlyTone)) {
    return { isValid: false, error: `Invalid tone: "${tone}".` };
  }

  return { isValid: true };
}

/**
 * Combines deterministic and semantic validation into a single transparent verdict.
 */
export function combineValidationResults(
  deterministic: ReturnType<typeof runDeterministicValidation>,
  semantic: Awaited<ReturnType<typeof validateSemanticPreservation>>
): CompleteValidationResult {
  let overallStatus: ValidationStatus = 'PASS';
  let statusHeadline = 'Validation Passed: No Discrepancies Detected';
  let summaryReason = '';
  let actionableGuidance: string | undefined = undefined;

  const hasDeterministicFail = deterministic.status === 'FAIL';
  const hasSemanticFail = semantic.status === 'FAIL';
  const hasDeterministicReview = deterministic.status === 'REVIEW';
  const hasSemanticReview = semantic.status === 'REVIEW';

  if (hasDeterministicFail || hasSemanticFail) {
    overallStatus = 'FAIL';
    statusHeadline = 'Validation Failed: Material Discrepancy Detected';
    summaryReason =
      hasDeterministicFail && hasSemanticFail
        ? 'Both deterministic entity checks and semantic AI audit detected missing or altered information.'
        : hasDeterministicFail
        ? 'Deterministic checks identified missing numbers, protected terms, or critical entities.'
        : 'Semantic validation identified unsupported claims or meaning alterations in the rewrite.';
    actionableGuidance =
      'Please inspect the flagged entities and evidence snippets below before finalizing your text.';
  } else if (hasDeterministicReview || hasSemanticReview) {
    overallStatus = 'REVIEW';
    statusHeadline = 'User Review Advised: Potential Nuance Shift';
    summaryReason =
      'Dual-layer validation detected subtle phrasing shifts, omitted minor details, or newly formatted expressions that warrant quick review.';
    actionableGuidance =
      'Review the side-by-side comparison below to verify that no important nuance was softened or altered.';
  } else {
    overallStatus = 'PASS';
    statusHeadline = 'Validation Passed: No Discrepancies Detected';
    summaryReason =
      'Dual-layer validation verified that key entities, numbers, dates, and core intent are preserved without detected discrepancies. Human review is recommended for high-stakes communication.';
  }

  return {
    overallStatus,
    statusHeadline,
    deterministic,
    semantic,
    summaryReason,
    actionableGuidance,
  };
}

/**
 * Executes the full end-to-end processing pipeline:
 * Input validation -> Robotic Analysis -> Humanization -> Deterministic Validation -> Semantic Validation.
 */
export async function processHumanizeWorkflow(request: HumanizeRequest): Promise<HumanizeResponse> {
  const startTime = Date.now();
  const text = request.text.trim();
  const context = request.context;
  const tone = request.tone;
  const protectedTerms = request.protectedTerms || [];

  // Step 4: Robotic Language Analysis & Step 5: Humanize in parallel for fast response
  const [roboticAnalysis, humanized] = await Promise.all([
    analyzeRoboticLanguage(text, context),
    humanizeText(text, context, tone, protectedTerms),
  ]);

  // Step 6: Factuality & Meaning Validation
  const deterministicResult = runDeterministicValidation(
    text,
    humanized.rewrittenText,
    protectedTerms
  );

  const semanticResult = await validateSemanticPreservation(
    text,
    humanized.rewrittenText,
    context
  );

  const validation = combineValidationResults(deterministicResult, semanticResult);

  const processingTimeMs = Date.now() - startTime;

  return {
    originalText: text,
    rewrittenText: humanized.rewrittenText,
    context,
    tone,
    protectedTerms,
    changesSummary: humanized.changesSummary,
    roboticAnalysis,
    validation,
    timestamp: new Date().toISOString(),
    processingTimeMs,
  };
}

/**
 * Re-runs validation on user-edited text.
 */
export async function revalidateText(
  originalText: string,
  editedText: string,
  context: HumanlyContext,
  protectedTerms: string[] = []
): Promise<CompleteValidationResult> {
  const deterministic = runDeterministicValidation(originalText, editedText, protectedTerms);
  const semantic = await validateSemanticPreservation(originalText, editedText, context);
  return combineValidationResults(deterministic, semantic);
}
