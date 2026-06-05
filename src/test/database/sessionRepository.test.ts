import * as assert from 'assert'
import { mergeSessions } from '../../sessionRepository'
import type { SessionSummaryCard } from '../../summarizers/summarizerTypes'

function makeCard(id: string, startTime: string, overrides: Partial<SessionSummaryCard> = {}): SessionSummaryCard {
  return {
    sessionId: id, traceId: 'trace-' + id, source: 'copilot', dataSource: 'otel', workspace: 'ws',
    userRequest: 'test', model: 'gpt-4o', turns: 1,
    inputTokens: 100, outputTokens: 20, cacheReadTokens: 0, cacheCreateTokens: 0,
    cacheHitRate: 0, durationMs: 1000, startTime,
    filesRead: [], filesSearched: [], filesChanged: [],
    toolCounts: {}, totalToolCalls: 0, totalLlmCalls: 1, errors: 0,
    outcome: 'text_response', timeline: [], backgroundSpans: [], loopSignals: [],
    ...overrides,
  }
}

suite('mergeSessions', () => {
  test('live sessions win on conflict with the same sessionId', () => {
    const db = [makeCard('s1', '2024-01-01T00:00:00.000Z', { model: 'db-model' })]
    const live = [makeCard('s1', '2024-01-01T00:00:00.000Z', { model: 'live-model' })]
    const result = mergeSessions(db, live)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].model, 'live-model')
  })

  test('db-only sessions are preserved when no live conflict', () => {
    const db = [makeCard('db1', '2024-01-01T00:00:00.000Z')]
    const live = [makeCard('live1', '2024-02-01T00:00:00.000Z')]
    const result = mergeSessions(db, live)
    assert.strictEqual(result.length, 2)
    assert.ok(result.some(s => s.sessionId === 'db1'))
    assert.ok(result.some(s => s.sessionId === 'live1'))
  })

  test('result is sorted by startTime DESC', () => {
    const db = [
      makeCard('a', '2024-01-01T00:00:00.000Z'),
      makeCard('c', '2024-03-01T00:00:00.000Z'),
    ]
    const live = [makeCard('b', '2024-02-01T00:00:00.000Z')]
    const result = mergeSessions(db, live)
    assert.strictEqual(result[0].sessionId, 'c')
    assert.strictEqual(result[1].sessionId, 'b')
    assert.strictEqual(result[2].sessionId, 'a')
  })

  test('empty db and live both return empty array', () => {
    assert.deepStrictEqual(mergeSessions([], []), [])
  })

  test('empty live returns db sessions sorted', () => {
    const db = [
      makeCard('x', '2024-01-01T00:00:00.000Z'),
      makeCard('y', '2024-06-01T00:00:00.000Z'),
    ]
    const result = mergeSessions(db, [])
    assert.strictEqual(result[0].sessionId, 'y')
    assert.strictEqual(result[1].sessionId, 'x')
  })
})
