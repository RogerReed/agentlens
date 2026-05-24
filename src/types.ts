export interface Span {
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  startTime: string
  endTime: string
  attributes: SpanAttribute[]
  status?: SpanStatus
  /** Wall-clock ms when this span was received by the collector. Always present on new spans. */
  receivedAt?: number
}

export interface SpanAttribute {
  key: string
  value: {
    stringValue?: string
    intValue?: number
    doubleValue?: number
    boolValue?: boolean
    arrayValue?: unknown
    kvlistValue?: unknown
  }
}

export interface SpanStatus {
  code: number
  message?: string
}

// ── Loop detection ──────────────────────────────────────────────────────────

export type LoopSignalType =
  | 'exact_tool_repeat'
  | 'edit_revert_cycle'
  | 'error_recurrence'
  | 'runaway_steps'
  | 'token_runaway'

export interface LoopSignal {
  type: LoopSignalType
  /** 'warning' = likely loop, 'critical' = strong evidence */
  severity: 'warning' | 'critical'
  /** Human-readable explanation of what was detected */
  evidence: string
  /** Count of the primary metric (repeats, steps, etc.) */
  count: number
  /** Up to 3 concrete examples (tool labels, file paths, error messages) */
  examples: string[]
  /** Named pattern from the agent failure-mode taxonomy */
  patternName: string
  /** Actionable recommendation for the user */
  action: string
}

export interface SessionSummary {
  totalSpans: number
  agentSessions: number
  toolCalls: Record<string, number>
  totalDurationMs: number
  tokensUsed: number
  filesChanged: string[]
  errors: number
  lastUpdated: Date
}
