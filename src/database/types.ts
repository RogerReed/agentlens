import type { TimelineEntry } from '../summarizers/summarizerTypes'

/** Flat, SQLite-serialisable form of a session — no nested arrays. */
export interface SessionRow {
  sessionId: string
  traceId: string
  source: 'copilot' | 'claude_code' | 'codex'
  workspace: string
  projectPath?: string
  model: string
  startTime: number           // unix ms
  durationMs: number
  turns: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheCreateTokens: number
  cacheHitRate: number
  totalToolCalls: number
  totalLlmCalls: number
  errors: number
  outcome: string
  isSidechain: boolean
  speed?: 'standard' | 'fast'
  userRequest: string
  toolCounts: string          // JSON: Record<string, number>
  loopSignals: string         // JSON: LoopSignal[]
  filesRead: string           // JSON: string[]
  filesChanged: string        // JSON: string[]
  filesSearched: string       // JSON: string[]
  filesChangedNote?: string
}

/** SessionRow with timeline loaded — only materialised on demand. */
export interface SessionDetail extends SessionRow {
  timeline: TimelineEntry[]
}

/** Token burn rate for the currently active session. */
export interface BurnRate {
  tokensPerMinute: number
  costPerHour: number
}

/** Projected totals for the currently active session. */
export interface Projection {
  totalTokens: number
  totalCostUsd: number
  remainingMinutes: number
}
