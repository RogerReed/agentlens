/**
 * Prompt Analyzer — predict cost and suggest context before a session starts.
 * All functions are pure over workspace-pre-filtered SessionSummaryCard[].
 * No external API. No I/O.
 */

import type { SessionSummaryCard } from './summarizers/summarizerTypes'
import { calcTokenCostUsd } from './pricing'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScopeRiskSignal {
  label: string
  pattern: string
  upliftFactor: number  // relative to workspace average
  suggestion: string
}

export interface PromptAnalysisResult {
  similarSessions: SessionSummaryCard[]
  costRangeLow: number
  costRangeHigh: number
  turnsRangeLow: number
  turnsRangeHigh: number
  highVariance: boolean
  predictedFiles: Array<{ file: string; frequency: number; sessionCount: number }>
  scopeRisks: ScopeRiskSignal[]
  sessionCount: number
}

// ── Cost helper ───────────────────────────────────────────────────────────────

function sessionCost(s: SessionSummaryCard): number {
  return calcTokenCostUsd(
    s.inputTokens - s.cacheReadTokens - (s.cacheCreateTokens ?? 0),
    s.cacheReadTokens,
    s.cacheCreateTokens ?? 0,
    s.outputTokens,
    s.model,
  )
}

// ── Tokenization ──────────────────────────────────────────────────────────────

/** Extract meaningful tokens from a prompt string for similarity matching. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s/.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t))
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any',
  'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get',
  'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old',
  'see', 'two', 'who', 'did', 'let', 'put', 'say', 'she', 'too',
  'use', 'with', 'this', 'that', 'from', 'have', 'been', 'will',
  'your', 'they', 'what', 'when', 'make', 'like', 'into', 'time',
  'then', 'than', 'some', 'just', 'also', 'need', 'want', 'add',
  'file', 'code', 'work', 'would', 'could', 'should', 'there',
])

/** Jaccard similarity between two token sets. */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const t of setA) { if (setB.has(t)) intersection++ }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

// ── Scope risk patterns ───────────────────────────────────────────────────────

const SCOPE_RISK_PATTERNS: Array<{
  re: RegExp
  label: string
  pattern: string
  suggestion: string
}> = [
  {
    re: /\brefactor\b|\bclean[- ]up\b|\bimprove\b|\boptimize\b/i,
    label: 'Open-ended refactor',
    pattern: '"refactor", "clean up", "improve" without scope',
    suggestion: 'Name the specific function and file: "refactor [function] in [file]" instead of "refactor the auth code".',
  },
  {
    re: /;\s*also\b|\band then\b|\bfinally\b|\bthen\s+also\b/i,
    label: 'Multi-part task',
    pattern: '"; also", "and then", "finally"',
    suggestion: 'Split this into separate sessions — multi-part prompts have significantly higher cost variance.',
  },
  {
    re: /\bfix the bug\b|\bmake it work\b|\bit'?s broken\b|\bsomething is wrong\b/i,
    label: 'Fix without specifics',
    pattern: '"fix the bug", "make it work" without naming the error',
    suggestion: 'Include the exact error message and the file/function where it occurs.',
  },
  {
    re: /\bfind all\b|\blook through\b|\bcheck everywhere\b|\bsearch (the|all|through)\b/i,
    label: 'Discovery task',
    pattern: '"find all", "look through", "check everywhere"',
    suggestion: 'Specify what you\'re looking for and where — discovery tasks have 3× average cost.',
  },
]

// ── Main analysis function ────────────────────────────────────────────────────

const TOP_N = 10     // number of similar sessions to use for predictions
const MIN_SIMILARITY = 0.1

export function analyzePrompt(
  prompt: string,
  sessions: SessionSummaryCard[],
): PromptAnalysisResult {
  if (sessions.length === 0) {
    return {
      similarSessions: [], costRangeLow: 0, costRangeHigh: 0,
      turnsRangeLow: 0, turnsRangeHigh: 0, highVariance: false,
      predictedFiles: [], scopeRisks: [], sessionCount: 0,
    }
  }

  const promptTokens = tokenize(prompt)

  // Score all sessions by similarity, weighted by recency
  const now = Date.now()
  const scored = sessions.map(s => {
    const sim = promptTokens.length > 0
      ? jaccard(promptTokens, tokenize(s.userRequest ?? ''))
      : 0
    const ageSec = Math.max(1, (now - Date.parse(s.startTime || '0')) / 1000)
    const recencyBoost = 1 / Math.log10(ageSec + 10)  // decays slowly
    return { s, score: sim * (1 + recencyBoost * 0.2) }
  })

  const similar = scored
    .filter(x => x.score >= MIN_SIMILARITY)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map(x => x.s)

  // Cost and turn distribution from similar sessions
  const costs  = similar.map(sessionCost).filter(c => c > 0)
  const turns  = similar.map(s => s.totalLlmCalls).filter(t => t > 0)

  const costLow  = costs.length > 0 ? Math.min(...costs) : 0
  const costHigh = costs.length > 0 ? Math.max(...costs) : 0
  const turnsLow  = turns.length > 0 ? Math.min(...turns) : 0
  const turnsHigh = turns.length > 0 ? Math.max(...turns) : 0

  // High variance = range exceeds 2× the low value
  const highVariance = costHigh > 0 && costHigh > costLow * 2

  // Predicted files — files from similar sessions, ranked by frequency
  const fileCount = new Map<string, number>()
  for (const s of similar) {
    const seen = new Set<string>()
    for (const f of [...(s.filesChanged ?? []), ...(s.filesRead ?? [])]) {
      if (!seen.has(f)) { seen.add(f); fileCount.set(f, (fileCount.get(f) ?? 0) + 1) }
    }
  }
  const predictedFiles = [...fileCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([file, n]) => ({ file, frequency: n / Math.max(similar.length, 1), sessionCount: n }))

  // Scope risk signals — check prompt against patterns + compute cost uplift
  const avgWorkspaceCost = sessions.reduce((s, sess) => s + sessionCost(sess), 0) / sessions.length
  const scopeRisks: ScopeRiskSignal[] = []

  for (const pat of SCOPE_RISK_PATTERNS) {
    if (!pat.re.test(prompt)) continue
    // Compute actual cost uplift from workspace history
    const matchingSessions = sessions.filter(s => pat.re.test(s.userRequest ?? ''))
    const nonMatchingSessions = sessions.filter(s => !pat.re.test(s.userRequest ?? ''))
    const matchAvg = matchingSessions.length > 0
      ? matchingSessions.reduce((s, sess) => s + sessionCost(sess), 0) / matchingSessions.length
      : 0
    const baseAvg = nonMatchingSessions.length > 0
      ? nonMatchingSessions.reduce((s, sess) => s + sessionCost(sess), 0) / nonMatchingSessions.length
      : avgWorkspaceCost
    const uplift = baseAvg > 0 ? matchAvg / baseAvg : 0

    scopeRisks.push({
      label: pat.label,
      pattern: pat.pattern,
      upliftFactor: uplift,
      suggestion: pat.suggestion,
    })
  }

  return {
    similarSessions: similar,
    costRangeLow:  costLow,
    costRangeHigh: costHigh,
    turnsRangeLow:  turnsLow,
    turnsRangeHigh: turnsHigh,
    highVariance,
    predictedFiles,
    scopeRisks,
    sessionCount: sessions.length,
  }
}
