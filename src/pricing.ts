// Pricing data for extension-host cost computation (cost_usd stored in sessions table).
// Rate table is kept in sync with media/src/pricing.ts — update both when rates change.
// PRICING_LAST_UPDATED: 2026-08-12

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
  // gpt-4.1: re-listed on the API pricing page as of 2026-08-07 at real rates (previously assumed delisted/$0 —
  // that turned out to be wrong or stale; correcting to the live page value).
  'gpt-4.1':            { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,   cacheWritePerMTok: 0, outputPerMTok: 8.00,  contextWindowTokens: 1_000_000 },
  // gpt-4.1-mini: added 2026-08-12 — confirmed on OpenAI's general API pricing page.
  'gpt-4.1-mini':       { inputPerMTok: 0.40,  cacheReadPerMTok: 0.10,   cacheWritePerMTok: 0, outputPerMTok: 1.60,  contextWindowTokens: 0 },
  // gpt-5-mini: no longer an included/$0 model as of the 2026-07-19 pricing page — now billed at standard rates.
  'gpt-5-mini':         { inputPerMTok: 0.25,  cacheReadPerMTok: 0.025,  cacheWritePerMTok: 0, outputPerMTok: 2.00,  contextWindowTokens: 200_000 },
  'gpt-5 mini':         { inputPerMTok: 0.25,  cacheReadPerMTok: 0.025,  cacheWritePerMTok: 0, outputPerMTok: 2.00,  contextWindowTokens: 200_000 },
  'gpt-4o':             { inputPerMTok: 2.50,  cacheReadPerMTok: 1.25,   cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 128_000 },
  'gpt-4o-mini':        { inputPerMTok: 0.15,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 0.60,  contextWindowTokens: 128_000 },
  // gpt-5.1: corrected 2026-08-07 — was $1.75/$14.00, live API pricing page now shows $1.25/$10.00 (older-gen
  // model repriced down below gpt-5.2). gpt-5.1-codex/-mini/-max not independently re-confirmed this round
  // (absent from the general pricing page); left unchanged — see PRICING_SOURCES.md Known gaps.
  'gpt-5.1':            { inputPerMTok: 1.25,  cacheReadPerMTok: 0.125,  cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 256_000 },
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
  // gpt-5.6 family: Luna (small/fast), Terra (mid), Sol (flagship). Corrected 2026-08-07 — Luna and Terra were
  // repriced down (Luna $1.00→$0.20 input, Terra $2.50→$2.00 input), and the whole family gained real cache-write
  // pricing (1.25x input, confirmed across the Copilot docs, OpenAI's pricing page, and the Codex credits page).
  // A "long context" surcharge tier also exists above an unconfirmed token threshold (~2x input/cache, ~1.5x
  // output per Copilot's docs) — not implemented; see PRICING_SOURCES.md Known gaps.
  'gpt-5.6-luna':       { inputPerMTok: 0.20,  cacheReadPerMTok: 0.02,   cacheWritePerMTok: 0.25, outputPerMTok: 1.20,  contextWindowTokens: 256_000 },
  'gpt-5.6-terra':      { inputPerMTok: 2.00,  cacheReadPerMTok: 0.20,   cacheWritePerMTok: 2.50, outputPerMTok: 12.00, contextWindowTokens: 256_000 },
  'gpt-5.6-sol':        { inputPerMTok: 5.00,  cacheReadPerMTok: 0.50,   cacheWritePerMTok: 6.25, outputPerMTok: 30.00, contextWindowTokens: 256_000 },
  // ── Copilot marketplace third-party models ──────────────────────────────────
  // These four were already present in media/src/pricing.ts (browser-side) but missing here — a real sync gap
  // that made cost_usd store as 0 (not ~$?) for any Copilot session using them, silently under-reporting rather
  // than flagging as unknown. Added 2026-08-12 to restore parity; rates confirmed against the Copilot pricing page.
  'grok-4.5':           { inputPerMTok: 2.00,  cacheReadPerMTok: 0.50,   cacheWritePerMTok: 0, outputPerMTok: 6.00,  contextWindowTokens: 0 },
  'kimi-k3':            { inputPerMTok: 3.00,  cacheReadPerMTok: 0.30,   cacheWritePerMTok: 0, outputPerMTok: 15.00, contextWindowTokens: 0 },
  'kimi-k2.7-code':     { inputPerMTok: 0.95,  cacheReadPerMTok: 0.19,   cacheWritePerMTok: 0, outputPerMTok: 4.00,  contextWindowTokens: 0 },
  'mai-code-1-flash':   { inputPerMTok: 0.75,  cacheReadPerMTok: 0.075,  cacheWritePerMTok: 0, outputPerMTok: 4.50,  contextWindowTokens: 0 },
  // mai-code-1.1-flash: added 2026-08-12 — new on the Copilot pricing page this refresh.
  'mai-code-1.1-flash': { inputPerMTok: 0.20,  cacheReadPerMTok: 0.02,   cacheWritePerMTok: 0, outputPerMTok: 1.20,  contextWindowTokens: 0 },
  // ── Codex-only ─────────────────────────────────────────────────────────────
  // codex-mini-latest: deprecated per OpenAI docs; kept for historical sessions.
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
  // claude-sonnet-5: launched at introductory pricing ($2/$0.20/$2.50/$10) with a scheduled increase to
  // $3/$0.30/$3.75/$15 on 2026-09-01 — confirmed 2026-08-12 that increase has been cancelled and this rate is
  // now the permanent standard price. No date-driven change needed.
  'claude-sonnet-5':    { inputPerMTok:  2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok:  2.50, outputPerMTok: 10.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-5':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-6':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-7':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-8':    { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  // claude-opus-5: added 2026-08-07, now GA per Anthropic's pricing page — same rate as Opus 4.8.
  'claude-opus-5':      { inputPerMTok:  5.00, cacheReadPerMTok: 0.50,  cacheWritePerMTok:  6.25, outputPerMTok: 25.00, contextWindowTokens: 1_000_000 },
  // fast mode for Opus 4.6 was removed 2026-06-29 — requests now run at standard speed/rates despite the -fast suffix.
  'claude-opus-4-6-fast':{ inputPerMTok:  5.00, cacheReadPerMTok: 0.50, cacheWritePerMTok:  6.25, outputPerMTok:  25.00, contextWindowTokens: 1_000_000 },
  // fast mode for Opus 4.7 is confirmed removed as of this refresh (2026-08-07) — Anthropic's docs now state
  // requests with speed:"fast" return an error. Entry frozen for historical sessions only.
  'claude-opus-4-7-fast':{ inputPerMTok: 30.00, cacheReadPerMTok: 3.00, cacheWritePerMTok: 37.50, outputPerMTok: 150.00, contextWindowTokens: 1_000_000 },
  'claude-opus-4-8-fast':{ inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, contextWindowTokens: 1_000_000 },
  // claude-opus-5-fast: added 2026-08-07 — Anthropic's fast-mode table lists Opus 5 and Opus 4.8 together at the same rate.
  'claude-opus-5-fast':  { inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, contextWindowTokens: 1_000_000 },
  'claude-fable-5':      { inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, contextWindowTokens: 1_000_000 },
  // claude-mythos-5: limited-availability preview (anthropic.com/glasswing), same rates as Fable 5.
  'claude-mythos-5':     { inputPerMTok: 10.00, cacheReadPerMTok: 1.00, cacheWritePerMTok: 12.50, outputPerMTok:  50.00, contextWindowTokens: 1_000_000 },
  // ── Google ─────────────────────────────────────────────────────────────────
  'gemini-2.5-pro':  { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 1_000_000 },
  'gemini-3-flash':  { inputPerMTok: 0.50, cacheReadPerMTok: 0.05,  cacheWritePerMTok: 0, outputPerMTok:  3.00, contextWindowTokens: 1_000_000 },
  'gemini-3-pro':    { inputPerMTok: 2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok: 0, outputPerMTok: 12.00, contextWindowTokens: 1_000_000 },
  'gemini-3.1-pro':  { inputPerMTok: 2.00, cacheReadPerMTok: 0.20,  cacheWritePerMTok: 0, outputPerMTok: 12.00, contextWindowTokens: 1_000_000 },
  'gemini-3.5-flash':{ inputPerMTok: 1.50, cacheReadPerMTok: 0.15,  cacheWritePerMTok: 0, outputPerMTok:  9.00, contextWindowTokens: 1_000_000 },
  // gemini-3.6-flash: added 2026-08-07, new on the Copilot pricing page.
  'gemini-3.6-flash':{ inputPerMTok: 1.50, cacheReadPerMTok: 0.15,  cacheWritePerMTok: 0, outputPerMTok:  7.50, contextWindowTokens: 1_000_000 },
  // ── Fine-tuned ─────────────────────────────────────────────────────────────
  // raptor-mini: no longer an included/$0 model as of the 2026-07-19 Copilot pricing page — now billed at standard rates.
  'raptor-mini': { inputPerMTok: 0.25, cacheReadPerMTok: 0.025, cacheWritePerMTok: 0, outputPerMTok:  2.00,  contextWindowTokens: 0 },
  'goldeneye':   { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10.00, contextWindowTokens: 0 },
  // ── OpenCode Zen  https://opencode.ai/docs/zen/ ────────────────────────────
  // big-pickle: OpenCode's stealth model, free during limited evaluation period.
  'big-pickle':  { inputPerMTok: 0,    cacheReadPerMTok: 0,     cacheWritePerMTok: 0, outputPerMTok:  0,     contextWindowTokens: 200_000 },
  // Free Zen-exclusive models, added 2026-08-12 — model ID slugs confirmed from the Zen docs (previously withheld
  // pending confirmation; see PRICING_SOURCES.md). All free during their "limited time" evaluation period, same
  // caveat as big-pickle.
  'deepseek-v4-flash-free':      { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  'mimo-v2.5-free':               { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  'hy3-free':                     { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  'laguna-s-2.1-free':            { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  'ling-3.0-tiny-free':           { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  'nemotron-3-ultra-free':        { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
  'nemotron-3.5-lightning-free':  { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, contextWindowTokens: 0 },
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
