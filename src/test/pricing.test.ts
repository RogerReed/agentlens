import * as assert from 'assert'
import { lookupRates, calcTokenCostUsd, stripDateSuffix } from '../pricing'

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

  test('lookupRates does not prefix-match an unknown newer model onto an older one', () => {
    // claude-opus-4-9 doesn't exist in RATES, but claude-opus-4 does (deprecated,
    // $15/$75). A substring-prefix fallback would previously match this incorrectly —
    // must fall through to null (shown as ~$? in the UI) instead of a wrong rate.
    const rates = lookupRates('claude-opus-4-9')
    assert.strictEqual(rates, null, 'Should not silently inherit claude-opus-4\'s rate')
  })

  test('lookupRates does not prefix-match a differently-suffixed known model', () => {
    // gpt-4.1 exists; gpt-4.1-turbo does not. Must not match gpt-4.1's rate.
    const rates = lookupRates('gpt-4.1-turbo')
    assert.strictEqual(rates, null)
  })

  test('stripDateSuffix removes a trailing YYYY-MM-DD date', () => {
    assert.strictEqual(stripDateSuffix('claude-opus-4-7-2026-03-15'), 'claude-opus-4-7')
  })

  test('stripDateSuffix removes a trailing YYYYMMDD date', () => {
    assert.strictEqual(stripDateSuffix('claude-opus-4-7-20260315'), 'claude-opus-4-7')
  })

  test('stripDateSuffix leaves an undated model ID unchanged', () => {
    assert.strictEqual(stripDateSuffix('claude-opus-4-7'), 'claude-opus-4-7')
  })

  test('lookupRates resolves a fast-mode model ID built from a date-stripped base (logReader.ts pattern)', () => {
    // Regression test for the fast-mode + date-suffix ordering bug: logReader.ts
    // builds the fast-mode model ID as `${stripDateSuffix(primaryBase)}-fast`, not
    // `${primaryBase}-fast`. Simulate that construction directly.
    const rawDatedModel = 'claude-opus-4-7-20260315'
    const effectiveModel = `${stripDateSuffix(rawDatedModel)}-fast`
    assert.strictEqual(effectiveModel, 'claude-opus-4-7-fast')
    const rates = lookupRates(effectiveModel)
    assert.ok(rates !== null, 'Should resolve to the fast-mode rate')
    assert.strictEqual(rates!.inputPerMTok, 30.00, 'Should be the fast-mode rate ($30), not the standard rate ($5)')
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
    // big-pickle is free during its OpenCode Zen evaluation period — all-zero rates
    const cost = calcTokenCostUsd(100_000, 0, 0, 10_000, 'big-pickle')
    assert.strictEqual(cost, 0)
  })

  test('calcTokenCostUsd uses flat rate for claude-sonnet-4 under threshold', () => {
    // 100K input + 50K output — all below 200K, so same as flat rate
    const cost = calcTokenCostUsd(100_000, 0, 0, 50_000, 'claude-sonnet-4')
    const expected = (100_000 / 1_000_000) * 3.00 + (50_000 / 1_000_000) * 15.00
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd applies tiered rate for claude-sonnet-4 above 200K input', () => {
    // 300K input, 0 output: first 200K at $3, next 100K at $6
    const cost = calcTokenCostUsd(300_000, 0, 0, 0, 'claude-sonnet-4')
    const expected = (200_000 / 1_000_000) * 3.00 + (100_000 / 1_000_000) * 6.00
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd tiered output for claude-sonnet-4', () => {
    // 0 input, 250K output: first 200K at $15, next 50K at $22.50
    const cost = calcTokenCostUsd(0, 0, 0, 250_000, 'claude-sonnet-4')
    const expected = (200_000 / 1_000_000) * 15.00 + (50_000 / 1_000_000) * 22.50
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd flat rate for claude-sonnet-4-5 (no tiered rates)', () => {
    // claude-sonnet-4-5 has no above-200K rates; 300K input uses flat $3/MTok
    const cost = calcTokenCostUsd(300_000, 0, 0, 0, 'claude-sonnet-4-5')
    const expected = (300_000 / 1_000_000) * 3.00
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd uses flat rate for gpt-5.4 under its 272K threshold', () => {
    const cost = calcTokenCostUsd(200_000, 0, 0, 100_000, 'gpt-5.4')
    const expected = (200_000 / 1_000_000) * 2.50 + (100_000 / 1_000_000) * 15.00
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd applies the surcharge for gpt-5.4 above its 272K threshold', () => {
    // 372K input: first 272K at $2.50, next 100K at $5.00 (2x)
    const cost = calcTokenCostUsd(372_000, 0, 0, 0, 'gpt-5.4')
    const expected = (272_000 / 1_000_000) * 2.50 + (100_000 / 1_000_000) * 5.00
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd uses flat rate for gpt-5.6-luna under its 200K threshold', () => {
    const cost = calcTokenCostUsd(150_000, 0, 0, 0, 'gpt-5.6-luna')
    const expected = (150_000 / 1_000_000) * 0.20
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd applies the surcharge for gpt-5.6-luna above its 200K threshold (lower than the rest of the 5.6 family)', () => {
    // 250K input: first 200K at $0.20, next 50K at $0.40 (2x)
    const cost = calcTokenCostUsd(250_000, 0, 0, 0, 'gpt-5.6-luna')
    const expected = (200_000 / 1_000_000) * 0.20 + (50_000 / 1_000_000) * 0.40
    assert.ok(Math.abs(cost - expected) < 0.0001, `Expected $${expected}, got $${cost}`)
  })

  test('calcTokenCostUsd applies the surcharge to cache-read tokens for grok-4.5', () => {
    // grok-4.5 has no cache-write pricing (0), so this also exercises the cacheWrite fallback path.
    // 300K cache-read: first 200K at $0.50, next 100K at $1.00 (2x)
    const cost = calcTokenCostUsd(0, 300_000, 50_000, 0, 'grok-4.5')
    const expectedCacheRead = (200_000 / 1_000_000) * 0.50 + (100_000 / 1_000_000) * 1.00
    assert.ok(Math.abs(cost - expectedCacheRead) < 0.0001, `Expected $${expectedCacheRead}, got $${cost}`)
  })
})
