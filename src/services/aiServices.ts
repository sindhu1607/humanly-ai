import { Type } from '@google/genai';
import { generateContentWithRetry, GEMINI_MODEL } from './geminiClient.ts';
import {
  HumanlyContext,
  HumanlyTone,
  RoboticAnalysisResult,
  SemanticValidationResult,
} from '../types/humanly.ts';

const CONTEXT_GUIDELINES: Record<HumanlyContext, string> = {
  recruiter_feedback:
    'Recruiter Feedback: Empathetic, direct, constructive, actionable, and respectful to the applicant. Avoid hollow corporate jargon or sterile rejection formulas.',
  candidate_communication:
    'Candidate Communication: Warm, welcoming, clear, and reassuring. Focus on setting clear expectations and genuine human warmth in interview coordination.',
  interview_questions:
    'Interview Questions: Conversational, thoughtful, engaging prompts that encourage candidates to share real stories and depth without feeling interrogated.',
  interview_summaries:
    'Interview Summaries: Balanced, structured, objective evaluation debriefs highlighting both strengths and growth opportunities clearly and without robotic boilerplate.',
  professional_reports:
    'Professional Reports: High executive clarity, active voice, punchy observations, and structured takeaways without bureaucratic fluff.',
  general_professional:
    'General Professional Communication: Clear, personable, crisp, and natural workplace correspondence that sounds written by a thoughtful colleague.',
};

const TONE_GUIDELINES: Record<HumanlyTone, string> = {
  professional: 'Clear, authoritative, respectful, measured, and direct without stiffness.',
  polished: 'Articulate, smooth, elegant, engaging, with fluid sentence rhythm and high precision.',
  conversational: 'Approachable, friendly, authentic, and relaxed while keeping workplace decorum.',
};

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Step 4: Robotic Language & Stiffness Detection
 * Identifies robotic markers, repetitive phrases, stiff phrasing, and awkward transitions.
 */
export async function analyzeRoboticLanguage(
  text: string,
  context: HumanlyContext
): Promise<RoboticAnalysisResult> {
  const prompt = `You are a linguist and natural language refinement specialist.
Analyze the following text for robotic markers, bureaucratic stiffness, unnatural syntax, and corporate cliché.

Context domain: ${CONTEXT_GUIDELINES[context] || context}

Evaluate the text across these 5 dimensions:
1. Repetitive phrases (e.g. repeated sentence stems, robotic transitions like "Furthermore", "In conclusion").
2. Overly formal or templated formulas (e.g. "I hope this email finds you well", "Please be advised that", "delve into").
3. Awkward transitions (e.g. mechanical paragraph connectors, jerky pivots).
4. Unnatural wording (e.g. stiff passive voice, thesaurus substitutions, algorithmic phrasing).
5. Unnecessary verbosity (e.g. filler words, inflated syllables where simple prose works better).

Note: Do not claim to possess an infallible AI detector. Frame findings as language-quality observations and naturalness critique.

Text to analyze:
"""
${text}
"""`;

  const response = await generateContentWithRetry({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallAssessment: {
            type: Type.STRING,
            description: 'Overall critique of the text naturalness and rhythm',
          },
          readabilityNotes: {
            type: Type.STRING,
            description: 'Specific notes on flow, tone, and pacing',
          },
          roboticDensity: {
            type: Type.STRING,
            description: 'Estimated robotic density: low, moderate, or high',
          },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description:
                    'One of: repetitive_phrases, overly_formal_or_templated, awkward_transitions, unnatural_wording, unnecessary_verbosity',
                },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                excerpt: { type: Type.STRING, description: 'Direct excerpt from the text' },
                suggestion: { type: Type.STRING, description: 'Natural alternative or fix' },
              },
              required: ['category', 'title', 'description', 'excerpt', 'suggestion'],
            },
          },
        },
        required: ['overallAssessment', 'readabilityNotes', 'roboticDensity', 'issues'],
      },
    },
  });

  const rawJson = cleanJsonString(response.text || '{}');
  try {
    const parsed = JSON.parse(rawJson);
    return {
      overallAssessment: parsed.overallAssessment || 'Assessment completed.',
      readabilityNotes: parsed.readabilityNotes || '',
      roboticDensity:
        parsed.roboticDensity === 'low' || parsed.roboticDensity === 'high'
          ? parsed.roboticDensity
          : 'moderate',
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    };
  } catch (err) {
    throw new Error(`Failed to parse robotic analysis output: ${(err as Error).message}`);
  }
}

/**
 * Step 5: Contextual AI Humanization
 * Transforms robotic phrasing into natural, fluent workplace communication.
 * Instructs model to respect facts, numbers, dates, names, and intent.
 */
export async function humanizeText(
  text: string,
  context: HumanlyContext,
  tone: HumanlyTone,
  protectedTerms: string[] = []
): Promise<{ rewrittenText: string; changesSummary: string; toneApplied: string }> {
  const protectedInstruction =
    protectedTerms.length > 0
      ? `CRITICAL PROTECTED TERMS: You MUST preserve the following terms exactly without removal or modification: ${protectedTerms.map(t => `"${t}"`).join(', ')}.`
      : '';

  const prompt = `You are HumanlyAI, an expert human communication layer and natural language refinement specialist.

Your task is to rewrite the provided machine-generated text so that it sounds like natural, authentic, polished human writing, WITHOUT changing its original meaning.

IMPORTANT PRESERVATION GUIDELINES:
1. FACTUAL ACCURACY: You must retain all exact facts, data, numbers, scores, percentages, dates, times, deadlines, and technical terminology. Do NOT alter numerical values or invent unmentioned figures.
2. NO HALLUCINATIONS: Do NOT introduce commitments, promises, timelines, requirements, or skills that were not present in the original text.
3. PRESERVE CORE INTENT: Maintain the underlying message, tone boundary, and decision (e.g. praise stays praise; constructive rejection remains rejection).
4. NATURAL RHYTHM: Vary sentence lengths. Eliminate formulaic connectors ("Furthermore", "In conclusion", "As previously stated"). Use natural active phrasing where appropriate.
${protectedInstruction}

Context Domain:
${CONTEXT_GUIDELINES[context] || context}

Humanization Style / Tone:
${TONE_GUIDELINES[tone] || tone}

Original Text to Refine:
"""
${text}
"""`;

  const response = await generateContentWithRetry({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.35,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rewrittenText: {
            type: Type.STRING,
            description: 'The natural, refined human rewrite of the text.',
          },
          changesSummary: {
            type: Type.STRING,
            description: 'Bullet points or summary of specific rhythm, wording, and cadence changes made.',
          },
          toneApplied: {
            type: Type.STRING,
            description: 'Brief description of how the requested tone was adapted.',
          },
        },
        required: ['rewrittenText', 'changesSummary', 'toneApplied'],
      },
    },
  });

  const rawJson = cleanJsonString(response.text || '{}');
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed.rewrittenText || parsed.rewrittenText.trim().length === 0) {
      throw new Error('Model produced an empty rewrite.');
    }
    return {
      rewrittenText: parsed.rewrittenText.trim(),
      changesSummary: parsed.changesSummary || 'Refined robotic phrasing for natural flow and tone.',
      toneApplied: parsed.toneApplied || tone,
    };
  } catch (err) {
    throw new Error(`Failed to parse humanize response: ${(err as Error).message}`);
  }
}

/**
 * Step 6: AI-Assisted Semantic Comparison
 * Compares original and rewritten text for semantic faithfulness, unsupported additions,
 * omitted nuances, and contradictions, while accepting legitimate paraphrases.
 */
export async function validateSemanticPreservation(
  originalText: string,
  rewrittenText: string,
  context: HumanlyContext
): Promise<SemanticValidationResult> {
  const prompt = `You are an impartial Factuality and Semantic Validation Auditor.
Compare the ORIGINAL text against the REWRITTEN text.

Context domain: ${context}

Audit checklist:
1. Meaning Preservation & Paraphrasing: Does the rewrite convey the core message and intent? Legitimate paraphrasing (using different natural vocabulary or sentence structure to express the same idea) is ACCEPTABLE and should be marked as "PASS" or "safe".
2. Unsupported Additions: Did the rewrite introduce new promises, unmentioned deadlines, invented skills, or fabricated commitments?
3. Omitted Information: Did the rewrite omit any crucial instructions, caveats, dates, scores, or specifics?
4. Contradictions or Shifted Claims: Did any tone shift turn criticism into praise, distort facts, or alter the original intent?

Validation Outcome Criteria:
- "PASS": Core meaning is preserved faithfully. Legitimate paraphrasing and stylistic refinements without factual distortion or unsupported additions.
- "REVIEW": Minor nuance shifts, ambiguous phrasing, or subjective softening that benefits from human review, but no severe factual contradiction.
- "FAIL": Material mismatch, contradiction, omitted essential facts, or fabricated promises/deadlines.

Original Text:
"""
${originalText}
"""

Rewritten Text:
"""
${rewrittenText}
"""`;

  try {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: 'One of: PASS, REVIEW, FAIL',
            },
            meaningPreservationRating: {
              type: Type.STRING,
              description: 'One of: EXACT, SLIGHT_VARIATION, ALTERED',
            },
            explanation: {
              type: Type.STRING,
              description: 'Honest, precise explanation of the validation findings.',
            },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description:
                      'One of: unsupported_addition, omitted_information, contradiction, subtle_shift, preserved_meaning',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'One of: definite_mismatch, uncertain_review, safe',
                  },
                  description: { type: Type.STRING },
                  originalSnippet: { type: Type.STRING },
                  rewriteSnippet: { type: Type.STRING },
                },
                required: ['type', 'severity', 'description'],
              },
            },
          },
          required: ['status', 'meaningPreservationRating', 'explanation', 'findings'],
        },
      },
    });

    const rawJson = cleanJsonString(response.text || '{}');
    const parsed = JSON.parse(rawJson);
    const validStatus =
      parsed.status === 'PASS' || parsed.status === 'FAIL' || parsed.status === 'REVIEW'
        ? parsed.status
        : 'REVIEW';

    const validRating =
      parsed.meaningPreservationRating === 'EXACT' ||
      parsed.meaningPreservationRating === 'ALTERED'
        ? parsed.meaningPreservationRating
        : 'SLIGHT_VARIATION';

    return {
      status: validStatus,
      meaningPreservationRating: validRating,
      explanation: parsed.explanation || 'Semantic validation audit complete.',
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
    };
  } catch (err: any) {
    // Gracefully report uncertainty if semantic validator encounters an error or network glitch
    console.warn('Semantic validation model evaluation warning:', err?.message || err);
    return {
      status: 'REVIEW',
      meaningPreservationRating: 'SLIGHT_VARIATION',
      explanation:
        'Automated semantic AI audit could not complete definitive verification. Deterministic entity checks remain valid, but human review of rewrite is recommended.',
      findings: [
        {
          type: 'subtle_shift',
          severity: 'uncertain_review',
          description: `Semantic evaluation status: ${err?.message || 'Verification could not be confirmed automatically.'}`,
        },
      ],
    };
  }
}
