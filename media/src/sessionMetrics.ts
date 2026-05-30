import type { SessionSummaryCard, TimelineEntry } from './types'
import { getAgentProfiles, resolveAgentProfile, type AgentThresholdProfiles } from './agentProfiles'
import { lookupRates, calcTokenCost, type PricingMode } from './pricing'

export function fmtUsd(usd: number): string {
  if (usd === 0) return '$0.00'
  if (usd < 0.001) return '<$0.001'
  if (usd < 1) return '$' + usd.toFixed(3)
  return '$' + usd.toFixed(2)
}

export function calcEntryCost(entry: TimelineEntry, sessionModel: string): number {
  const rates = lookupRates(entry.model || sessionModel)
  if (!rates) return 0
  return calcTokenCost(entry.inputTokens ?? 0, 0, 0, entry.outputTokens ?? 0, rates)
}

export type { PricingMode }

export interface SessionCost {
  totalUsd: number
  aiCredits: number     // totalUsd / 0.01 — Copilot's billing unit
  byTurn: number[]      // cumulative USD at each LLM timeline entry index
  modelUnknown: boolean
  pricingMode: PricingMode
}

export function calcSessionCost(session: SessionSummaryCard, mode: PricingMode): SessionCost {
  const modelId = session.model || ''
  const rates = lookupRates(modelId)
  const llmEntries = (session.timeline ?? []).filter(e => e.type === 'llm')

  if (mode === 'request' || mode === 'request-annual') {
    const mult = mode === 'request-annual'
      ? (rates?.multiplierAnnualPostJun1 ?? 0)
      : (rates?.multiplier ?? 0)
    if (!rates || mult === 0) {
      return { totalUsd: 0, aiCredits: 0, byTurn: llmEntries.map(() => 0), modelUnknown: !rates, pricingMode: mode }
    }
    // Only the user-initiated prompt counts as a premium request in agentic sessions;
    // autonomous tool calls and internal LLM calls within a session do not.
    // session.turns reflects user prompt count; fall back to 1 if unavailable.
    const promptCount = session.turns || 1
    const totalUsd = promptCount * mult * 0.04
    const perPrompt = totalUsd / promptCount
    let cum = 0
    // Spread cost evenly across LLM entries for the chart shape, but total is prompt-based.
    const byTurn = llmEntries.map(() => { cum = Math.min(cum + perPrompt, totalUsd); return cum })
    return { totalUsd, aiCredits: totalUsd / 0.01, byTurn, modelUnknown: false, pricingMode: mode }
  }

  // Token-based mode.
  // session.inputTokens includes cacheRead + cacheCreate for all agents, so subtract them back out.
  const rawInput = Math.max(0, session.inputTokens - session.cacheReadTokens - session.cacheCreateTokens)
  const totalUsd = rates
    ? calcTokenCost(rawInput, session.cacheReadTokens, session.cacheCreateTokens, session.outputTokens, rates)
    : 0

  // Per-turn cumulative cost using per-turn token counts (cache not broken out at turn level).
  let cum = 0
  const byTurn = llmEntries.map(entry => {
    const entryRates = lookupRates(entry.model || modelId) || rates
    if (!entryRates) return cum
    cum += calcTokenCost(entry.inputTokens ?? 0, 0, 0, entry.outputTokens ?? 0, entryRates)
    return cum
  })

  return { totalUsd, aiCredits: totalUsd / 0.01, byTurn, modelUnknown: !rates, pricingMode: mode }
}

export interface PeakContextUsage {
  peakTokens: number
  contextWindowTokens: number
  percent: number
}

export interface IdenticalToolRepeat {
  key: string
  tool: string
  count: number
  display: string
}

export interface ErrorHealth {
  errorCount: number
  measuredSteps: number
  maxConsecutive: number
  trailingConsecutive: number
  failureRate: number
  recentErrors: string[]
}

export function sessionDisplayName(session: SessionSummaryCard): string {
  const req = (session.userRequest ?? '').trim()
  if (!req || req === '[session in progress]') return '[session in progress]'
  return req.length > 70 ? req.slice(0, 70) + '...' : req
}

export function getPeakContextUsage(session: SessionSummaryCard, profiles: AgentThresholdProfiles = getAgentProfiles()): PeakContextUsage {
  const llmInputs = (session.timeline ?? [])
    .filter(e => e.type === 'llm')
    .map(e => e.inputTokens ?? 0)
    .filter(n => n > 0)
  const fallback = session.totalLlmCalls > 0 ? Math.round((session.inputTokens ?? 0) / session.totalLlmCalls) : 0
  const peakTokens = llmInputs.length > 0 ? Math.max(...llmInputs) : fallback
  const contextWindowTokens = resolveAgentProfile(session.source, profiles).contextWindowTokens
  return {
    peakTokens,
    contextWindowTokens,
    percent: contextWindowTokens > 0 ? peakTokens / contextWindowTokens * 100 : 0,
  }
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']'
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + stableJson(obj[k])).join(',') + '}'
  }
  return JSON.stringify(value)
}

function normalizeToolInput(input: string | undefined): string {
  const raw = (input ?? '').trim()
  if (!raw) return ''
  try {
    return stableJson(JSON.parse(raw))
  } catch {
    return raw.replace(/\s+/g, ' ')
  }
}

function toolName(entry: TimelineEntry): string {
  return (entry.label ?? '').trim().split(/\s+/)[0] || 'tool'
}

function changesFiles(entry: TimelineEntry): boolean {
  if ((entry.editDetails ?? []).length > 0) return true
  const label = (entry.label ?? '').toLowerCase()
  if (/(apply_patch|replace_string|create_file|edit_notebook|write_file|str_replace|multi_edit)/.test(label)) return true
  if (!/(exec|shell|bash|command)/.test(label)) return false
  const input = (entry.toolInput ?? '').toLowerCase()
  return /(apply_patch|sed\s+-i|perl\s+-i|>\s*[\w./~-]|>>\s*[\w./~-]|\btee\b|\btouch\b|\bmv\b|\bcp\b|\brm\b|\bmkdir\b)/.test(input)
}

export function getIdenticalToolRepeat(session: SessionSummaryCard): IdenticalToolRepeat | null {
  const counts = new Map<string, IdenticalToolRepeat & { fileChangeGeneration: number }>()
  let best: IdenticalToolRepeat | null = null
  let fileChangeGeneration = 0
  for (const entry of session.timeline ?? []) {
    if (entry.type === 'tool') {
      const tool = toolName(entry)
      const normalizedInput = normalizeToolInput(entry.toolInput)
      const key = tool + '\n' + (normalizedInput || (entry.label ?? '').trim())
      const current = counts.get(key)
      const count = current && current.fileChangeGeneration === fileChangeGeneration ? current.count + 1 : 1
      counts.set(key, {
        key,
        tool,
        count,
        display: normalizedInput ? tool + ' ' + normalizedInput.slice(0, 90) : (entry.label ?? tool),
        fileChangeGeneration,
      })
      if (count > 1 && (!best || count > best.count)) {
        best = { key, tool, count, display: normalizedInput ? tool + ' ' + normalizedInput.slice(0, 90) : (entry.label ?? tool) }
      }
    }
    if (changesFiles(entry)) {
      fileChangeGeneration++
    }
  }
  return best
}

export function getErrorHealth(session: SessionSummaryCard): ErrorHealth {
  const measured = (session.timeline ?? []).filter(e => e.type === 'llm' || e.type === 'tool')
  let maxConsecutive = 0
  let current = 0
  let errorCount = 0
  const recentErrors: string[] = []
  for (const entry of measured) {
    if (entry.isError) {
      errorCount++
      current++
      maxConsecutive = Math.max(maxConsecutive, current)
      const msg = entry.errorMessage || entry.label
      if (msg) recentErrors.push(msg.slice(0, 140))
    } else {
      current = 0
    }
  }
  const fallbackErrors = Math.max(errorCount, session.errors ?? 0)
  const measuredSteps = measured.length || ((session.totalLlmCalls ?? 0) + (session.totalToolCalls ?? 0))
  return {
    errorCount: fallbackErrors,
    measuredSteps,
    maxConsecutive,
    trailingConsecutive: current,
    failureRate: measuredSteps > 0 ? fallbackErrors / measuredSteps : 0,
    recentErrors: recentErrors.slice(-3),
  }
}

export function getActiveComputeMs(session: SessionSummaryCard): number {
  return (session.timeline ?? [])
    .filter(e => e.type === 'llm' || e.type === 'tool')
    .reduce((sum, entry) => sum + Math.max(entry.durationMs ?? 0, 0), 0)
}
