import * as assert from 'assert'
import { lookupRates, calcTokenCostUsd } from '../pricing'

suite('pricing', () => {
  test('lookupRates returns rates for known model', () => {
    const rates = lookupRates('claude-sonnet-4-6')
    assert.ok(rates !== null, 'Should find rates for claude-sonnet-4-6')
    assert.ok(rates!.inputPerMTok > 0)
    assert.ok(rates!.outputPerMTok > 0)
  })

  test('lookupRates returns null for unknown model', () => {
    const rates = lookupRates('totally-unknown-model-xyz')
    assert.strictEqual(rates, null)
  })

  test('lookupRates strips date suffix', () => {
    const rates = lookupRates('claude-sonnet-4-6-20260101')
    assert.ok(rates !== null, 'Should match after stripping date suffix')
  })

  test('calcTokenCostUsd returns 0 for unknown model', () => {
    const cost = calcTokenCostUsd(10000, 0, 0, 2000, 'nonexistent-model')
    assert.strictEqual(cost, 0)
  })

  test('calcTokenCostUsd computes correct value for claude-sonnet-4-6', () => {
    // inputPerMTok: 3.00, outputPerMTok: 15.00
    // 1M input = $3.00, 1M output = $15.00
    const cost = calcTokenCostUsd(1_000_000, 0, 0, 1_000_000, 'claude-sonnet-4-6')
    assert.ok(Math.abs(cost - 18.00) < 0.001, `Expected ~$18, got $${cost}`)
  })

  test('calcTokenCostUsd includes cache read tokens', () => {
    // cacheReadPerMTok: 0.30 for claude-sonnet-4-6
    const costNoCache = calcTokenCostUsd(1_000_000, 0, 0, 0, 'claude-sonnet-4-6')
    const costWithCache = calcTokenCostUsd(1_000_000, 1_000_000, 0, 0, 'claude-sonnet-4-6')
    assert.ok(costWithCache > costNoCache, 'Cache read tokens should add to cost')
    assert.ok(Math.abs(costWithCache - (3.00 + 0.30)) < 0.001)
  })

  test('calcTokenCostUsd returns 0 for included (free) model', () => {
    // gpt-4.1 has all-zero rates
    const cost = calcTokenCostUsd(100_000, 0, 0, 10_000, 'gpt-4.1')
    assert.strictEqual(cost, 0)
  })
})
