import { useEffect, useState } from 'preact/hooks'
import { signal } from '@preact/signals'
import {
  sessionSummary, toolCalls, dismissedSpanIds,
  swRetainedSessions, swLastSessionCount,
  selectedAgentFilter, sessionLimit, activeTab,
  sessionTimelines, blobCache,
  vscode, displaySessions,
} from './state'
import type { TimelineEntry, AgentFilter } from './types'

// Tab components
import { Efficiency } from './tabs/Efficiency'
import { Recommendations } from './tabs/Recommendations'
import { Alerts, computeAlertCount, checkAlerts } from './tabs/Alerts'
import { Tokens } from './tabs/Tokens'
import { Cost } from './tabs/Cost'
import { Latency } from './tabs/Latency'
import { Traces } from './tabs/Traces'
import { Files } from './tabs/Files'
import { Flow } from './tabs/Flow'
import { Agents } from './tabs/Agents'
import { Tools } from './tabs/Tools'
import { Errors } from './tabs/Errors'
import { Export } from './tabs/Export'
import { Help } from './tabs/Help'
import { Automation, checkAutomations } from './tabs/Automation'


const sidebarOpen = signal(true)

const TABS = [
  { id: 'efficiency',      label: 'Efficiency',      primary: true,  title: 'Per-session metrics and token usage breakdown.' },
  { id: 'cost',            label: 'Cost',            primary: true,  title: 'Estimated session cost based on token usage and Copilot AI Credits pricing. Supports both token-based (Jun 2026+) and legacy request-based billing.' },
  { id: 'traces',          label: 'Traces',          primary: true,  title: 'A human-readable timeline of each session — LLM calls with their decisions, tool calls with arguments, and token usage.' },
  { id: 'recommendations', label: 'Recommendations', primary: true,  title: 'Actionable insights and recommendations for improving prompt efficiency and reducing token waste.' },
  { id: 'agents',          label: 'Agents',          primary: false, title: 'Copilot, Claude, and Codex — session counts, token usage, tools, and latency broken down by agent source.' },
  { id: 'alerts',          label: 'Alerts',          primary: false, title: 'Configurable alerts for context window usage, error rates, session length, and other efficiency signals.' },
  { id: 'automation',      label: 'Automation',      primary: false, title: 'Real-time automations that prompt agents to compact context, break loops, and self-assess when configured thresholds are crossed.' },
  { id: 'errors',          label: 'Errors',          primary: false, title: 'All spans that completed with an error status. Click any item to expand its full details and attributes.' },
  { id: 'files',           label: 'Files',           primary: false, title: 'Files created or modified by the agent, organized by session with inline diffs.' },
  { id: 'flow',            label: 'Flow',            primary: false, title: 'LLM turns and tool calls visualized as a semantic graph — one node per turn, one per unique tool, edges weighted by call frequency.' },
  { id: 'latency',         label: 'Latency',         primary: false, title: 'Span durations as a color-coded grid, helping identify which operations are consistently slow.' },
  { id: 'tokens',          label: 'Tokens',          primary: false, title: 'Token consumption aggregated by span name and per session, sorted from highest to lowest.' },
  { id: 'tools',           label: 'Tools',           primary: false, title: 'Tool call distribution broken down by tool name, with token usage and performance stats per tool.' },
  { id: 'export',          label: 'Export',          primary: true,  title: 'Export raw or redacted OTEL span data as JSON files.' },
  { id: 'help',            label: 'Help',            primary: true,  title: 'Overview of the plugin, descriptions of each view, and a glossary of terms used throughout the dashboard.' },
]



function ActivePanel() {
  const tab = normalizeTabId(activeTab.value)
  switch (tab) {
    case 'efficiency':      return <Efficiency />
    case 'recommendations': return <Recommendations />
    case 'alerts':          return <Alerts />
    case 'tokens':          return <Tokens />
    case 'cost':            return <Cost />
    case 'latency':         return <Latency />
    case 'traces':          return <Traces />
    case 'files':           return <Files />
    case 'flow':            return <Flow />
    case 'agents':          return <Agents />
    case 'tools':           return <Tools />
    case 'errors':          return <Errors />
    case 'export':          return <Export />
    case 'automation':      return <Automation />
    case 'help':            return <Help />
    default:                return null
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
      }
      if (msg.type === 'update') {
        if (msg.summary?.toolCalls) toolCalls.value = msg.summary.toolCalls
        sessionSummary.value = msg.sessionSummary ?? sessionSummary.value
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
      } else if (msg.type === 'clearAll') {
        toolCalls.value = {}
        sessionSummary.value = null
        sessionTimelines.value = {}
        blobCache.value = {}
        swRetainedSessions.value = []
        swLastSessionCount.value = 0
        dismissedSpanIds.clear()
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
        {TABS.filter(t => t.primary).map(t =>
          <Tab key={t.id} id={t.id} label={t.label} />
        )}
        <MoreDropdown />
      </div>

      <div class="panel active">
        <ActivePanel />
      </div>

      <img id="mascot-img" src="" alt="AgentLens mascot" style="display:none" />
    </>
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

function MoreDropdown() {
  const [open, setOpen] = useState(false)
  const activeId = normalizeTabId(activeTab.value)
  const secondaryTabs = TABS.filter(t => !t.primary)
  const activeSecondary = secondaryTabs.find(t => t.id === activeId)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const closeOnEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('click', close)
    document.addEventListener('keydown', closeOnEsc)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', closeOnEsc)
    }
  }, [open])

  return (
    <div style="position:relative">
      <button
        class={'tab' + (activeSecondary ? ' active' : '')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
      >
        {activeSecondary ? activeSecondary.label : 'More'} ▾
      </button>
      {open && (
        <div
          role="listbox"
          style="position:absolute;top:100%;right:0;z-index:100;background:var(--bg);border:1px solid var(--border);border-radius:4px;min-width:160px;box-shadow:0 4px 12px rgba(0,0,0,0.2)"
          onClick={(e) => e.stopPropagation()}
        >
          {secondaryTabs.map(t => (
            <button
              key={t.id}
              class={'tab-dropdown-item' + (activeId === t.id ? ' active' : '')}
              role="option"
              aria-selected={activeId === t.id}
              onClick={() => { activeTab.value = t.id; setOpen(false) }}
            >
              {t.id === 'alerts' ? <AlertsBadge /> : t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
