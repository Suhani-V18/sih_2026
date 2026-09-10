// Confidence threshold below which a problem's AI match is considered
// low-confidence — universities get a "mark as non-innovative" option
// in addition to the normal accept/decline.
export const NON_INNOVATIVE_THRESHOLD = 0.7;

// Number of distinct universities that must mark a problem non-innovative
// before it's killed globally and stops being processed.
export const NON_INNOVATIVE_KILL_COUNT = 3;

export function isLowConfidenceMatch(
  aiConfidence: number | string | null | undefined
) {
  if (aiConfidence == null) return false;
  return Number(aiConfidence) < NON_INNOVATIVE_THRESHOLD;
}