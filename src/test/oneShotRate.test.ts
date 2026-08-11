import * as assert from 'assert'
import { computeOneShotStats, oneShotRate, avgEditsPerFile, MIN_FILES_FOR_RATE } from '../oneShotRate'
import { SessionSummaryCard, TimelineEntry } from '../spanSummarizer'

// ── Factories (mirrors loopDetector.test.ts) ───────────────────────────────────

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

function makeEdit(filePath: string, oldString: string, newString: string): TimelineEntry {
  return {
    type: 'tool',
    spanId: 'span-' + Math.random().toString(36).slice(2, 8),
    label: 'edit_file',
    durationMs: 100,
    isError: false,
    timestamp: new Date().toISOString(),
    editDetails: [{ filePath, oldString, newString }],
  }
}

suite('oneShotRate', () => {
  suite('computeOneShotStats', () => {
    test('empty timeline yields all-zero stats', () => {
      const stats = computeOneShotStats(makeSession({ timeline: [] }))
      assert.deepStrictEqual(stats, { filesConsidered: 0, oneShotFiles: 0, retriedFiles: 0, totalEdits: 0 })
    })

    test('counts a file edited exactly once as one-shot', () => {
      const stats = computeOneShotStats(makeSession({
        timeline: [makeEdit('a.ts', 'old', 'new')],
      }))
      assert.strictEqual(stats.filesConsidered, 1)
      assert.strictEqual(stats.oneShotFiles, 1)
      assert.strictEqual(stats.retriedFiles, 0)
      assert.strictEqual(stats.totalEdits, 1)
    })

    test('counts a file edited multiple times as retried, not one-shot', () => {
      const stats = computeOneShotStats(makeSession({
        timeline: [
          makeEdit('a.ts', 'v1', 'v2'),
          makeEdit('a.ts', 'v2', 'v3'),
          makeEdit('a.ts', 'v3', 'v4'),
        ],
      }))
      assert.strictEqual(stats.filesConsidered, 1)
      assert.strictEqual(stats.oneShotFiles, 0)
      assert.strictEqual(stats.retriedFiles, 1)
      assert.strictEqual(stats.totalEdits, 3)
    })

    test('mixed session: some files one-shot, some retried', () => {
      const stats = computeOneShotStats(makeSession({
        timeline: [
          makeEdit('a.ts', 'x', 'y'),          // one-shot
          makeEdit('b.ts', '1', '2'),
          makeEdit('b.ts', '2', '3'),           // retried
          makeEdit('c.ts', 'foo', 'bar'),       // one-shot
        ],
      }))
      assert.strictEqual(stats.filesConsidered, 3)
      assert.strictEqual(stats.oneShotFiles, 2)
      assert.strictEqual(stats.retriedFiles, 1)
      assert.strictEqual(stats.totalEdits, 4)
    })

    test('ignores tool entries without editDetails', () => {
      const stats = computeOneShotStats(makeSession({
        timeline: [
          { type: 'tool', spanId: 's1', label: 'read_file', durationMs: 10, isError: false, timestamp: new Date().toISOString() },
          makeEdit('a.ts', 'x', 'y'),
        ],
      }))
      assert.strictEqual(stats.filesConsidered, 1)
    })
  })

  suite('oneShotRate', () => {
    test('returns null below the minimum file sample size', () => {
      assert.strictEqual(MIN_FILES_FOR_RATE, 2, 'sanity check the threshold this test assumes')
      assert.strictEqual(oneShotRate({ filesConsidered: 0, oneShotFiles: 0 }), null)
      assert.strictEqual(oneShotRate({ filesConsidered: 1, oneShotFiles: 1 }), null)
    })

    test('computes a rate once the minimum is met', () => {
      assert.strictEqual(oneShotRate({ filesConsidered: 4, oneShotFiles: 3 }), 0.75)
      assert.strictEqual(oneShotRate({ filesConsidered: 2, oneShotFiles: 0 }), 0)
      assert.strictEqual(oneShotRate({ filesConsidered: 2, oneShotFiles: 2 }), 1)
    })
  })

  suite('avgEditsPerFile', () => {
    test('returns null when no files were considered', () => {
      assert.strictEqual(avgEditsPerFile({ filesConsidered: 0, totalEdits: 0 }), null)
    })

    test('computes the average otherwise', () => {
      assert.strictEqual(avgEditsPerFile({ filesConsidered: 4, totalEdits: 6 }), 1.5)
    })
  })
})
