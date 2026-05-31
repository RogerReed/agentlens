import { signal } from '@preact/signals'
import { useEffect, useRef, useState } from 'preact/hooks'
import {
  sessionSummary, toolCalls, dismissedSpanIds,
  swRetainedSessions, swLastSessionCount,
  selectedAgentFilter, sessionLimit, activeTab,
  sessionTimelines, blobCache,
  dailyStats, lifetimeStats, burnRateData, searchResults, rangedSearchResults,
  focusedSessionId, timeRange, makeTimeRange, TIME_PRESETS, CHART_MAX,
  vscode, displaySessions, rangedSessions,
  sessionTextFilter, sessionSortKey, type SortKey,
} from './state'
import type { TimelineEntry, AgentFilter, DailyStatRow, LifetimeStats, BurnRate, Projection, SessionSummaryCard } from './types'
import { getAgentColor, getAgentSourceLabel, getSessionGlobalNumber, formatMs } from './utils'
import { calcSessionCost, fmtUsd } from './sessionMetrics'

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
  return tab === 'dependencies' ? 'flow' : tab
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
      } else if (msg.type === 'clearAll') {
        toolCalls.value = {}
        sessionSummary.value = null
        sessionTimelines.value = {}
        blobCache.value = {}
        swRetainedSessions.value = []
        swLastSessionCount.value = 0
        dismissedSpanIds.clear()
        dailyStats.value = []
        lifetimeStats.value = null
        burnRateData.value = null
        searchResults.value = null
        focusedSessionId.value = null
        rangedSearchResults.value = null
        timeRange.value = { preset: 'all' }
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
      {!(['alerts', 'help', 'export', 'automation', 'analytics'] as string[]).includes(normalizeTabId(activeTab.value)) && (
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
          {AGENT_FILTER_OPTIONS.map(o => {
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

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'start_time',   label: 'Recent' },
  { key: 'total_tokens', label: 'Tokens' },
  { key: 'duration_ms',  label: 'Longest' },
]

function SearchFilterBar() {
  const text = sessionTextFilter.value
  const sort = sessionSortKey.value
  return (
    <div style="display:flex;align-items:center;gap:6px;padding:4px 8px 6px;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);flex-shrink:0;flex-wrap:wrap">
      <input
        type="text"
        placeholder="Filter sessions…"
        value={text}
        onInput={e => { sessionTextFilter.value = (e.target as HTMLInputElement).value }}
        style="flex:1;min-width:120px;max-width:240px;padding:3px 7px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
      />
      <div style="display:flex;gap:3px;align-items:center;flex-wrap:wrap">
        <span style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px">Sort</span>
        {SORT_OPTIONS.map(o => (
          <button
            key={o.key}
            class={'tab-mini' + (sort === o.key ? ' active' : '')}
            onClick={() => { sessionSortKey.value = o.key }}
          >{o.label}</button>
        ))}
      </div>
    </div>
  )
}

function FocusedSessionBar() {
  const id = focusedSessionId.value
  if (!id) return null
  const sessions = sessionSummary.value?.sessions ?? []
  const sess = sessions.find(s => s.sessionId === id)
  if (!sess) return null

  const num = getSessionGlobalNumber(sess)
  const color = getAgentColor(sess.source)
  const agent = getAgentSourceLabel(sess.source)
  const cost = calcSessionCost(sess, sess.source === 'copilot' ? 'token' : 'token')
  const snippet = sess.userRequest ? (sess.userRequest.length > 55 ? sess.userRequest.slice(0, 55) + '…' : sess.userRequest) : null
  const dateStr = sess.startTime ? new Date(sess.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''

  return (
    <div style="display:flex;align-items:center;gap:6px;padding:4px 12px;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);font-size:11px;flex-wrap:wrap;min-height:26px">
      <span style={`display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0`} />
      <span style="color:var(--muted);white-space:nowrap">{agent}</span>
      <span style="color:var(--muted);white-space:nowrap">{dateStr}</span>
      {snippet && <span style="color:var(--foreground);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title={sess.userRequest}>"{snippet}"</span>}
      <span style="display:flex;gap:4px;align-items:center;flex-shrink:0">
        {!cost.modelUnknown && cost.totalUsd > 0 && <span style="color:var(--vscode-charts-green,#81c784)">{fmtUsd(cost.totalUsd)}</span>}
        {sess.errors > 0 && <span style="color:var(--error)">{sess.errors} err</span>}
        <span style="color:var(--muted)">{formatMs(sess.durationMs)}</span>
      </span>
      <span style="display:flex;gap:4px;flex-shrink:0">
        <button class="tab-mini" onClick={() => { activeTab.value = 'sessions' }} title="View this session in Sessions">Sessions</button>
        <button class="tab-mini" onClick={() => { activeTab.value = 'analytics' }} title="View analytics">Analytics</button>
        <button style="padding:1px 6px;font-size:11px;cursor:pointer;background:transparent;border:1px solid var(--border);border-radius:3px;color:var(--muted);line-height:1.4" onClick={() => { focusedSessionId.value = null }} title="Deselect">×</button>
      </span>
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

function AlertsBadge() {
  const _s = displaySessions.value
  const count = computeAlertCount()
  return count > 0
    ? <span style="color:var(--error);font-weight:700">Alerts ⚠ {count}</span>
    : <>Alerts</>
}

