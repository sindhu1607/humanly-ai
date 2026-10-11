export type HumanlyContext =
  | 'recruiter_feedback'
  | 'candidate_communication'
  | 'interview_questions'
  | 'interview_summaries'
  | 'professional_reports'
  | 'general_professional';

export type HumanlyTone = 'professional' | 'polished' | 'conversational';

export type ValidationStatus = 'PASS' | 'REVIEW' | 'FAIL';

export interface RoboticIssue {
  category:
    | 'repetitive_phrases'
    | 'overly_formal_or_templated'
    | 'awkward_transitions'
    | 'unnatural_wording'
    | 'unnecessary_verbosity';
  title: string;
  description: string;
  excerpt: string;
  suggestion: string;
}

export interface RoboticAnalysisResult {
  overallAssessment: string;
  readabilityNotes: string;
  issues: RoboticIssue[];
  roboticDensity: 'low' | 'moderate' | 'high';
}

export interface ExtractedEntity {
  type: 'number' | 'date_time' | 'percentage' | 'currency' | 'metric_score' | 'proper_name' | 'technical_term' | 'protected_term';
  value: string;
  foundInRewrite: boolean;
  contextSnippet?: string;
}

export interface DeterministicValidationResult {
  status: ValidationStatus;
  score: number; // 0 - 100
  preservedEntities: ExtractedEntity[];
  missingEntities: ExtractedEntity[];
  newEntities: ExtractedEntity[];
  checksSummary: {
    totalEntitiesFound: number;
    preservedCount: number;
    missingCount: number;
    newUnverifiedCount: number;
    numbersPreserved: boolean;
    datesPreserved: boolean;
    namesPreserved: boolean;
  };
  messages: string[];
}

export interface SemanticFinding {
  type: 'unsupported_addition' | 'omitted_information' | 'contradiction' | 'subtle_shift' | 'preserved_meaning';
  severity: 'definite_mismatch' | 'uncertain_review' | 'safe';
  description: string;
  originalSnippet?: string;
  rewriteSnippet?: string;
}

export interface SemanticValidationResult {
  status: ValidationStatus;
  meaningPreservationRating: 'EXACT' | 'SLIGHT_VARIATION' | 'ALTERED';
  explanation: string;
  findings: SemanticFinding[];
}

export interface CompleteValidationResult {
  overallStatus: ValidationStatus;
  statusHeadline: string;
  deterministic: DeterministicValidationResult;
  semantic: SemanticValidationResult;
  summaryReason: string;
  actionableGuidance?: string;
}

export interface HumanizeRequest {
  text: string;
  context: HumanlyContext;
  tone: HumanlyTone;
  protectedTerms?: string[];
}

export interface HumanizeResponse {
  originalText: string;
  rewrittenText: string;
  context: HumanlyContext;
  tone: HumanlyTone;
  protectedTerms: string[];
  changesSummary: string;
  roboticAnalysis?: RoboticAnalysisResult;
  validation: CompleteValidationResult;
  timestamp: string;
  processingTimeMs: number;
}
