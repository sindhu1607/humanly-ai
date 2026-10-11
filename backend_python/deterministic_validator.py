"""
HumanlyAI - Python Deterministic Validator
Performs factual, numeric, date, and entity preservation checks.
"""

import re
from typing import List, Dict, Any, Set

KNOWN_TECH_TERMS = {
    'react', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'python', 'fastapi',
    'django', 'flask', 'node.js', 'express', 'postgresql', 'mysql', 'mongodb', 'redis',
    'kafka', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'graphql', 'rest', 'api',
    'apis', 'ci/cd', 'github', 'gitlab', 'git', 'terraform', 'linux', 'bash',
    'system design', 'microservices', 'oauth', 'jwt', 'grpc', 'sql', 'nosql',
    'agile', 'scrum', 'kanban', 'jira', 'figma', 'okr', 'kpi', 'roi', 'sla', 'slo'
}


def extract_entities(text: str, user_protected_terms: List[str] = None) -> List[Dict[str, Any]]:
    if user_protected_terms is None:
        user_protected_terms = []

    entities = []
    seen = set()

    def add_entity(entity_type: str, value: str):
        cleaned = value.strip()
        key = f"{entity_type}:{cleaned.lower()}"
        if cleaned and key not in seen:
            seen.add(key)
            entities.append({
                "type": entity_type,
                "value": cleaned,
                "foundInRewrite": False
            })

    # Protected terms
    for term in user_protected_terms:
        if term and term.strip():
            pattern = re.compile(rf"\b{re.escape(term.strip())}\b", re.IGNORECASE)
            if pattern.search(text):
                add_entity("protected_term", term.strip())

    # Currencies
    for match in re.findall(r"[\$\€\£\¥]\s?\d+(?:,\d{3})*(?:\.\d+)?(?:\s?[kKmMbB])?", text):
        add_entity("currency", match)

    # Percentages
    for match in re.findall(r"\b\d+(?:\.\d+)?\s?(?:%|percent)\b", text, re.IGNORECASE):
        add_entity("percentage", match)

    # Metric scores
    for match in re.findall(r"\b\d+(?:\.\d+)?\s*(?:\/|\s*out of\s*)\s*\d+(?:\.\d+)?\b", text, re.IGNORECASE):
        add_entity("metric_score", match)

    # Dates and Times
    date_patterns = [
        r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?\b",
        r"\b\d{1,2}/\d{1,2}/\d{2,4}\b",
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\bQ[1-4](?:\s*\d{4})?\b",
        r"\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b",
        r"\b(?:20\d{2})\b",
        r"\b\d+\s+(?:days?|weeks?|months?|years?|hours?|minutes?)\b"
    ]
    for pattern in date_patterns:
        for match in re.findall(pattern, text, re.IGNORECASE):
            add_entity("date_time", match)

    # General numbers
    for match in re.findall(r"\b\d+(?:\.\d+)?\b", text):
        if not any(match in e["value"] for e in entities):
            add_entity("number", match)

    # Tech terms
    for word in re.findall(r"\b[a-z0-9\/\.\-]+(?:\s+[a-z0-9\/\.\-]+)?\b", text.lower()):
        if word in KNOWN_TECH_TERMS:
            add_entity("technical_term", word)

    # Proper names
    for match in re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b", text):
        lower = match.lower()
        if not lower.startswith(('in order', 'as such', 'on the', 'for example')):
            add_entity("proper_name", match)

    return entities


def is_entity_preserved(entity: Dict[str, Any], rewritten_text: str) -> bool:
    norm_rewrite = " ".join(rewritten_text.lower().split())
    norm_value = " ".join(entity["value"].lower().split())

    if norm_value in norm_rewrite:
        return True

    if entity["type"] == "percentage":
        num_only = re.sub(r"[^\d.]", "", entity["value"])
        if f"{num_only} percent" in norm_rewrite or f"{num_only}%" in norm_rewrite:
            return True

    if entity["type"] in ("currency", "number"):
        clean_num = re.sub(r"[^\d.]", "", entity["value"])
        if clean_num and clean_num in norm_rewrite:
            return True

    if entity["type"] == "proper_name":
        parts = entity["value"].split()
        if len(parts) >= 2:
            return all(p.lower() in norm_rewrite for p in parts)

    return False


def run_deterministic_validation(
    original_text: str,
    rewritten_text: str,
    protected_terms: List[str] = None
) -> Dict[str, Any]:
    if protected_terms is None:
        protected_terms = []

    orig_entities = extract_entities(original_text, protected_terms)
    rewrite_entities = extract_entities(rewritten_text, protected_terms)

    preserved = []
    missing = []
    messages = []

    for entity in orig_entities:
        found = is_entity_preserved(entity, rewritten_text)
        updated = dict(entity)
        updated["foundInRewrite"] = found
        if found:
            preserved.append(updated)
        else:
            missing.append(updated)

    new_entities = []
    for rent in rewrite_entities:
        if rent["type"] in ("number", "percentage", "currency", "date_time"):
            if not any(is_entity_preserved(o, rent["value"]) for o in orig_entities):
                new_entities.append(rent)

    critical_missing_numbers = [e for e in missing if e["type"] in ("number", "currency", "percentage", "metric_score")]
    missing_dates = [e for e in missing if e["type"] == "date_time"]
    missing_names = [e for e in missing if e["type"] == "proper_name"]
    missing_protected = [e for e in missing if e["type"] == "protected_term"]

    status = "PASS"
    score = 100
    if orig_entities:
        score = int(round((len(preserved) / len(orig_entities)) * 100))

    if new_entities:
        score = max(0, score - len(new_entities) * 15)

    if missing_protected:
        status = "FAIL"
        messages.append(f"Protected term(s) missing: {', '.join(p['value'] for p in missing_protected)}")

    if critical_missing_numbers:
        status = "FAIL"
        messages.append(f"Numeric/metric values missing: {', '.join(n['value'] for n in critical_missing_numbers)}")

    if missing_dates:
        if status != "FAIL":
            status = "REVIEW"
        messages.append(f"Date/time expression omitted: {', '.join(d['value'] for d in missing_dates)}")

    if missing_names:
        if status != "FAIL":
            status = "REVIEW"
        messages.append(f"Proper names modified/omitted: {', '.join(n['value'] for n in missing_names)}")

    if new_entities:
        if status != "FAIL":
            status = "REVIEW"
        messages.append(f"New unverified numeric/date facts introduced: {', '.join(e['value'] for e in new_entities)}")

    if not missing and not new_entities:
        messages.append(f"All {len(orig_entities)} identified deterministic entities preserved.")

    return {
        "status": status,
        "score": score,
        "preservedEntities": preserved,
        "missingEntities": missing,
        "newEntities": new_entities,
        "checksSummary": {
            "totalEntitiesFound": len(orig_entities),
            "preservedCount": len(preserved),
            "missingCount": len(missing),
            "newUnverifiedCount": len(new_entities),
            "numbersPreserved": len(critical_missing_numbers) == 0,
            "datesPreserved": len(missing_dates) == 0,
            "namesPreserved": len(missing_names) == 0
        },
        "messages": messages
    }
