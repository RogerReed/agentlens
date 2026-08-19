import * as assert from 'assert'
import { tokenAverages } from '../sidebarPanel'
import { SessionSummaryCard } from '../summarizers/summarizerTypes'

function makeSession(overrides: Partial<SessionSummaryCard> = {}): SessionSummaryCard {
  return {
    sessionId: 'sess-1',
    traceId: 'trace-1',
    source: 'claude_code',
    dataSource: 'otel',
    workspace: '',
    userRequest: 'fix the bug',
    model: 'claude-3-5-sonnet',
    turns: 3,
    inputTokens: 5000,
    outputTokens: 800,
    cacheReadTokens: 0,
    cacheCreateTokens: 0,
    cacheHitRate: 0,
    durationMs: 12000,
    startTime: new Date().toISOString(),
    filesRead: [],
    filesSearched: [],
    filesChanged: [],
    filesWritten: [],
    toolCounts: {},
    totalToolCalls: 5,
    totalLlmCalls: 3,
    errors: 0,
    outcome: 'unknown',
    timeline: [],
    backgroundSpans: [],
    loopSignals: [],
    ...overrides,
  }
}

suite('sidebarPanel', () => {
  suite('tokenAverages', () => {
    test('returns 1 for both averages when there are no sessions', () => {
      assert.deepStrictEqual(tokenAverages([]), { avgInputTokens: 1, avgOutputTokens: 1 })
    })

    test('averages across all sessions when there are 5 or fewer', () => {
      const sessions = [
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 2000, outputTokens: 200 }),
      ]
      assert.deepStrictEqual(tokenAverages(sessions), { avgInputTokens: 1500, avgOutputTokens: 150 })
    })

    test('ignores sessions past the most recent 5, so one old outlier session cannot skew the average forever', () => {
      // Sessions are assumed most-recent-first (index 0 = latest), matching listSessions() ordering.
      const sessions = [
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        // Outside the 5-session window — a huge outlier here must not affect the average.
        makeSession({ inputTokens: 1_000_000, outputTokens: 100_000 }),
      ]
      assert.deepStrictEqual(tokenAverages(sessions), { avgInputTokens: 1000, avgOutputTokens: 100 })
    })

    test('a recent outlier still pulls the average, but only across the 5-session window', () => {
      const sessions = [
        makeSession({ inputTokens: 500_000, outputTokens: 50_000 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
        makeSession({ inputTokens: 1000, outputTokens: 100 }),
      ]
      assert.deepStrictEqual(tokenAverages(sessions), { avgInputTokens: 100_800, avgOutputTokens: 10_080 })
    })
  })
})
