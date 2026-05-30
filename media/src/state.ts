import { signal, computed } from '@preact/signals'
import type {
  FullSummary, SessionSummaryCard, TimelineEntry,
  AgentFilter, InsightFilter, VsCodeApi,
  DailyStatRow, LifetimeStats, BurnRate, Projection,
} from './types'

// ── Analytics signals ─────────────────────────────────────────────────────────

export const dailyStats = signal<DailyStatRow[]>([])
export const lifetimeStats = signal<LifetimeStats | null>(null)

export interface BurnRateData {
  sessionId: string
  burnRate: BurnRate
  projection: Projection | null
}
export const burnRateData = signal<BurnRateData | null>(null)

export interface SearchResultData {
  sessions: SessionSummaryCard[]
  totalCount: number
  offset: number
}
export const searchResults = signal<SearchResultData | null>(null)

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

export const sessionSummary = signal<FullSummary | null>(window.__INITIAL_SESSION_SUMMARY__ ?? null)
export const toolCalls = signal<Record<string, number>>(window.__INITIAL_TOOL_CALLS__ ?? {})

// ── Lazy timeline cache: sessionId → loaded timeline entries ──────────────────
// Populated by sessionDetail messages from the extension host.
// blobCache: `${spanId}:${field}` → content string

export const sessionTimelines = signal<Record<string, TimelineEntry[]>>({})
export const blobCache = signal<Record<string, string>>({})

// ── UI control signals ────────────────────────────────────────────────────────

export const sessionLimit = signal(10)
export const selectedAgentFilter = signal<AgentFilter>('all')
export const insightFilter = signal<InsightFilter>('all')
export const activeTab = signal('efficiency')

// ── Session retention signals ─────────────────────────────────────────────────

export const swRetainedSessions = signal<SessionSummaryCard[]>([])
export const swLastSessionCount = signal(0)

// ── Set-based signals ─────────────────────────────────────────────────────────

export const dismissedSpanIds = makeSetSignal<string>()
export const lastSeenTraceIds = makeSetSignal<string>()
export const ignoredInsightKeys = makeSetSignal<string>()

// ── VS Code API handle ────────────────────────────────────────────────────────

export let vscode: VsCodeApi | null = null
export function setVscode(api: VsCodeApi): void { vscode = api }

// ── Navigation helpers ────────────────────────────────────────────────────────

export function goToHelp(anchor: string): void {
  activeTab.value = 'help'
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

export const agentPresence = computed(() => {
  const sessions = displaySessions.value
  return {
    claude:  sessions.some(s => s.source === 'claude_code'),
    copilot: sessions.some(s => s.source === 'copilot'),
    codex:   sessions.some(s => s.source === 'codex'),
  }
})
