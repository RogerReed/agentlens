// Pricing data for extension-host cost computation (cost_usd stored in sessions table).
// Rate table is kept in sync with media/src/pricing.ts — update both when rates change.
// PRICING_LAST_UPDATED: 2026-06-10

export interface ModelRates {
  inputPerMTok: number
  cacheReadPerMTok: number
  cacheWritePerMTok: number
  outputPerMTok: number
  contextWindowTokens: number   // max context window for Projection estimates; 0 = unknown
  // Optional tiered rates for the >200K tokens-per-call surcharge. When absent, flat rates apply.
  inputAbove200kPerMTok?: number
  outputAbove200kPerMTok?: number
  cacheReadAbove200kPerMTok?: number
  cacheWriteAbove200kPerMTok?: number
}

const RATES: Record<string, ModelRates> = {
  // ── OpenAI ─────────────────────────────────────────────────────────────────
  'gpt-4.1':            { inputPerMTok: 0,     cacheReadPerMTok: 0,      cacheWritePerMTok: 0, outputPerMTok: 0,     contextWindowTokens: 1_000_000 },
  'gpt-5-mini':         { inputPerMTok: 0,     cacheReadPerMTok: 0,      cacheWritePerMTok: 0, outputPerMTok: 0,     contextWindowTokens: 200_000 },
  'gpt-5 mini':         { inputPerMTok: 0,     cacheReadPerMTok: 0,      cacheWritePerMTok: 0, outputPerMTok: 0,     contextWindowTokens: 200_000 },
  'gpt-4o':             { inputPerMTok: 2.50,  cacheReadPerMTok: 1.25,   cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 128_000 },
  'gpt-4o-mini':        { inputPerMTok: 0.15,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 0.60,  contextWindowTokens: 128_000 },
  'gpt-5.1':            { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, contextWindowTokens: 256_000 },
  'gpt-5.1-codex':      { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, contextWindowTokens: 256_000 },
  'gpt-5.1-codex-mini': { inputPerMTok: 0.75,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 4.50,  contextWindowTokens: 256_000 },
  'gpt-5.1-codex-max':  { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, contextWindowTokens: 256_000 },
  'gpt-5.2':            { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, contextWindowTokens: 256_000 },
  'gpt-5.2-codex':      { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, contextWindowTokens: 256_000 },
  'gpt-5.3-codex':      { inputPerMTok: 1.75,  cacheReadPerMTok: 0.175,  cacheWritePerMTok: 0, outputPerMTok: 14.00, contextWindowTokens: 256_000 },
  'gpt-5.4':            { inputPerMTok: 2.50,  cacheReadPerMTok: 0.25,   cacheWritePerMTok: 0, outputPerMTok: 15.00, contextWindowTokens: 272_000 },
  'gpt-5.4-mini':       { inputPerMTok: 0.75,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 4.50,  contextWindowTokens: 200_000 },
  'gpt-5.4-nano':       { inputPerMTok: 0.20,  cacheReadPerMTok: 0.02,   cacheWritePerMTok: 0, outputPerMTok: 1.25,  contextWindowTokens: 128_000 },
  'gpt-5.5':            { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,   cacheWritePerMTok: 0, outputPerMTok: 30.00, contextWindowTokens: 256_000 },
  // ── Codex-only ─────────────────────────────────────────────────────────────
  'codex-mini-latest':  { inputPerMTok: 1.50,  cacheReadPerMTok: 0.375,  cacheWritePerMTok: 0, outputPerMTok: 6.00,  contextWindowTokens: 200_000 },
  // ── Anthropic ──────────────────────────────────────────────────────────────
  'claude-opus-4':      { inputPerMTok: 15.00, cacheReadPerMTok: 1.50,  cacheWritePerMTok: 18.75, outputPerMTok: 75.00, contextWindowTokens: 200_000 },
  'claude-opus-4-1':    { inputPerMTok: 15.00, cacheReadPerMTok: 1.50,  cacheWritePerMTok: 18.75, outputPerMTok: 75.00, contextWindowTokens: 200_000 },
  'claude-haiku-3-5':   { inputPerMTok:  0.80, cacheReadPerMTok: 0.08,  cacheWritePerMTok:  1.00, outputPerMTok:  4.00, contextWindowTokens: 200_000 },
  'claude-haiku-4-5':   { inputPerMTok:  1.00, cacheReadPerMTok: 0.10,  cacheWritePerMTok:  1.25, outputPerMTok:  5.00, contextWindowTokens: 200_000 },
  'claude-sonnet-4':    { inputPerMTok:  3.00, cacheReadPerMTok: 0.30,  cacheWritePerMTok:  3.75, outputPerMTok: 15.00, contextWindowTokens: 1_000_000,
                          inputAbove200kPerMTok: 6.00, outputAbove200kPerMTok: 22.50, cacheReadAbove200kPerMTok: 0.60, cacheWriteAbove200kPerMTok: 7.50 },
  'claude-sonnet-4-5':  { inputPerMTok:  3.00, cacheReadPerMTok: 0.30,  cacheWritePerMTok:  3.75, outputPerMTok: 15.00, contextWindowTokens: 1_000_000 },
  'claude-sonnet-4-6':  { inputPerMTok:  3.00, cacheReadPerMTok: 0.30,  cacheWritePerMTok:  3.75, outputPerMTok: 15.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-5':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-6':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-7':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-8':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-6-fast':{ inputPerMTok: 30.00, cacheReadPerMTok: 3.00, cacheWritePerMTok: 37.50, outputPerMTok: 150.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-7-fast':{ inputPerMTok: 30.00, cacheReadPerMTok: 3.00, cacheWritePerMTok: 37.50, outputPerMTok: 150.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-8-fast':{ inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, contextWindowTokens: 1_000_000 },
  'claude-fable-5':      { inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, contextWindowTokens: 1_000_000 },
  // ── Google ─────────────────────────────────────────────────────────────────
  'gemini-2.5-pro':  { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 1_000_000 },
  'gemini-3-flash':  { inputPerMTok: 0.50, cacheReadPerMTok: 0.05,  cacheWritePerMTok: 0, outputPerMTok:  3.00, contextWindowTokens: 1_000_000 },
  'gemini-3-pro':    { inputPerMTok: 2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok: 0, outputPerMTok: 12.00, contextWindowTokens: 1_000_000 },
  'gemini-3.1-pro':  { inputPerMTok: 2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok: 0, outputPerMTok: 12.00, contextWindowTokens: 1_000_000 },
  'gemini-3.5-flash':{ inputPerMTok: 1.50, cacheReadPerMTok: 0.15,  cacheWritePerMTok: 0, outputPerMTok:  9.00, contextWindowTokens: 1_000_000 },
  // ── Fine-tuned ─────────────────────────────────────────────────────────────
  'raptor-mini': { inputPerMTok: 0,    cacheReadPerMTok: 0,     cacheWritePerMTok: 0, outputPerMTok:  0,     contextWindowTokens: 0 },
  'goldeneye':   { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 0 },
  // ── OpenCode Zen  https://opencode.ai/docs/zen/ ────────────────────────────
  // big-pickle: OpenCode's stealth model, free during limited evaluation period.
  'big-pickle':  { inputPerMTok: 0,    cacheReadPerMTok: 0,     cacheWritePerMTok: 0, outputPerMTok:  0,     contextWindowTokens: 200_000 },
}

function normalizeModelId(modelId: string): string {
  return modelId
    .toLowerCase()
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')
    .replace(/-\d{8}$/, '')
    .trim()
}

export function lookupRates(modelId: string): ModelRates | null {
  if (!modelId) return null
  const normalized = normalizeModelId(modelId)
  if (RATES[normalized]) return RATES[normalized]
  for (const key of Object.keys(RATES)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) return RATES[key]
  }
  return null
}

// Applies two-tier pricing: tokens up to the threshold at baseRate, remainder at aboveRate.
function tieredCost(tokens: number, baseRatePerMTok: number, aboveRatePerMTok: number): number {
  const THRESHOLD = 200_000
  if (tokens <= THRESHOLD) return (tokens / 1_000_000) * baseRatePerMTok
  return (THRESHOLD / 1_000_000) * baseRatePerMTok
       + ((tokens - THRESHOLD) / 1_000_000) * aboveRatePerMTok
}

export function calcTokenCostUsd(
  inputTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
  outputTokens: number,
  modelId: string,
): number {
  const rates = lookupRates(modelId)
  if (!rates) return 0
  if (rates.inputAbove200kPerMTok !== undefined) {
    return tieredCost(inputTokens,     rates.inputPerMTok,      rates.inputAbove200kPerMTok)
         + tieredCost(cacheReadTokens,  rates.cacheReadPerMTok,  rates.cacheReadAbove200kPerMTok!)
         + tieredCost(cacheWriteTokens, rates.cacheWritePerMTok, rates.cacheWriteAbove200kPerMTok!)
         + tieredCost(outputTokens,     rates.outputPerMTok,     rates.outputAbove200kPerMTok!)
  }
  return (inputTokens     / 1_000_000) * rates.inputPerMTok
       + (cacheReadTokens / 1_000_000) * rates.cacheReadPerMTok
       + (cacheWriteTokens/ 1_000_000) * rates.cacheWritePerMTok
       + (outputTokens    / 1_000_000) * rates.outputPerMTok
}
