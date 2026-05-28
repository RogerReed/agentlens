// Pricing data for cost estimation across Copilot, Claude Code, and Codex.
// Source: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
// and Anthropic/OpenAI direct API pricing pages.
export const PRICING_LAST_UPDATED = '2026-05-27'

export type PricingMode = 'token' | 'request'

export interface ModelRates {
  inputPerMTok: number       // USD per 1M input tokens
  cacheReadPerMTok: number   // USD per 1M cache-read tokens (0 if n/a)
  cacheWritePerMTok: number  // USD per 1M cache-write tokens (0 if n/a)
  outputPerMTok: number      // USD per 1M output tokens
  multiplier: number         // Legacy request-based multiplier (× $0.04/call)
}

// Keyed by normalized model ID (lowercase, no date suffix).
// Covers Copilot AI Credits rates and direct API rates for Claude/Codex.
const RATES: Record<string, ModelRates> = {
  // ── OpenAI ──────────────────────────────────────────────────────────────────
  'gpt-5-mini':        { inputPerMTok: 0.25,  cacheReadPerMTok: 0.025, cacheWritePerMTok: 0,    outputPerMTok: 2.00,  multiplier: 0 },
  'gpt-5 mini':        { inputPerMTok: 0.25,  cacheReadPerMTok: 0.025, cacheWritePerMTok: 0,    outputPerMTok: 2.00,  multiplier: 0 },
  'gpt-4o-mini':       { inputPerMTok: 0.15,  cacheReadPerMTok: 0.075, cacheWritePerMTok: 0,    outputPerMTok: 0.60,  multiplier: 0 },
  'gpt-4o':            { inputPerMTok: 2.50,  cacheReadPerMTok: 1.25,  cacheWritePerMTok: 0,    outputPerMTok: 10.00, multiplier: 0 },
  'gpt-4.1':           { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 8.00,  multiplier: 0 },
  'gpt-5.2':           { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 8.00,  multiplier: 1 },
  'gpt-5.2-codex':     { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 8.00,  multiplier: 1 },
  'gpt-5.3-codex':     { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 8.00,  multiplier: 1 },
  'gpt-5.4':           { inputPerMTok: 2.50,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 15.00, multiplier: 1 },
  'gpt-5.4-mini':      { inputPerMTok: 0.40,  cacheReadPerMTok: 0.10,  cacheWritePerMTok: 0,    outputPerMTok: 1.60,  multiplier: 0 },
  'gpt-5.4-nano':      { inputPerMTok: 0.10,  cacheReadPerMTok: 0.025, cacheWritePerMTok: 0,    outputPerMTok: 0.40,  multiplier: 0 },
  'gpt-5.5':           { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 30.00, multiplier: 7.5 },
  'raptor-mini':       { inputPerMTok: 0.25,  cacheReadPerMTok: 0.025, cacheWritePerMTok: 0,    outputPerMTok: 2.00,  multiplier: 0 },
  // ── Anthropic ───────────────────────────────────────────────────────────────
  'claude-haiku-4-5':          { inputPerMTok: 1.00,  cacheReadPerMTok: 0.10,  cacheWritePerMTok: 1.25, outputPerMTok: 5.00,  multiplier: 0.33 },
  'claude-sonnet-4':           { inputPerMTok: 3.00,  cacheReadPerMTok: 0.30,  cacheWritePerMTok: 3.75, outputPerMTok: 15.00, multiplier: 1 },
  'claude-sonnet-4-5':         { inputPerMTok: 3.00,  cacheReadPerMTok: 0.30,  cacheWritePerMTok: 3.75, outputPerMTok: 15.00, multiplier: 1 },
  'claude-sonnet-4-6':         { inputPerMTok: 3.00,  cacheReadPerMTok: 0.30,  cacheWritePerMTok: 3.75, outputPerMTok: 15.00, multiplier: 1 },
  'claude-opus-4-5':           { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 6.25, outputPerMTok: 25.00, multiplier: 3 },
  'claude-opus-4-6':           { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 6.25, outputPerMTok: 25.00, multiplier: 3 },
  'claude-opus-4-6-fast':      { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 6.25, outputPerMTok: 25.00, multiplier: 30 },
  'claude-opus-4-7':           { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 6.25, outputPerMTok: 25.00, multiplier: 15 },
  // ── Google ───────────────────────────────────────────────────────────────────
  'gemini-2.5-pro':    { inputPerMTok: 1.25,  cacheReadPerMTok: 0.31,  cacheWritePerMTok: 0,    outputPerMTok: 10.00, multiplier: 1 },
  'gemini-3-flash':    { inputPerMTok: 0.50,  cacheReadPerMTok: 0.125, cacheWritePerMTok: 0,    outputPerMTok: 3.00,  multiplier: 0.33 },
  'gemini-3.1-pro':    { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,  cacheWritePerMTok: 0,    outputPerMTok: 12.00, multiplier: 1 },
  'gemini-3.5-flash':  { inputPerMTok: 0.75,  cacheReadPerMTok: 0.188, cacheWritePerMTok: 0,    outputPerMTok: 3.75,  multiplier: 14 },
}

function normalizeModelId(modelId: string): string {
  return modelId
    .toLowerCase()
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')  // strip date suffix e.g. -2025-04-14
    .replace(/-\d{8}$/, '')               // strip YYYYMMDD suffix e.g. -20260501
    .trim()
}

export function lookupRates(modelId: string): ModelRates | null {
  if (!modelId) return null
  const normalized = normalizeModelId(modelId)
  if (RATES[normalized]) return RATES[normalized]
  // Prefix match for versioned or aliased model IDs
  for (const key of Object.keys(RATES)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) return RATES[key]
  }
  return null
}

// Token-based cost: the new Copilot AI Credits model (Jun 2026+).
// inputTokens here should be the raw (non-cached) input count.
export function calcTokenCost(
  inputTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
  outputTokens: number,
  rates: ModelRates,
): number {
  return (inputTokens      / 1_000_000) * rates.inputPerMTok
       + (cacheReadTokens  / 1_000_000) * rates.cacheReadPerMTok
       + (cacheWriteTokens / 1_000_000) * rates.cacheWritePerMTok
       + (outputTokens     / 1_000_000) * rates.outputPerMTok
}

// Request-based cost: legacy Copilot model (pre-Jun 2026).
// $0.04 per premium request × model multiplier.
export function calcRequestCost(llmCallCount: number, rates: ModelRates): number {
  return llmCallCount * rates.multiplier * 0.04
}
