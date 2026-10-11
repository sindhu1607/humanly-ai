/**
 * Automated Test Suite for HumanlyAI
 *
 * Covers:
 * 1. Preservation of names and protected terms
 * 2. Preservation of numbers, dates, percentages, and currency amounts
 * 3. Detection of missing important information
 * 4. Detection of unsupported deadlines or promises
 * 5. Detection of meaning-changing rewrites
 * 6. Acceptance of legitimate paraphrases
 * 7. Missing Gemini API key handling
 * 8. Gemini API failure, timeout, or rate-limiting error formatting
 * 9. Invalid input and boundary text handling
 * 10. Graceful handling of validation uncertainty and errors
 */

import {
  extractEntities,
  isEntityPreserved,
  runDeterministicValidation,
} from './src/services/deterministicValidator.ts';
import {
  validateInputParams,
  combineValidationResults,
} from './src/services/orchestrator.ts';
import {
  formatGeminiErrorMessage,
  hasGeminiKey,
  getGeminiClient,
  GEMINI_MODEL,
  FALLBACK_MODELS,
  setRuntimeGeminiKey,
} from './src/services/geminiClient.ts';
import { ExtractedEntity } from './src/types/humanly.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`, details || '');
    failed++;
  }
}

function suite(name: string, fn: () => void) {
  console.log(`\n▶ SUITE: ${name}`);
  fn();
}

console.log('====================================================');
console.log('🧪 HUMANLYAI HACKATHON RELIABILITY & VALIDATION TESTS');
console.log('====================================================');

// 1. Names and protected terms
suite('1. Preservation of Names and Protected Terms', () => {
  const text = 'Applicant Elena Rostova was interviewed by Sarah Jenkins regarding Kubernetes architecture.';
  const extracted = extractEntities(text, ['Elena Rostova']);

  assert(extracted.some(e => e.value === 'Elena Rostova' && e.type === 'protected_term'), 'Extracts user-protected term "Elena Rostova"');
  assert(extracted.some(e => e.value === 'Sarah Jenkins' && e.type === 'proper_name'), 'Extracts interviewer proper name "Sarah Jenkins"');

  const faithful = 'Sarah Jenkins met with Elena Rostova to discuss Kubernetes architecture in depth.';
  const resPass = runDeterministicValidation(text, faithful, ['Elena Rostova']);
  assert(resPass.status === 'PASS', 'Passes when protected term and names are preserved');

  const omitted = 'The candidate was interviewed regarding Kubernetes architecture.';
  const resFail = runDeterministicValidation(text, omitted, ['Elena Rostova']);
  assert(resFail.status === 'FAIL', 'Fails when protected term "Elena Rostova" is dropped');
  assert(resFail.missingEntities.some(e => e.value === 'Elena Rostova'), 'Explicitly flags missing protected term');
});

// 2. Numbers, dates, percentages, and currencies
suite('2. Preservation of Numbers, Dates, Percentages, and Currencies', () => {
  const text = 'On October 14, 2026, the team recorded a 4.8/5.0 score, 15% efficiency gain, and $145,000 cost savings.';
  const extracted = extractEntities(text);

  assert(extracted.some(e => e.value === '4.8/5.0' && e.type === 'metric_score'), 'Extracts score "4.8/5.0"');
  assert(extracted.some(e => e.value.includes('15%') && e.type === 'percentage'), 'Extracts percentage "15%"');
  assert(extracted.some(e => e.value.includes('$145,000') && e.type === 'currency'), 'Extracts currency "$145,000"');
  assert(extracted.some(e => e.value.includes('October 14') && e.type === 'date_time'), 'Extracts date "October 14, 2026"');

  const rewrite = 'During the October 14, 2026 review, our score reached 4.8/5.0, delivering a 15% improvement and $145,000 in savings.';
  const res = runDeterministicValidation(text, rewrite);
  assert(res.status === 'PASS', 'Validation passes with all figures intact');
  assert(res.checksSummary.numbersPreserved === true, 'numbersPreserved is true');
  assert(res.checksSummary.datesPreserved === true, 'datesPreserved is true');
});

// 3. Detection of missing important information
suite('3. Detection of Missing Important Information', () => {
  const original = 'Elena Rostova scored 3.5/5.0 on Kubernetes with a target compensation of $120,000.';
  const missingRewrite = 'Elena demonstrated good systems experience and we enjoyed talking with her.';

  const result = runDeterministicValidation(original, missingRewrite, ['Elena Rostova']);
  assert(result.status === 'FAIL', 'Fails when critical score (3.5/5.0) and salary ($120,000) are omitted');
  assert(result.missingEntities.length >= 2, 'Flags missing numbers and metrics in missingEntities');
  assert(result.checksSummary.numbersPreserved === false, 'Detects numbersPreserved is false');
});

// 4. Detection of unsupported deadlines or promises
suite('4. Detection of Unsupported Deadlines or Promises', () => {
  const original = 'We received your interview feedback and will be in touch with an update.';
  const hallucinatedRewrite = 'We received your feedback and promise to extend a formal offer by next Friday at 5:00 PM with 200 stock options.';

  const detResult = runDeterministicValidation(original, hallucinatedRewrite);
  assert(detResult.newEntities.length > 0, 'Detects newly introduced unverified entities in rewrite');
  assert(detResult.status === 'REVIEW' || detResult.score < 100, 'Flags score penalty or REVIEW status for hallucinated figures');

  // Semantic audit catches unsupported promise
  const mockSemanticAddition = {
    status: 'FAIL' as const,
    meaningPreservationRating: 'ALTERED' as const,
    explanation: 'Rewrite made an unverified job offer commitment and deadline.',
    findings: [
      {
        type: 'unsupported_addition' as const,
        severity: 'definite_mismatch' as const,
        description: 'Promise of an offer by next Friday was not in the original text.',
      },
    ],
  };
  const combined = combineValidationResults(detResult, mockSemanticAddition);
  assert(combined.overallStatus === 'FAIL', 'Combined validation outputs FAIL when semantic check finds unsupported promises');
});

// 5. Detection of meaning-changing rewrites
suite('5. Detection of Meaning-Changing Rewrites', () => {
  const detResult = runDeterministicValidation('Original text sample', 'Rewritten text sample');
  const mockSemanticContradiction = {
    status: 'FAIL' as const,
    meaningPreservationRating: 'ALTERED' as const,
    explanation: 'Tone shift inverted rejection into praise.',
    findings: [
      {
        type: 'contradiction' as const,
        severity: 'definite_mismatch' as const,
        description: 'Original expressed polite decline; rewrite claimed advancement.',
      },
    ],
  };

  const combined = combineValidationResults(detResult, mockSemanticContradiction);
  assert(combined.overallStatus === 'FAIL', 'Fails rewrite that inverts or contradicts meaning');
  assert(combined.statusHeadline.includes('Material Discrepancy'), 'Provides clear headline for material mismatch');
});

// 6. Acceptance of legitimate paraphrases
suite('6. Acceptance of Legitimate Paraphrases', () => {
  const original = 'Candidate scored 4.8/5.0 on October 14, 2026, receiving a 15% bonus and $145,000 package.';
  // Legitimate paraphrases: "15 percent", "$145k", "4.8 out of 5", "Oct 14, 2026"
  const paraphrasedRewrite = 'The candidate achieved 4.8 out of 5 on Oct 14, 2026, earning a 15 percent bonus and $145k compensation.';

  const entityScore: ExtractedEntity = { type: 'metric_score', value: '4.8/5.0', foundInRewrite: false };
  const entityPercent: ExtractedEntity = { type: 'percentage', value: '15%', foundInRewrite: false };
  const entityCurrency: ExtractedEntity = { type: 'currency', value: '$145,000', foundInRewrite: false };
  const entityDate: ExtractedEntity = { type: 'date_time', value: 'October 14, 2026', foundInRewrite: false };

  assert(isEntityPreserved(entityScore, paraphrasedRewrite), 'Accepts "4.8 out of 5" for "4.8/5.0"');
  assert(isEntityPreserved(entityPercent, paraphrasedRewrite), 'Accepts "15 percent" for "15%"');
  assert(isEntityPreserved(entityCurrency, paraphrasedRewrite), 'Accepts "$145k" for "$145,000"');
  assert(isEntityPreserved(entityDate, paraphrasedRewrite), 'Accepts "Oct 14, 2026" for "October 14, 2026"');

  const detResult = runDeterministicValidation(original, paraphrasedRewrite);
  const mockSemanticParaphrasePass = {
    status: 'PASS' as const,
    meaningPreservationRating: 'EXACT' as const,
    explanation: 'Legitimate paraphrase that faithfully communicates all core details.',
    findings: [],
  };
  const combined = combineValidationResults(detResult, mockSemanticParaphrasePass);
  assert(combined.overallStatus === 'PASS', 'Combines as PASS for faithful paraphrasing');
});

// 7. Missing Gemini API key handling
suite('7. Missing Gemini API Key Handling', () => {
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    assert(hasGeminiKey() === false, 'hasGeminiKey() returns false when GEMINI_API_KEY is not set');

    let threwExpected = false;
    try {
      getGeminiClient();
    } catch (e: any) {
      threwExpected = e.message.includes('GEMINI_API_KEY is not configured');
    }
    assert(threwExpected, 'getGeminiClient() throws informative error when key is missing');
  } finally {
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  }
});

// 8. Gemini API failure, timeout, or rate limiting
suite('8. Gemini API Failure, Timeout, and Rate Limiting', () => {
  const rateLimitErr = new Error('429 RESOURCE_EXHAUSTED: Rate limit reached');
  const userRateLimitMsg = formatGeminiErrorMessage(rateLimitErr);
  assert(userRateLimitMsg.includes('rate limit or quota exceeded'), 'Formats 429 rate limit error cleanly');

  const unavailableErr = new Error('503 UNAVAILABLE: The model is overloaded');
  const userUnavailableMsg = formatGeminiErrorMessage(unavailableErr);
  assert(userUnavailableMsg.includes('high demand'), 'Formats 503 service unavailable error cleanly');

  const invalidKeyErr = new Error('400 API_KEY_INVALID: API key not valid');
  const userInvalidKeyMsg = formatGeminiErrorMessage(invalidKeyErr);
  assert(userInvalidKeyMsg.includes('invalid or unauthorized'), 'Formats API_KEY_INVALID error cleanly');

  const oauthFormatErr = new Error('ACCESS_TOKEN_TYPE_UNSUPPORTED: Expected OAuth 2 access token');
  const userOauthMsg = formatGeminiErrorMessage(oauthFormatErr);
  assert(userOauthMsg.includes('Invalid key format') && userOauthMsg.includes('AIza'), 'Formats ACCESS_TOKEN_TYPE_UNSUPPORTED cleanly');

  const modelDeprecatedErr = new Error('This model models/gemini-2.5-flash is no longer available to new users.');
  const userDeprecatedMsg = formatGeminiErrorMessage(modelDeprecatedErr);
  assert(userDeprecatedMsg.includes('gemini-3.8-flash') || userDeprecatedMsg.includes('unavailable'), 'Formats model deprecation error cleanly');

  const timeoutErr = new Error('ETIMEDOUT: Connection timed out');
  const userTimeoutMsg = formatGeminiErrorMessage(timeoutErr);
  assert(userTimeoutMsg.includes('timed out'), 'Formats network timeout cleanly');
});

// 9. Invalid input and boundary conditions
suite('9. Invalid Input and Boundary Text Handling', () => {
  assert(!validateInputParams('', 'recruiter_feedback', 'professional').isValid, 'Rejects empty input string');
  assert(!validateInputParams('   \n  \t', 'recruiter_feedback', 'professional').isValid, 'Rejects whitespace-only input');
  assert(!validateInputParams('Hey', 'recruiter_feedback', 'professional').isValid, 'Rejects input shorter than 5 chars');
  assert(!validateInputParams('Valid prompt text', 'fake_context', 'professional').isValid, 'Rejects unrecognized context');
  assert(!validateInputParams('Valid prompt text', 'recruiter_feedback', 'fake_tone').isValid, 'Rejects unrecognized tone');

  const oversized = 'a'.repeat(20005);
  assert(!validateInputParams(oversized, 'recruiter_feedback', 'professional').isValid, 'Rejects text exceeding 20,000 characters');

  assert(validateInputParams('Elena completed the full interview cycle with high marks.', 'recruiter_feedback', 'conversational').isValid, 'Accepts valid workplace input');
});

// 10. Graceful handling of validation errors and uncertainty
suite('10. Graceful Handling of Validation Errors and Uncertainty', () => {
  const detResult = runDeterministicValidation('Some source text here', 'Some rewrite text here');

  // Semantic auditor returns REVIEW when uncertain
  const mockUncertainSemantic = {
    status: 'REVIEW' as const,
    meaningPreservationRating: 'SLIGHT_VARIATION' as const,
    explanation: 'Automated semantic AI audit could not complete definitive verification.',
    findings: [
      {
        type: 'subtle_shift' as const,
        severity: 'uncertain_review' as const,
        description: 'Automated semantic validation could not confirm every nuance with certainty.',
      },
    ],
  };

  const combined = combineValidationResults(detResult, mockUncertainSemantic);
  assert(combined.overallStatus === 'REVIEW', 'Reports uncertainty as REVIEW instead of false PASS');
  assert(combined.statusHeadline.includes('Review Advised'), 'Advises human review for ambiguous semantics');
  assert(combined.summaryReason.length > 0, 'Includes helpful reason for review');
});

// 11. Gemini Model Configuration and Verification
suite('11. Gemini Model Configuration and Verification', () => {
  assert(GEMINI_MODEL === 'gemini-3.8-flash', 'Default GEMINI_MODEL is updated to gemini-3.8-flash');
  assert(FALLBACK_MODELS[0] === 'gemini-3.8-flash', 'First model in FALLBACK_MODELS is gemini-3.8-flash');
  assert(FALLBACK_MODELS.length >= 3, 'FALLBACK_MODELS includes multiple backup options');

  // Verify runtime key setting
  const originalEnvKey = process.env.GEMINI_API_KEY;
  try {
    setRuntimeGeminiKey('AIzaSyMockKeyForVerificationTest9999');
    assert(hasGeminiKey() === true, 'hasGeminiKey() returns true after setRuntimeGeminiKey');
    assert(process.env.GEMINI_API_KEY === 'AIzaSyMockKeyForVerificationTest9999', 'process.env.GEMINI_API_KEY updated correctly');
  } finally {
    if (originalEnvKey) {
      process.env.GEMINI_API_KEY = originalEnvKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }
});

console.log('\n====================================================');
console.log(`📊 FINAL TEST SUMMARY: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✨ All 11 hackathon reliability & validation test suites PASSED!\n');
}
