import { signal, computed } from '@preact/signals'
import { calcSessionCost } from './sessionMetrics'
import type {
  FullSummary, SessionSummaryCard, TimelineEntry,
  AgentFilter, InitiatorFilter, DataSourceFilter, InsightFilter, VsCodeApi,
  DailyStatRow, LifetimeStats, BurnRate, Projection,
} from './types'

// Maximum sessions rendered in any single chart or table
export const CHART_MAX = 25

// ── Time range navigation ─────────────────────────────────────────────────────

export type TimePreset = '1h' | '6h' | '24h' | '7d' | '30d' | 'all'

export interface TimeRange {
  preset: TimePreset
  since?: number   // unix ms — undefined means no lower bound
  until?: number   // unix ms — undefined means now
}

export const TIME_PRESETS: Array<{ id: TimePreset; label: string; ms: number | null }> = [
  { id: '1h',   label: '1h',   ms: 60 * 60_000 },
  { id: '6h',   label: '6h',   ms: 6 * 60 * 60_000 },
  { id: '24h',  label: '24h',  ms: 24 * 60 * 60_000 },
  { id: '7d',   label: '7d',   ms: 7 * 86_400_000 },
  { id: '30d',  label: '30d',  ms: 30 * 86_400_000 },
  { id: 'all',  label: 'All',  ms: null },
]

export function makeTimeRange(preset: TimePreset): TimeRange {
  const p = TIME_PRESETS.find(t => t.id === preset)!
  if (p.ms === null) return { preset }
  return { preset, since: Date.now() - p.ms }
}

// Active time range — defaults to 'all' (no time bound, always live)
export const timeRange = signal<TimeRange>({ preset: 'all' })

// DB-queried sessions for the active time range (separate from the Search tab results)
export const rangedSearchResults = signal<SearchResultData | null>(null)

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

// ── Global session text filter + sort ─────────────────────────────────────────

export type SortKey = 'start_time' | 'total_tokens' | 'duration_ms' | 'errors' | 'prompt' | 'model' | 'source' | 'cost'
export const sessionTextFilter = signal('')
export const sessionSortKey = signal<SortKey>('start_time')
export const sessionSortDir = signal<'asc' | 'desc'>('desc')

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

// Focused session — set by clicking any session in any view.
// Traces and Flow auto-open to it; a context bar shows it across all tabs.
export const focusedSessionId = signal<string | null>(null)

export const sessionLimit = signal(25)
export const selectedAgentFilter = signal<AgentFilter>('all')
export const initiatorFilter = signal<InitiatorFilter>('all')
export const dataSourceFilter = signal<DataSourceFilter>('all')
export const insightFilter = signal<InsightFilter>('all')
export const activeTab = signal('sessions')

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
  let all = sessionSummary.value?.sessions ?? []
  const filter = selectedAgentFilter.value
  if (filter !== 'all') all = all.filter(s => s.source === filter)
  const dsFilter = dataSourceFilter.value
  if (dsFilter !== 'all') all = all.filter(s => (s.dataSource ?? 'otel') === dsFilter)
  return all
})

export const displaySessions = computed<SessionSummaryCard[]>(() => {
  const all = agentFilteredSessions.value
  const limit = sessionLimit.value
  if (limit >= all.length) return all
  return all.slice(0, limit)   // sessions are newest-first; take the first N (most recent)
})

// Sessions scoped to the active time range + agent filter.
// Live/All → in-memory displaySessions.
// Bounded preset → merge DB results with in-memory sessions that fall in the window
// so that sessions not yet persisted to the DB are never missed.
export const rangedSessions = computed<SessionSummaryCard[]>(() => {
  const range = timeRange.value
  const agent = selectedAgentFilter.value

  if (range.preset === 'all') {
    return agentFilteredSessions.value
  }

  const since = range.since ?? 0
  const until = range.until ?? Date.now()

  // Always include in-memory sessions that fall in the window (covers sessions not yet in DB)
  const allInMemory = agentFilteredSessions.value
  const inMemory = allInMemory.filter(s => {
    if (!s.startTime) return false
    const ms = new Date(s.startTime).getTime()
    return ms >= since && ms <= until
  })

  const dbResults = rangedSearchResults.value
  if (!dbResults) return inMemory  // still loading — show in-memory matches as fallback

  // Merge DB results (historical) with in-memory sessions, deduplicate by sessionId
  const dbIds = new Set(dbResults.sessions.map(s => s.sessionId))
  const merged = [
    ...dbResults.sessions,
    ...inMemory.filter(s => !dbIds.has(s.sessionId)),
  ]
  merged.sort((a, b) => Date.parse(b.startTime || '0') - Date.parse(a.startTime || '0'))

  if (agent === 'all') return merged
  return merged.filter(s => s.source === agent)
})

// Text-filtered + sorted view of rangedSessions — used by Efficiency, Cost, Traces, Search, Insights
export const filteredSessions = computed<SessionSummaryCard[]>(() => {
  let sessions = rangedSessions.value
  const text = sessionTextFilter.value.toLowerCase().trim()
  if (text) {
    sessions = sessions.filter(s => (s.userRequest ?? '').toLowerCase().includes(text))
  }
  const iFilter = initiatorFilter.value
  if (iFilter !== 'all') {
    sessions = sessions.filter(s => (s.initiator ?? 'user') === iFilter)
  }
  const key = sessionSortKey.value
  const dir = sessionSortDir.value
  if (key === 'start_time') return dir === 'asc' ? [...sessions].reverse() : sessions
  return [...sessions].sort((a, b) => {
    let cmp = 0
    switch (key) {
      case 'total_tokens': cmp = (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens); break
      case 'duration_ms':  cmp = b.durationMs - a.durationMs; break
      case 'errors':       cmp = b.errors - a.errors; break
      case 'prompt':       cmp = (a.userRequest ?? '').localeCompare(b.userRequest ?? ''); break
      case 'model':        cmp = (a.model ?? '').localeCompare(b.model ?? ''); break
      case 'source':       cmp = (a.source ?? '').localeCompare(b.source ?? ''); break
      case 'cost': {
        const modeA = (a.source === 'copilot') ? 'token' : 'token'
        const costA = calcSessionCost(a, modeA).totalUsd
        const costB = calcSessionCost(b, modeA).totalUsd
        cmp = costB - costA
        break
      }
    }
    return dir === 'asc' ? -cmp : cmp
  })
})

export const agentPresence = computed(() => {
  const sessions = rangedSessions.value
  return {
    claude:  sessions.some(s => s.source === 'claude_code'),
    copilot: sessions.some(s => s.source === 'copilot'),
    codex:   sessions.some(s => s.source === 'codex'),
  }
})
