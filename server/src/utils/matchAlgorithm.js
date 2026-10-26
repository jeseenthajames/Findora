// Stop words to exclude during keyword extraction
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'near', 'about', 'is', 'it', 'my', 'i', 'was', 'lost', 'found',
  'please', 'help', 'have', 'has', 'this', 'that', 'there', 'some'
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

/**
 * Calculates match score and reasons between a source item and a candidate item.
 * @param {Object} source - The reference item (e.g., lost item)
 * @param {Object} candidate - The candidate item (e.g., found item)
 * @returns {Object} { score, matchStrength, reasons }
 */
export const calculateItemMatch = (source, candidate) => {
  let score = 0;
  const reasons = [];

  // 1. Category Matching (Weight: 35 points)
  if (source.category && candidate.category && source.category === candidate.category) {
    score += 35;
    reasons.push(`Matching category: ${source.category}`);
  }

  // 2. Title Keyword Overlap (Weight: Up to 30 points)
  const sourceTitleWords = tokenize(source.title);
  const candidateTitleWords = new Set(tokenize(candidate.title));
  const matchedTitleWords = sourceTitleWords.filter((w) => candidateTitleWords.has(w));
  const uniqueTitleMatches = [...new Set(matchedTitleWords)];

  if (uniqueTitleMatches.length > 0) {
    const titleScore = Math.min(30, uniqueTitleMatches.length * 15);
    score += titleScore;
    reasons.push(`Title keywords matched: "${uniqueTitleMatches.join('", "')}"`);
  }

  // 3. Location Overlap / Proximity (Weight: Up to 15 points)
  const sourceLocWords = tokenize(source.location);
  const candidateLocWords = new Set(tokenize(candidate.location));
  const matchedLocWords = sourceLocWords.filter((w) => candidateLocWords.has(w));
  const uniqueLocMatches = [...new Set(matchedLocWords)];

  if (uniqueLocMatches.length > 0) {
    score += 15;
    reasons.push(`Similar campus location keywords: "${uniqueLocMatches.join('", "')}"`);
  }

  // 4. Description Keyword Overlap (Weight: Up to 10 points)
  const sourceDescWords = tokenize(source.description);
  const candidateDescWords = new Set(tokenize(candidate.description));
  const matchedDescWords = sourceDescWords.filter((w) => candidateDescWords.has(w));
  const uniqueDescMatches = [...new Set(matchedDescWords)];

  if (uniqueDescMatches.length > 0 && uniqueTitleMatches.length === 0) {
    // If title didn't already capture these, give description points
    const descScore = Math.min(10, uniqueDescMatches.length * 5);
    score += descScore;
    reasons.push(`Description keywords matched: "${uniqueDescMatches.slice(0, 3).join('", "')}"`);
  }

  // 5. Date Proximity (Weight: Up to 10 points)
  if (source.eventDate && candidate.eventDate) {
    const d1 = new Date(source.eventDate).getTime();
    const d2 = new Date(candidate.eventDate).getTime();
    const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

    if (diffDays <= 2) {
      score += 10;
      reasons.push(`Reported event dates within 2 days of each other`);
    } else if (diffDays <= 7) {
      score += 5;
      reasons.push(`Reported event dates within 1 week of each other`);
    }
  }

  // Determine strength label
  let matchStrength = 'Low';
  if (score >= 65) {
    matchStrength = 'High';
  } else if (score >= 40) {
    matchStrength = 'Moderate';
  } else {
    matchStrength = 'Fair';
  }

  return {
    score: Math.min(100, Math.round(score)),
    matchStrength,
    reasons: reasons.length > 0 ? reasons : ['General campus item overlap']
  };
};
