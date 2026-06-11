// Pricing data for Copilot cost estimation.
// Token rates (post Jun 1, 2026):        https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
// Request multipliers (pre Jun 1, 2026): https://docs.github.com/en/copilot/concepts/billing/copilot-requests
// Annual-plan multipliers (post Jun 1):  https://docs.github.com/en/copilot/reference/copilot-billing/model-multipliers-for-annual-plans
export const PRICING_LAST_UPDATED = '2026-06-10'

// Three billing modes:
//   'token'          — new token-based AI Credits billing, effective Jun 1, 2026
//   'request'        — request-based billing with multipliers, active before Jun 1, 2026
//   'request-annual' — request-based billing for annual plan holders staying on old billing after Jun 1
//                      (multipliers increase significantly on Jun 1 for this group)
export type PricingMode = 'token' | 'request' | 'request-annual'

export interface ModelRates {
  inputPerMTok: number              // USD per 1M input tokens (token mode)
  cacheReadPerMTok: number          // USD per 1M cache-read tokens (token mode, 0 if n/a)
  cacheWritePerMTok: number         // USD per 1M cache-write tokens (token mode, 0 if n/a)
  outputPerMTok: number             // USD per 1M output tokens (token mode)
  multiplier: number                // Pre-Jun 1 request multiplier × $0.04/prompt (0 = included/free)
  multiplierAnnualPostJun1: number  // Post-Jun 1 multiplier for annual plan holders staying on request billing
  // Optional tiered rates for >200K tokens-per-call surcharge. Not applied in session-level calcTokenCost
  // (which operates on session totals and can't reconstruct per-turn call sizes).
  inputAbove200kPerMTok?: number
  outputAbove200kPerMTok?: number
  cacheReadAbove200kPerMTok?: number
  cacheWriteAbove200kPerMTok?: number
}

// Keyed by normalized model ID (lowercase, no date suffix).
const RATES: Record<string, ModelRates> = {
  // ── OpenAI ─────────────────────────────────────────────────────────────────────────────────────
  //                                                                     token rates ──────────────────────────────────── │ pre-Jun1  │ annual post-Jun1
  // included models: 0× pre-Jun1 AND $0 in token mode (included in Copilot subscription per footnote 1)
  'gpt-4.1':             { inputPerMTok: 0,     cacheReadPerMTok: 0,      cacheWritePerMTok: 0, outputPerMTok: 0,     multiplier: 0,    multiplierAnnualPostJun1: 1 },
  'gpt-5-mini':          { inputPerMTok: 0,     cacheReadPerMTok: 0,      cacheWritePerMTok: 0, outputPerMTok: 0,     multiplier: 0,    multiplierAnnualPostJun1: 0.33 },
  'gpt-5 mini':          { inputPerMTok: 0,     cacheReadPerMTok: 0,      cacheWritePerMTok: 0, outputPerMTok: 0,     multiplier: 0,    multiplierAnnualPostJun1: 0.33 },
  // older included models kept for historical sessions
  'gpt-4o':              { inputPerMTok: 2.50,  cacheReadPerMTok: 1.25,   cacheWritePerMTok: 0, outputPerMTok: 10.00, multiplier: 0,    multiplierAnnualPostJun1: 0.33 },
  'gpt-4o-mini':         { inputPerMTok: 0.15,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 0.60,  multiplier: 0,    multiplierAnnualPostJun1: 0.33 },
  // GPT-5.1 family — in annual-plan table but not in new token pricing (request-only models)
  'gpt-5.1':             { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, multiplier: 1,    multiplierAnnualPostJun1: 3 },
  'gpt-5.1-codex':       { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, multiplier: 1,    multiplierAnnualPostJun1: 3 },
  'gpt-5.1-codex-mini':  { inputPerMTok: 0.75,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 4.50,  multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
  'gpt-5.1-codex-max':   { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, multiplier: 1,    multiplierAnnualPostJun1: 3 },
  // premium models
  'gpt-5.2':             { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, multiplier: 1,    multiplierAnnualPostJun1: 3 },
  'gpt-5.2-codex':       { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, multiplier: 1,    multiplierAnnualPostJun1: 3 },
  'gpt-5.3-codex':       { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, multiplier: 1,    multiplierAnnualPostJun1: 6 },
  'gpt-5.4':             { inputPerMTok: 2.50,  cacheReadPerMTok: 0.25,   cacheWritePerMTok: 0, outputPerMTok: 15.00, multiplier: 1,    multiplierAnnualPostJun1: 6 },  // long-context surcharge (>272K tokens) not implemented
  'gpt-5.4-mini':        { inputPerMTok: 0.75,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 4.50,  multiplier: 0.33, multiplierAnnualPostJun1: 6 },
  'gpt-5.4-nano':        { inputPerMTok: 0.20,  cacheReadPerMTok: 0.02,   cacheWritePerMTok: 0, outputPerMTok: 1.25,  multiplier: 0.25, multiplierAnnualPostJun1: 0.25 },
  'gpt-5.5':             { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,   cacheWritePerMTok: 0, outputPerMTok: 30.00, multiplier: 7.5,  multiplierAnnualPostJun1: 7.5 },  // TBD per docs; long-context surcharge (>unknown threshold) not implemented
  // ── Codex-only models ──────────────────────────────────────────────────────────────────────────
  // codex-mini-latest: fine-tuned o4-mini; 75% cache discount (not the usual 90%); deprecated
  'codex-mini-latest':   { inputPerMTok: 1.50,  cacheReadPerMTok: 0.375,  cacheWritePerMTok: 0, outputPerMTok: 6.00,  multiplier: 0,    multiplierAnnualPostJun1: 0 },
  // ── Anthropic ──────────────────────────────────────────────────────────────────────────────────
  // deprecated — for historical Claude Code sessions
  'claude-opus-4':         { inputPerMTok: 15.00, cacheReadPerMTok: 1.50, cacheWritePerMTok: 18.75, outputPerMTok: 75.00, multiplier: 0, multiplierAnnualPostJun1: 0 },
  'claude-opus-4-1':       { inputPerMTok: 15.00, cacheReadPerMTok: 1.50, cacheWritePerMTok: 18.75, outputPerMTok: 75.00, multiplier: 0, multiplierAnnualPostJun1: 0 },
  'claude-haiku-3-5':      { inputPerMTok:  0.80, cacheReadPerMTok: 0.08, cacheWritePerMTok:  1.00, outputPerMTok:  4.00, multiplier: 0, multiplierAnnualPostJun1: 0 },
  // current
  'claude-haiku-4-5':      { inputPerMTok:  1.00, cacheReadPerMTok: 0.10, cacheWritePerMTok:  1.25, outputPerMTok:  5.00, multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
  'claude-sonnet-4':       { inputPerMTok:  3.00, cacheReadPerMTok: 0.30, cacheWritePerMTok:  3.75, outputPerMTok: 15.00, multiplier: 1,    multiplierAnnualPostJun1: 1,
                             inputAbove200kPerMTok: 6.00, outputAbove200kPerMTok: 22.50, cacheReadAbove200kPerMTok: 0.60, cacheWriteAbove200kPerMTok: 7.50 },
  'claude-sonnet-4-5':     { inputPerMTok:  3.00, cacheReadPerMTok: 0.30, cacheWritePerMTok:  3.75, outputPerMTok: 15.00, multiplier: 1,    multiplierAnnualPostJun1: 6 },
  'claude-sonnet-4-6':     { inputPerMTok:  3.00, cacheReadPerMTok: 0.30, cacheWritePerMTok:  3.75, outputPerMTok: 15.00, multiplier: 1,    multiplierAnnualPostJun1: 9 },
  'claude-opus-4-5':       { inputPerMTok:  5.00, cacheReadPerMTok: 0.50, cacheWritePerMTok:  6.25, outputPerMTok: 25.00, multiplier: 3,    multiplierAnnualPostJun1: 15 },
  'claude-opus-4-6':       { inputPerMTok:  5.00, cacheReadPerMTok: 0.50, cacheWritePerMTok:  6.25, outputPerMTok: 25.00, multiplier: 3,    multiplierAnnualPostJun1: 27 },
  'claude-opus-4-7':       { inputPerMTok:  5.00, cacheReadPerMTok: 0.50, cacheWritePerMTok:  6.25, outputPerMTok: 25.00, multiplier: 15,   multiplierAnnualPostJun1: 27 },
  'claude-opus-4-8':       { inputPerMTok:  5.00, cacheReadPerMTok: 0.50, cacheWritePerMTok:  6.25, outputPerMTok: 25.00, multiplier: 15,   multiplierAnnualPostJun1: 27 },
  // fast mode (/fast toggle in Claude Code) — model ID appended with -fast by logReader when usage.speed === 'fast'
  'claude-opus-4-6-fast':  { inputPerMTok: 30.00, cacheReadPerMTok: 3.00, cacheWritePerMTok: 37.50, outputPerMTok: 150.00, multiplier: 30, multiplierAnnualPostJun1: 30 },
  'claude-opus-4-7-fast':  { inputPerMTok: 30.00, cacheReadPerMTok: 3.00, cacheWritePerMTok: 37.50, outputPerMTok: 150.00, multiplier: 30, multiplierAnnualPostJun1: 30 },
  'claude-opus-4-8-fast':  { inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, multiplier: 30, multiplierAnnualPostJun1: 30 },
  'claude-fable-5':        { inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, multiplier: 0,  multiplierAnnualPostJun1: 0 },  // not yet listed in Copilot billing docs
  // ── Google ─────────────────────────────────────────────────────────────────────────────────────
  'gemini-2.5-pro':   { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10.00, multiplier: 1,    multiplierAnnualPostJun1: 1 },  // long-context surcharge (>200K tokens) not implemented
  'gemini-3-flash':   { inputPerMTok: 0.50, cacheReadPerMTok: 0.05,  cacheWritePerMTok: 0, outputPerMTok: 3.00,  multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
  'gemini-3-pro':     { inputPerMTok: 2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok: 0, outputPerMTok: 12.00, multiplier: 1,    multiplierAnnualPostJun1: 6 },
  'gemini-3.1-pro':   { inputPerMTok: 2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok: 0, outputPerMTok: 12.00, multiplier: 1,    multiplierAnnualPostJun1: 6 },  // long-context surcharge (>200K tokens) not implemented
  'gemini-3.5-flash': { inputPerMTok: 1.50, cacheReadPerMTok: 0.15,  cacheWritePerMTok: 0, outputPerMTok: 9.00,  multiplier: 14,   multiplierAnnualPostJun1: 14 },
  // ── Fine-tuned ─────────────────────────────────────────────────────────────────────────────────
  // raptor-mini uses GPT-5 mini pricing per footnote 5 — included ($0) in token mode, same annual multiplier
  'raptor-mini': { inputPerMTok: 0,    cacheReadPerMTok: 0,     cacheWritePerMTok: 0, outputPerMTok: 0,     multiplier: 0, multiplierAnnualPostJun1: 0.33 },
  'goldeneye':   { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10.00, multiplier: 0, multiplierAnnualPostJun1: 0 },
  // ── OpenCode Zen  https://opencode.ai/docs/zen/ ────────────────────────────
  // big-pickle: OpenCode's stealth model, free during limited evaluation period.
  'big-pickle':  { inputPerMTok: 0,    cacheReadPerMTok: 0,     cacheWritePerMTok: 0, outputPerMTok: 0,     multiplier: 0, multiplierAnnualPostJun1: 0 },
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
