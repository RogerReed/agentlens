import { signal } from '@preact/signals'
import { useEffect, useRef, useState } from 'preact/hooks'
import {
  sessionSummary, toolCalls, dismissedSpanIds,
  swRetainedSessions, swLastSessionCount,
  selectedAgentFilter, initiatorFilter, dataSourceFilter, sessionLimit, activeTab,
  sessionTimelines, blobCache,
  dailyStats, lifetimeStats, burnRateData, searchResults, rangedSearchResults,
  focusedSessionId, timeRange, makeTimeRange, TIME_PRESETS, CHART_MAX,
  vscode, displaySessions, rangedSessions,
  sessionTextFilter, filteredSessions,
  sessionSortKey, sessionSortDir, type SortKey,
} from './state'
import type { TimelineEntry, AgentFilter, InitiatorFilter, DataSourceFilter, DailyStatRow, LifetimeStats, BurnRate, Projection, SessionSummaryCard } from './types'

// Tab components
import { Sessions } from './tabs/Sessions'
import { Analytics } from './tabs/Analytics'
import { Alerts, computeAlertCount, checkAlerts } from './tabs/Alerts'
import { Export } from './tabs/Export'
import { Help } from './tabs/Help'
import { Automation, checkAutomations } from './tabs/Automation'


const sidebarOpen = signal(true)

const TABS = [
  { id: 'sessions',   label: 'Sessions',   primary: true, title: 'Session list with expand-in-place detail — trace, files, cost, and flagged issues for each session.' },
  { id: 'analytics',  label: 'Analytics',  primary: true, title: 'Aggregate charts and metrics: token/cost trends, agent comparison, tool distribution, and active insights.' },
  { id: 'alerts',     label: 'Alerts',     primary: true, title: 'Configurable alerts for context window usage, error rates, session length, and other efficiency signals.' },
  { id: 'automation', label: 'Automation', primary: true, title: 'Real-time automations that prompt agents to compact context, break loops, and self-assess when configured thresholds are crossed.' },
  { id: 'export',     label: 'Export',     primary: true, title: 'Export raw or redacted OTEL span data as JSON files.' },
  { id: 'help',       label: 'Help',       primary: true, title: 'Overview of the plugin, descriptions of each view, and a glossary of terms used throughout the dashboard.' },
]



function ActivePanel() {
  const tab = normalizeTabId(activeTab.value)
  switch (tab) {
    case 'sessions':    return <Sessions />
    case 'analytics':   return <Analytics />
    case 'alerts':      return <Alerts />
    case 'automation':  return <Automation />
    case 'export':      return <Export />
    case 'help':        return <Help />
    default:            return null
  }
}

function normalizeTabId(tab: string): string {
  return tab
}

export function App() {
  // Global smart tooltip for [data-tip] elements
  useEffect(() => {
    let tipEl: HTMLDivElement | null = null
    function show(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('[data-tip]') as HTMLElement | null
      if (!target) return
      const text = target.getAttribute('data-tip')
      if (!text) return
      if (!tipEl) {
        tipEl = document.createElement('div')
        tipEl.className = 'metric-tooltip'
        document.body.appendChild(tipEl)
      }
      tipEl.textContent = text
      tipEl.style.display = 'block'
      const rect = target.getBoundingClientRect()
      const tipW = 220, tipH = tipEl.offsetHeight || 60
      let left = rect.left + rect.width / 2 - tipW / 2
      let top = rect.bottom + 6
      // Keep within viewport horizontally
      if (left < 4) left = 4
      if (left + tipW > window.innerWidth - 4) left = window.innerWidth - tipW - 4
      // If overflowing bottom, show above
      if (top + tipH > window.innerHeight - 4) top = rect.top - tipH - 6
      tipEl.style.left = left + 'px'
      tipEl.style.top = top + 'px'
    }
    function hide() { if (tipEl) tipEl.style.display = 'none' }
    document.addEventListener('mouseover', show)
    document.addEventListener('mouseout', hide)
    return () => {
      document.removeEventListener('mouseover', show)
      document.removeEventListener('mouseout', hide)
      if (tipEl) { tipEl.remove(); tipEl = null }
    }
  }, [])

  // Handle messages from the extension host
  useEffect(() => {
    let initialLoadDone = false
    const handler = (e: MessageEvent) => {
      const msg = e.data as {
        type: string
        summary?: { toolCalls?: Record<string, number> }
        sessionSummary?: typeof sessionSummary.value
        tab?: string
        agentFilter?: AgentFilter
        sessionLimit?: number
        sessionId?: string
        timeline?: TimelineEntry[]
        spanId?: string
        field?: string
        content?: string | null
        analyticsData?: { dailyStats: DailyStatRow[]; lifetimeStats: LifetimeStats }
        burnRate?: { sessionId: string; burnRate: BurnRate; projection: Projection | null } | null
        sessions?: SessionSummaryCard[]
        totalCount?: number
        offset?: number
      }
      if (msg.type === 'update') {
        if (msg.summary?.toolCalls) toolCalls.value = msg.summary.toolCalls
        sessionSummary.value = msg.sessionSummary ?? sessionSummary.value
        if (msg.analyticsData) {
          dailyStats.value = msg.analyticsData.dailyStats
          lifetimeStats.value = msg.analyticsData.lifetimeStats
        }
        if (msg.burnRate !== undefined) {
          burnRateData.value = msg.burnRate ?? null
        }
        if (!initialLoadDone) {
          initialLoadDone = true
          setTimeout(() => {
            checkAutomations(sessionSummary.value?.sessions ?? displaySessions.value)
            checkAlerts()
          }, 0)
        } else {
          setTimeout(() => {
            const triggers = checkAutomations(displaySessions.value)
            for (const t of triggers) {
              vscode?.postMessage({ type: 'automation', ...t })
            }
            const alertNotifications = checkAlerts()
            for (const a of alertNotifications) {
              vscode?.postMessage({ type: 'alert', label: a.label, detail: a.detail, severity: a.severity })
            }
          }, 0)
        }
      } else if (msg.type === 'sessionDetail' && msg.sessionId) {
        sessionTimelines.value = { ...sessionTimelines.value, [msg.sessionId]: msg.timeline ?? [] }
      } else if (msg.type === 'blobContent' && msg.spanId && msg.field) {
        const key = `${msg.spanId}:${msg.field}`
        if (msg.content != null) {
          blobCache.value = { ...blobCache.value, [key]: msg.content }
        }
      } else if (msg.type === 'switchTab' && msg.tab) {
        activeTab.value = normalizeTabId(msg.tab)
      } else if (msg.type === 'setFilter') {
        if (msg.agentFilter !== undefined) {
          selectedAgentFilter.value = msg.agentFilter
          const sel = document.getElementById('agent-filter') as HTMLSelectElement
          if (sel) sel.value = msg.agentFilter
        }
        if (msg.sessionLimit !== undefined) {
          const limit = Number(msg.sessionLimit)
          sessionLimit.value = limit
          const sel = document.getElementById('session-limit') as HTMLSelectElement
          if (sel) sel.value = String(limit)
        }
      } else if (msg.type === 'searchResults' && msg.sessions != null) {
        const data = {
          sessions: msg.sessions,
          totalCount: msg.totalCount ?? 0,
          offset: msg.offset ?? 0,
        }
        if ((msg as { context?: string }).context === 'timeRange') {
          rangedSearchResults.value = data
        } else {
          searchResults.value = data
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <>
      <div class="tabs">
        <button
          class="sidebar-toggle-btn"
          title={sidebarOpen.value ? 'Close AgentLens sidebar' : 'Open AgentLens sidebar'}
          onClick={() => {
            const opening = !sidebarOpen.value
            sidebarOpen.value = opening
            if (vscode) {
              vscode.postMessage({ type: opening ? 'openSidebar' : 'closeSidebar' })
            } else {
              window.dispatchEvent(new CustomEvent('agentlens:sidebar', { detail: { open: opening } }))
            }
          }}
        >
          {sidebarOpen.value ? '◄' : '►'}
        </button>
        {TABS.map(t => <Tab key={t.id} id={t.id} label={t.label} />)}
      </div>

      {!(['alerts', 'help', 'export', 'automation'] as string[]).includes(normalizeTabId(activeTab.value)) && (
        <TimeRangePicker />
      )}
      {!(['alerts', 'help', 'export', 'automation'] as string[]).includes(normalizeTabId(activeTab.value)) && (
        <SearchFilterBar />
      )}
      <div class="panel active">
        <ActivePanel />
      </div>

      <img id="mascot-img" src="" alt="AgentLens mascot" style="display:none" />
    </>
  )
}

const AGENT_FILTER_OPTIONS: Array<{ value: AgentFilter; label: string; color: string; activeColor?: string }> = [
  { value: 'all',        label: 'All',     color: 'var(--vscode-descriptionForeground,#888)', activeColor: '#ffffff' },
  { value: 'copilot',    label: 'Copilot', color: '#00EAFF' },
  { value: 'claude_code',label: 'Claude',  color: '#FFB085' },
  { value: 'codex',      label: 'Codex',   color: '#F0FF42' },
]

function TimeRangePicker({ hideAgentFilter = false }: { hideAgentFilter?: boolean }) {
  const range = timeRange.value
  const agent = selectedAgentFilter.value
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [loading, setLoading] = useState(false)
  const tab = normalizeTabId(activeTab.value)
  const showReset = tab === 'sessions' || tab === 'analytics'

  const isFiltered = sessionTextFilter.value !== '' ||
    selectedAgentFilter.value !== 'all' ||
    initiatorFilter.value !== 'all' ||
    dataSourceFilter.value !== 'all' ||
    sessionLimit.value !== 25 ||
    timeRange.value.preset !== 'all' ||
    sessionSortKey.value !== 'start_time' ||
    sessionSortDir.value !== 'desc'

  function resetFilters() {
    sessionTextFilter.value = ''
    selectedAgentFilter.value = 'all'
    initiatorFilter.value = 'all'
    dataSourceFilter.value = 'all'
    sessionLimit.value = 25
    timeRange.value = { preset: 'all' }
    sessionSortKey.value = 'start_time'
    sessionSortDir.value = 'desc'
  }

  function fireSearch(r: typeof timeRange.value) {
    if (r.preset === 'all') {
      rangedSearchResults.value = null
      setLoading(false)
      return
    }
    setLoading(true)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      vscode?.postMessage({
        type: 'searchSessions',
        query: { since: r.since, until: r.until, limit: CHART_MAX, orderBy: 'start_time', orderDir: 'DESC' },
        context: 'timeRange',
      })
    }, 120)
  }

  function selectPreset(id: typeof range.preset) {
    const r = makeTimeRange(id)
    timeRange.value = r
    fireSearch(r)
  }

  // Clear loading indicator when results arrive
  useEffect(() => {
    if (rangedSearchResults.value !== null) setLoading(false)
  }, [rangedSearchResults.value])

  const count = rangedSessions.value.length
  const total = rangedSearchResults.value?.totalCount
  const isActive = range.preset !== 'all'
  // For "All" time: use full unfiltered in-memory list (no limit, no agent filter)
  // so pills reflect every agent that has ever recorded a session in memory.
  // For bounded presets: use rangedSessions which merges DB history with in-memory.
  const baseSessions = isActive ? rangedSessions.value : (sessionSummary.value?.sessions ?? [])
  const presentSources = new Set(baseSessions.map(s => s.source))

  return (
    <div style="display:flex;align-items:center;gap:0;padding:0 8px 6px;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);flex-shrink:0">
      {/* Time presets */}
      <span style="font-size:10px;color:var(--muted);margin-right:6px;white-space:nowrap;text-transform:uppercase;letter-spacing:.3px">Time</span>
      <div style="display:flex;gap:1px">
        {TIME_PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => selectPreset(p.id)}
            style={[
              'padding:2px 7px;font-size:11px;cursor:pointer;border:none;border-radius:3px;transition:background 0.1s',
              range.preset === p.id
                ? 'background:var(--vscode-button-background);color:var(--vscode-button-foreground);font-weight:600'
                : 'background:transparent;color:var(--muted)',
            ].join(';')}
            title={p.ms ? `Last ${p.label}` : 'All recorded sessions'}
          >{p.label}</button>
        ))}
      </div>

      {/* Divider + Agent filter — hidden on tabs that don't need it */}
      {!hideAgentFilter && <>
        <span style="width:1px;height:14px;background:var(--border);margin:0 8px;flex-shrink:0" />
        <div style="display:flex;gap:4px;align-items:center">
          <span style="font-size:10px;color:var(--muted);margin-right:2px;white-space:nowrap;text-transform:uppercase;letter-spacing:.3px">Agent</span>
          {AGENT_FILTER_OPTIONS.filter(o => o.value === 'all' || presentSources.has(o.value)).map(o => {
            const active = agent === o.value
            const displayColor = (active && o.activeColor) ? o.activeColor : o.color
            return (
              <button
                key={o.value}
                onClick={() => { selectedAgentFilter.value = o.value }}
                style={[
                  'padding:2px 9px;font-size:11px;cursor:pointer;border-radius:10px;transition:all 0.1s;',
                  `border:1.5px solid ${displayColor};`,
                  active
                    ? `background:${displayColor}33;color:${displayColor};font-weight:600`
                    : 'background:transparent;color:var(--muted)',
                ].join('')}
              >{o.label}</button>
            )
          })}
        </div>
      </>}

      {/* Reset — shown after agent filter on sessions/analytics when any filter is active */}
      {showReset && isFiltered && (
        <>
          <span style="width:1px;height:14px;background:var(--border);margin:0 8px;flex-shrink:0" />
          <button
            onClick={resetFilters}
            style="padding:3px 12px;font-size:12px;border-radius:4px;cursor:pointer;white-space:nowrap;border:1px solid var(--vscode-panel-border);background:transparent;color:var(--muted)"
          >Reset</button>
        </>
      )}

      {/* Loading indicator */}
      {loading && <span style="margin-left:8px;font-size:10px;color:var(--muted);opacity:0.6">loading…</span>}

      {/* Refresh button for non-live ranges */}
      {isActive && !loading && (
        <button
          onClick={() => fireSearch(makeTimeRange(range.preset))}
          style="margin-left:6px;padding:2px 5px;font-size:11px;cursor:pointer;background:transparent;border:none;color:var(--muted);border-radius:3px"
          title="Refresh this time range"
        >↻</button>
      )}
    </div>
  )
}

const DATA_SOURCE_FILTER_OPTIONS: Array<{ value: DataSourceFilter; label: string; color: string; activeColor?: string }> = [
  { value: 'all',  label: 'All',  color: 'var(--vscode-descriptionForeground,#888)', activeColor: '#ffffff' },
  { value: 'otel', label: 'OTEL', color: '#ffffff' },
  { value: 'log',  label: 'Log',  color: '#90a4ae' },
]

const INITIATOR_FILTER_OPTIONS: Array<{ value: InitiatorFilter; label: string; color: string; activeColor?: string }> = [
  { value: 'all',   label: 'All',   color: 'var(--vscode-descriptionForeground,#888)', activeColor: '#ffffff' },
  { value: 'user',  label: 'User',  color: '#4a90d9' },
  { value: 'agent', label: 'Agent', color: '#b0bec5' },
  { value: 'api',   label: 'API',   color: '#90a4ae' },
]

function FilterPills<T extends string>({ options, value, onChange }: {
  options: Array<{ value: T; label: string; color: string; activeColor?: string; title?: string }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style="display:flex;gap:3px">
      {options.map(o => {
        const active = value === o.value
        const displayColor = (active && o.activeColor) ? o.activeColor : o.color
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={[
              'padding:2px 7px;font-size:11px;cursor:pointer;border-radius:10px;transition:all 0.1s;',
              `border:1.5px solid ${displayColor};`,
              active
                ? `background:${displayColor}33;color:${displayColor};font-weight:600`
                : 'background:transparent;color:var(--muted)',
            ].join('')}
            title={o.title}
          >{o.label}</button>
        )
      })}
    </div>
  )
}

function SearchFilterBar() {
  const text = sessionTextFilter.value
  const iFilter = initiatorFilter.value
  const dsFilter = dataSourceFilter.value
  const tab = normalizeTabId(activeTab.value)
  const isSessionsTab = tab === 'sessions'
  const isAnalyticsTab = tab === 'analytics'

  return (
    <div style="display:flex;align-items:center;gap:5px;padding:4px 8px 6px;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);flex-shrink:0;flex-wrap:wrap">
      {isSessionsTab && (
        <input
          type="text"
          placeholder="Filter sessions…"
          value={text}
          onInput={e => { sessionTextFilter.value = (e.target as HTMLInputElement).value }}
          style="flex:1;min-width:100px;max-width:200px;padding:3px 7px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
        />
      )}
      {isSessionsTab && (
        <>
          <span style="font-size:10px;color:var(--muted);white-space:nowrap;text-transform:uppercase;letter-spacing:.3px">From</span>
          <FilterPills
            options={INITIATOR_FILTER_OPTIONS.map(o => ({ ...o, title: o.value === 'all' ? 'Show all sessions' : o.value === 'user' ? 'Human-typed prompts only' : o.value === 'agent' ? 'Agent-spawned sub-tasks only' : 'Non-interactive claude -p calls only' }))}
            value={iFilter}
            onChange={v => { initiatorFilter.value = v }}
          />
        </>
      )}
      {(isSessionsTab || isAnalyticsTab) && (
        <>
          <span style="font-size:10px;color:var(--muted);white-space:nowrap;text-transform:uppercase;letter-spacing:.3px">Source</span>
          <FilterPills
            options={DATA_SOURCE_FILTER_OPTIONS.map(o => ({ ...o, title: o.value === 'all' ? 'Show all data sources' : o.value === 'otel' ? 'OpenTelemetry sessions only' : 'Log-file sessions only' }))}
            value={dsFilter}
            onChange={v => { dataSourceFilter.value = v }}
          />
        </>
      )}
      <span style="margin-left:auto;font-size:10px;color:var(--muted);white-space:nowrap;padding-right:2px">{filteredSessions.value.length} sessions</span>
    </div>
  )
}

// Each Tab reads activeTab.value independently so the active class stays correct
// regardless of what caused (or didn't cause) the parent component to re-render.
function Tab({ id, label }: { id: string; label: string; title?: string }) {
  const isActive = normalizeTabId(activeTab.value) === id
  return (
    <button
      class={'tab' + (isActive ? ' active' : '')}
      data-tab={id}
      onClick={() => { activeTab.value = id }}
    >
      {label}
    </button>
  )
}


