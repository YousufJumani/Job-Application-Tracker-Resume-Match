import type { MatchResult } from "../types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "will",
  "are",
  "our",
  "this",
  "that",
  "from",
  "into",
  "have",
  "has",
  "role",
  "team",
  "teams",
  "developer",
  "engineer",
  "work",
  "working",
  "skills",
]);

export function extractKeywords(text: string, max = 14): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#/-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([token]) => token);
}

export function computeMatch(jobDescription: string, resumeText: string): MatchResult {
  const keywords = extractKeywords(jobDescription, 12);
  if (keywords.length === 0) {
    return { score: 0, matchedKeywords: [], missingKeywords: [] };
  }

  const resume = resumeText.toLowerCase();
  const matchedKeywords = keywords.filter((k) => resume.includes(k));
  const missingKeywords = keywords.filter((k) => !resume.includes(k));
  const score = Math.round((matchedKeywords.length / keywords.length) * 100);

  return { score, matchedKeywords, missingKeywords };
}
