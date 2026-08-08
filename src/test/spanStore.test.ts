import * as assert from 'assert'
import { pruneSpans } from '../spanStore'
import type { Span } from '../types'

function makeSpans(n: number): Span[] {
  return Array.from({ length: n }, (_, i) => ({
    traceId: `trace-${i}`,
    spanId: `span-${i}`,
    name: 'test-span',
    startTime: String(i),
    endTime: String(i),
    attributes: [],
  }))
}

suite('spanStore', () => {
  test('pruneSpans does nothing when under the cap', () => {
    const spans = makeSpans(10)
    const dropped = pruneSpans(spans, 100)
    assert.strictEqual(dropped, 0)
    assert.strictEqual(spans.length, 10)
  })

  test('pruneSpans does nothing until the buffer past the cap is exceeded', () => {
    const spans = makeSpans(150)
    const dropped = pruneSpans(spans, 100) // 150 <= 100 + 1000 buffer
    assert.strictEqual(dropped, 0)
    assert.strictEqual(spans.length, 150)
  })

  test('pruneSpans trims down to the cap once the buffer is exceeded', () => {
    const spans = makeSpans(1200)
    const dropped = pruneSpans(spans, 100) // 1200 > 100 + 1000 buffer
    assert.strictEqual(dropped, 1100)
    assert.strictEqual(spans.length, 100)
  })

  test('pruneSpans drops the oldest spans, keeping the most recent', () => {
    const spans = makeSpans(1200)
    pruneSpans(spans, 100)
    assert.strictEqual(spans[0].spanId, 'span-1100')
    assert.strictEqual(spans[spans.length - 1].spanId, 'span-1199')
  })
})
