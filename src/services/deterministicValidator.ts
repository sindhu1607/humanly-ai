import { DeterministicValidationResult, ExtractedEntity, ValidationStatus } from '../types/humanly.ts';

// Common technical and professional terms to recognize deterministically
const KNOWN_TECH_AND_DOMAIN_TERMS = new Set([
  'react', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'python', 'fastapi',
  'django', 'flask', 'node.js', 'express', 'postgresql', 'mysql', 'mongodb', 'redis',
  'kafka', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'graphql', 'rest', 'api',
  'apis', 'ci/cd', 'github', 'gitlab', 'git', 'terraform', 'linux', 'bash',
  'system design', 'microservices', 'oauth', 'jwt', 'grpc', 'sql', 'nosql',
  'agile', 'scrum', 'kanban', 'jira', 'figma', 'okr', 'kpi', 'roi', 'sla', 'slo'
]);

/**
 * Extracts entities with high precision: numbers, percentages, currencies,
 * dates/times, scores, technical terms, and protected keywords.
 */
export function extractEntities(text: string, userProtectedTerms: string[] = []): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seenValues = new Set<string>();

  const addEntity = (type: ExtractedEntity['type'], value: string) => {
    const trimmed = value.trim();
    const key = `${type}:${trimmed.toLowerCase()}`;
    if (trimmed.length > 0 && !seenValues.has(key)) {
      seenValues.add(key);
      entities.push({
        type,
        value: trimmed,
        foundInRewrite: false,
      });
    }
  };

  // 1. User Protected Terms
  for (const term of userProtectedTerms) {
    if (term && term.trim().length > 0) {
      const regex = new RegExp(`\\b${escapeRegExp(term.trim())}\\b`, 'i');
      if (regex.test(text)) {
        addEntity('protected_term', term.trim());
      }
    }
  }

  // 2. Currencies (e.g. $100,000, €45.50, £20k)
  const currencyMatches = text.match(/[\$\€\£\¥]\s?\d+(?:,\d{3})*(?:\.\d+)?(?:\s?[kKmMbB])?/g);
  if (currencyMatches) {
    currencyMatches.forEach(m => addEntity('currency', m));
  }

  // 3. Percentages (e.g. 15%, 99.9%, 0.5 percent)
  const percentMatches = text.match(/\b\d+(?:\.\d+)?\s*(?:%|\bpercent\b)/gi);
  if (percentMatches) {
    percentMatches.forEach(m => addEntity('percentage', m));
  }

  // 4. Metric scores / ratings (e.g. 4.5/5, 8/10, 95/100, 3.8 out of 5)
  const scoreMatches = text.match(/\b\d+(?:\.\d+)?\s*(?:\/|\s*out of\s*)\s*\d+(?:\.\d+)?\b/gi);
  if (scoreMatches) {
    scoreMatches.forEach(m => addEntity('metric_score', m));
  }

  // 5. Dates & Years & Time intervals (e.g. "October 14", "Q3 2026", "2026", "2:30 PM", "3 weeks", "4 months")
  const datePatterns = [
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?\b/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\bQ[1-4](?:\s*\d{4})?\b/gi,
    /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b/g,
    /\b(?:20\d{2})\b/g,
    /\b\d+\s+(?:days?|weeks?|months?|years?|hours?|minutes?)\b/gi
  ];
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => addEntity('date_time', m));
    }
  }

  // 6. Standalone numbers not already captured (e.g. integers and decimals like "42", "3.14")
  const generalNumberMatches = text.match(/\b\d+(?:\.\d+)?\b/g);
  if (generalNumberMatches) {
    generalNumberMatches.forEach(num => {
      // Don't duplicate if already part of score, year, or currency
      const alreadyCaptured = entities.some(e => e.value.includes(num));
      if (!alreadyCaptured && num.length > 0) {
        addEntity('number', num);
      }
    });
  }

  // 7. Known Tech & Domain Terms
  const words = text.toLowerCase().match(/\b[a-z0-9\/\.\-]+(?:\s+[a-z0-9\/\.\-]+)?\b/g) || [];
  for (const word of words) {
    if (KNOWN_TECH_AND_DOMAIN_TERMS.has(word)) {
      addEntity('technical_term', word);
    }
  }

  // 8. Capitalized Proper Names / Multi-word entities (e.g., "Sarah Jenkins", "Project Orion")
  const properNameMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g);
  if (properNameMatches) {
    properNameMatches.forEach(name => {
      // Strip common title/role prefixes or sentence prepositions
      const cleanedName = name
        .replace(/^(Candidate|Applicant|Mr|Ms|Mrs|Dr|Prof|Director|Manager|Lead|Engineer|On|In|At|From|During|For|With|After|Before|As)\s+/i, '')
        .trim();
      const lower = cleanedName.toLowerCase();
      
      // Avoid duplicating with existing protected terms or date entities
      const matchesProtected = entities.some(e => e.type === 'protected_term' && e.value.toLowerCase() === lower);
      if (matchesProtected) return;

      const matchesDate = entities.some(
        e => e.type === 'date_time' && (e.value.toLowerCase().includes(lower) || lower.includes(e.value.toLowerCase()))
      );
      if (matchesDate) return;

      const isMonth = /(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(lower);
      if (isMonth) return;

      // Filter out sentence starters like "The Quick", "In Order"
      if (!lower.startsWith('in order') && !lower.startsWith('as such') && !lower.startsWith('on the') && !lower.startsWith('for example')) {
        if (cleanedName.includes(' ')) {
          addEntity('proper_name', cleanedName);
        }
      }
    });
  }

  return entities;
}

/**
 * Checks if a specific entity value is preserved in the rewritten text.
 * Uses flexible matching (e.g. normalized whitespace, numeric equivalents).
 */
export function isEntityPreserved(entity: ExtractedEntity, rewrittenText: string): boolean {
  const normRewrite = rewrittenText.toLowerCase().replace(/\s+/g, ' ');
  const normValue = entity.value.toLowerCase().replace(/\s+/g, ' ');

  // Exact or word-boundary match
  if (normRewrite.includes(normValue)) {
    return true;
  }

  // For numbers/percentages: check numeric equivalence (e.g. "15%" vs "15 percent")
  if (entity.type === 'percentage') {
    const numOnly = entity.value.replace(/[^0-9\.]/g, '');
    const percentWord = `${numOnly} percent`;
    const percentSymbol = `${numOnly}%`;
    if (normRewrite.includes(percentWord) || normRewrite.includes(percentSymbol)) {
      return true;
    }
  }

  // For scores: check "4.8/5.0" vs "4.8 out of 5" or "4.8 / 5"
  if (entity.type === 'metric_score') {
    const nums = entity.value.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 2) {
      const matchFirst = normRewrite.includes(nums[0]) || normRewrite.includes(String(parseFloat(nums[0])));
      const matchSecond = normRewrite.includes(nums[1]) || normRewrite.includes(String(parseFloat(nums[1])));
      if (matchFirst && matchSecond) {
        return true;
      }
    }
  }

  // For currency: check "$50k" vs "$50,000" or "50,000 USD"
  if (entity.type === 'currency' || entity.type === 'number') {
    const cleanNum = entity.value.replace(/[^0-9\.]/g, '');
    if (cleanNum && normRewrite.includes(cleanNum)) {
      return true;
    }
    // Check 'k' abbreviation, e.g. 145000 -> 145k
    if (cleanNum && cleanNum.length > 3 && cleanNum.endsWith('000')) {
      const thousands = `${cleanNum.slice(0, -3)}k`;
      if (normRewrite.includes(thousands)) {
        return true;
      }
    }
  }

  // For date_time: check variations like "October 14, 2026" vs "Oct 14, 2026"
  if (entity.type === 'date_time') {
    const monthMatch = entity.value.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
    const dayMatch = entity.value.match(/\b\d{1,2}\b/);
    const yearMatch = entity.value.match(/\b20\d{2}\b/);
    if (monthMatch && dayMatch) {
      const monthPrefix = monthMatch[1].slice(0, 3).toLowerCase();
      if (normRewrite.includes(monthPrefix) && normRewrite.includes(dayMatch[0])) {
        if (!yearMatch || normRewrite.includes(yearMatch[0])) {
          return true;
        }
      }
    }
  }

  // For proper names: check first or last name if multi-word
  if (entity.type === 'proper_name') {
    const parts = entity.value.split(/\s+/);
    if (parts.length >= 2) {
      // Must find at least the primary family or given name
      return parts.every(part => normRewrite.includes(part.toLowerCase()));
    }
  }

  return false;
}

/**
 * Executes full deterministic validation between original and rewritten text.
 */
export function runDeterministicValidation(
  originalText: string,
  rewrittenText: string,
  protectedTerms: string[] = []
): DeterministicValidationResult {
  const origEntities = extractEntities(originalText, protectedTerms);
  const rewriteEntities = extractEntities(rewrittenText, protectedTerms);

  const preserved: ExtractedEntity[] = [];
  const missing: ExtractedEntity[] = [];
  const messages: string[] = [];

  for (const entity of origEntities) {
    const found = isEntityPreserved(entity, rewrittenText);
    const updated: ExtractedEntity = { ...entity, foundInRewrite: found };
    if (found) {
      preserved.push(updated);
    } else {
      missing.push(updated);
    }
  }

  // Check for newly introduced numbers or dates that weren't in the original
  const newEntities: ExtractedEntity[] = [];
  for (const rEnt of rewriteEntities) {
    if (rEnt.type === 'number' || rEnt.type === 'percentage' || rEnt.type === 'currency' || rEnt.type === 'date_time') {
      const existedInOrig = isEntityPreserved(rEnt, originalText);
      if (!existedInOrig) {
        newEntities.push(rEnt);
      }
    }
  }

  // Categorize checks
  const criticalMissingNumbers = missing.filter(
    e => e.type === 'number' || e.type === 'currency' || e.type === 'percentage' || e.type === 'metric_score'
  );
  const missingDates = missing.filter(e => e.type === 'date_time');
  const missingNames = missing.filter(e => e.type === 'proper_name');
  const missingProtected = missing.filter(e => e.type === 'protected_term');

  let status: ValidationStatus = 'PASS';
  let score = 100;

  if (origEntities.length > 0) {
    const ratio = preserved.length / origEntities.length;
    score = Math.round(ratio * 100);
  }

  // Deduct score for newly introduced unverified numbers
  if (newEntities.length > 0) {
    score = Math.max(0, score - newEntities.length * 15);
  }

  if (missingProtected.length > 0) {
    status = 'FAIL';
    messages.push(`Protected term(s) missing from rewrite: ${missingProtected.map(p => `"${p.value}"`).join(', ')}`);
  }

  if (criticalMissingNumbers.length > 0) {
    status = 'FAIL';
    messages.push(`Numeric values or metrics missing from rewrite: ${criticalMissingNumbers.map(n => `"${n.value}"`).join(', ')}`);
  }

  if (missingDates.length > 0) {
    if (status !== 'FAIL') status = 'REVIEW';
    messages.push(`Date/time entity potentially omitted: ${missingDates.map(d => `"${d.value}"`).join(', ')}`);
  }

  if (missingNames.length > 0) {
    if (status !== 'FAIL') status = 'REVIEW';
    messages.push(`Proper name(s) missing or modified: ${missingNames.map(n => `"${n.value}"`).join(', ')}`);
  }

  if (newEntities.length > 0) {
    if (status !== 'FAIL') status = 'REVIEW';
    messages.push(`Newly introduced numeric/date facts detected in rewrite: ${newEntities.map(e => `"${e.value}"`).join(', ')}`);
  }

  if (missing.length === 0 && newEntities.length === 0) {
    messages.push(`All ${origEntities.length} identified deterministic entities (numbers, dates, terms, names) successfully preserved.`);
  }

  return {
    status,
    score,
    preservedEntities: preserved,
    missingEntities: missing,
    newEntities,
    checksSummary: {
      totalEntitiesFound: origEntities.length,
      preservedCount: preserved.length,
      missingCount: missing.length,
      newUnverifiedCount: newEntities.length,
      numbersPreserved: criticalMissingNumbers.length === 0,
      datesPreserved: missingDates.length === 0,
      namesPreserved: missingNames.length === 0,
    },
    messages,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
