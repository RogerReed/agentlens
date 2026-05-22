import { signal, computed } from '@preact/signals'
import type {
  Span, FullSummary, SessionSummaryCard,
  AgentFilter, InsightFilter, VsCodeApi,
} from './types'
import { inferSpanSource } from './utils'

// ── Set signal helper ─────────────────────────────────────────────────────────

function makeSetSignal<T>() {
  const s = signal<ReadonlySet<T>>(new Set<T>())
  return {
    get value(): ReadonlySet<T> { return s.value },
    peek(): ReadonlySet<T> { return s.peek() },
    has(item: T): boolean { return s.value.has(item) },
    add(item: T): void { const n = new Set(s.value); n.add(item); s.value = n },
    delete(item: T): void { const n = new Set(s.value); n.delete(item); s.value = n },
    toggle(item: T): void { const n = new Set(s.value); n.has(item) ? n.delete(item) : n.add(item); s.value = n },
    clear(): void { s.value = new Set<T>() },
    get size(): number { return s.value.size },
  }
}

// ── Core data signals ─────────────────────────────────────────────────────────

export const spans = signal<Span[]>(window.__INITIAL_SPANS__ ?? [])
export const sessionSummary = signal<FullSummary | null>(window.__INITIAL_SESSION_SUMMARY__ ?? null)
export const toolCalls = signal<Record<string, number>>(window.__INITIAL_TOOL_CALLS__ ?? {})

// ── UI control signals ────────────────────────────────────────────────────────

export const sessionLimit = signal(10)
export const selectedAgentFilter = signal<AgentFilter>('all')
export const insightFilter = signal<InsightFilter>('all')
export const activeTab = signal('efficiency')

// ── Waterfall / trace retention signals ──────────────────────────────────────

export const retainWaterfall = signal(true)
export const retainSummaryWaterfall = signal(true)
export const waterfallSpans = signal<Span[]>([])
export const swRetainedSessions = signal<SessionSummaryCard[]>([])
export const swLastSessionCount = signal(0)

// ── Set-based signals ─────────────────────────────────────────────────────────

export const expandedSpanIds = makeSetSignal<string>()
export const dismissedSpanIds = makeSetSignal<string>()
export const lastSeenTraceIds = makeSetSignal<string>()
export const ignoredInsightKeys = makeSetSignal<string>()

// ── VS Code API handle ────────────────────────────────────────────────────────

export let vscode: VsCodeApi | null = null
export function setVscode(api: VsCodeApi): void { vscode = api }

// ── Navigation helpers ────────────────────────────────────────────────────────

export function goToHelp(anchor: string): void {
  activeTab.value = 'help'
  // Wait for Preact to commit the Help panel, then scroll to anchor
  setTimeout(() => {
    const el = document.getElementById(anchor)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 80)
}

// ── Color palette ─────────────────────────────────────────────────────────────

export const COLORS = [
  '#4fc3f7', '#81c784', '#ffb74d', '#e57373', '#ba68c8', '#4dd0e1',
  '#fff176', '#a1887f', '#90a4ae', '#f06292', '#aed581', '#7986cb',
]

// ── Derived (computed) signals ─────────────────────────────────────────────────

export const agentFilteredSessions = computed<SessionSummaryCard[]>(() => {
  const all = sessionSummary.value?.sessions ?? []
  const filter = selectedAgentFilter.value
  if (filter === 'all') return all
  return all.filter(s => s.source === filter)
})

export const displaySessions = computed<SessionSummaryCard[]>(() => {
  const all = agentFilteredSessions.value
  const limit = sessionLimit.value
  if (limit >= all.length) return all
  return all.slice(all.length - limit)
})

export const displaySpans = computed<Span[]>(() => {
  const ds = displaySessions.value
  if (!ds.length) {
    const filter = selectedAgentFilter.value
    if (filter === 'all') return spans.value
    return spans.value.filter(s => inferSpanSource(s) === filter)
  }
  const traceIds = new Set(ds.map(s => s.traceId).filter(Boolean))
  if (traceIds.size === 0) {
    const filter = selectedAgentFilter.value
    if (filter === 'all') return spans.value
    return spans.value.filter(s => inferSpanSource(s) === filter)
  }
  return spans.value.filter(s => traceIds.has(s.traceId))
})

export const agentPresence = computed(() => {
  const sessions = displaySessions.value
  return {
    claude:  sessions.some(s => s.source === 'claude_code'),
    copilot: sessions.some(s => s.source === 'copilot'),
    codex:   sessions.some(s => s.source === 'codex'),
  }
})
