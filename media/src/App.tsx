import { useEffect, useState } from 'preact/hooks'
import { signal } from '@preact/signals'
import { zipSync, strToU8 } from 'fflate'
import {
  spans, sessionSummary, toolCalls, dismissedSpanIds,
  swRetainedSessions, swLastSessionCount,
  selectedAgentFilter, sessionLimit, activeTab,
  vscode, displaySessions,
} from './state'
import { nanoToMs, sessionStartMs } from './utils'
import type { Span, SessionSummaryCard, FullSummary, AgentFilter } from './types'

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

// Build minimal SessionSummaryCard objects for Claude traces that have llm_request/tool
// spans but no root claude_code.interaction span (in-progress or late-arriving sessions).
function fillMissingClaudeSessions(summary: FullSummary | null, allSpans: Span[]): FullSummary | null {
  if (!summary) return null

  const sessionTraceIds = new Set(summary.sessions.map(s => s.traceId).filter(Boolean))
  const claudeTraceMap: Record<string, Span[]> = {}
  for (const span of allSpans) {
    if (!span.traceId || sessionTraceIds.has(span.traceId)) continue
    if (span.name !== 'claude_code.llm_request' && span.name !== 'claude_code.tool') continue
    if (!claudeTraceMap[span.traceId]) claudeTraceMap[span.traceId] = []
    claudeTraceMap[span.traceId].push(span)
  }

  const traceIds = Object.keys(claudeTraceMap)
  if (traceIds.length === 0) return summary

  const attrStr = (span: Span, key: string): string => {
    const a = (span.attributes ?? []).find(x => x.key === key)
    return String(a?.value?.stringValue ?? a?.value?.intValue ?? a?.value?.doubleValue ?? '')
  }
  const attrInt = (span: Span, key: string): number => {
    const a = (span.attributes ?? []).find(x => x.key === key)
    return parseInt(String(a?.value?.intValue ?? a?.value?.stringValue ?? 0)) || 0
  }

  const newSessions: SessionSummaryCard[] = traceIds.map(traceId => {
    const traceSpans = claudeTraceMap[traceId]
    const llmSpans = traceSpans.filter(s => s.name === 'claude_code.llm_request')
    const toolSpans = traceSpans.filter(s => s.name === 'claude_code.tool')
    const allSorted = [...traceSpans].sort((a, b) => (a.startTime ?? '0') < (b.startTime ?? '0') ? -1 : 1)

    let inputTokens = 0, outputTokens = 0, cacheReadTokens = 0, cacheCreateTokens = 0
    let model = ''
    for (const s of llmSpans) {
      inputTokens += attrInt(s, 'input_tokens')
      outputTokens += attrInt(s, 'output_tokens')
      cacheReadTokens += attrInt(s, 'cache_read_tokens')
      cacheCreateTokens += attrInt(s, 'cache_creation_tokens')
      const m = attrStr(s, 'gen_ai.request.model') || attrStr(s, 'model')
      if (m) model = m
    }
    const totalInput = inputTokens + cacheReadTokens + cacheCreateTokens

    const timeline = [...llmSpans, ...toolSpans]
      .sort((a, b) => (a.startTime ?? '0') < (b.startTime ?? '0') ? -1 : 1)
      .map(s => {
        const st = nanoToMs(s.startTime), en = nanoToMs(s.endTime)
        const dur = Math.max(en - st, 0)
        if (s.name === 'claude_code.llm_request') {
          const inTok = attrInt(s, 'input_tokens') + attrInt(s, 'cache_read_tokens') + attrInt(s, 'cache_creation_tokens')
          const llmModel = attrStr(s, 'gen_ai.request.model') || attrStr(s, 'model')
          const stopReason = attrStr(s, 'stop_reason')
          return {
            type: 'llm' as const,
            spanId: s.spanId,
            label: llmModel || 'LLM',
            model: llmModel,
            inputTokens: inTok,
            outputTokens: attrInt(s, 'output_tokens'),
            ttft: attrInt(s, 'ttft_ms'),
            durationMs: dur,
            action: stopReason === 'tool_use' ? 'called tools' : stopReason === 'end_turn' ? 'text response' : stopReason || 'unknown',
            isError: s.status?.code === 2,
            errorMessage: s.status?.code === 2 ? (s.status?.message || undefined) : undefined,
            timestamp: st > 0 ? new Date(st).toISOString() : '',
          }
        } else {
          const toolName = attrStr(s, 'tool_name') || s.name
          return {
            type: 'tool' as const,
            spanId: s.spanId,
            label: toolName,
            durationMs: dur,
            toolInput: attrStr(s, 'tool_input') || attrStr(s, 'input') || undefined,
            isError: s.status?.code === 2,
            errorMessage: s.status?.code === 2 ? (s.status?.message || undefined) : undefined,
            timestamp: st > 0 ? new Date(st).toISOString() : '',
          }
        }
      })

    const toolCounts: Record<string, number> = {}
    for (const s of toolSpans) {
      const tn = attrStr(s, 'tool_name') || s.name
      toolCounts[tn] = (toolCounts[tn] || 0) + 1
    }

    const startMs = nanoToMs(allSorted[0]?.startTime)
    const endMs = nanoToMs(allSorted[allSorted.length - 1]?.endTime)

    return {
      sessionId: `synth-${traceId.slice(0, 12)}`,
      traceId,
      source: 'claude_code' as const,
      userRequest: '[session in progress]',
      model,
      turns: llmSpans.length,
      inputTokens: totalInput,
      outputTokens,
      cacheReadTokens,
      cacheCreateTokens,
      cacheHitRate: totalInput > 0 ? cacheReadTokens / totalInput : 0,
      durationMs: endMs - startMs,
      startTime: startMs > 0 ? new Date(startMs).toISOString() : '',
      filesRead: [],
      filesSearched: [],
      filesChanged: [],
      filesChangedNote: 'Session in progress — file changes will appear when the interaction completes.',
      toolCounts,
      totalToolCalls: toolSpans.length,
      totalLlmCalls: llmSpans.length,
      errors: traceSpans.filter(s => s.status?.code === 2).length,
      outcome: 'unknown' as const,
      timeline,
      backgroundSpans: [],
      loopSignals: [],
    }
  })

  const combined = [...summary.sessions, ...newSessions]
    .sort((a, b) => sessionStartMs(a) - sessionStartMs(b))
  return { ...summary, sessions: combined }
}



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
  // Listen for export requests (standalone only — plugin handles via dashboardPanel)
  useEffect(() => {
    const exportHandler = (e: MessageEvent) => {
      const type = e.data?.type
      if (type !== 'exportSessionData' && type !== 'exportSessionDataRedacted') return
      if (!(window as unknown as { __STANDALONE__?: boolean }).__STANDALONE__) return

      const redact = type === 'exportSessionDataRedacted'
      const allSpans = spans.value
      const sessions = displaySessions.value

      const _now = new Date()
      const _pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${_now.getFullYear()}${_pad(_now.getMonth()+1)}${_pad(_now.getDate())}_${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}`
      const prefix = redact ? 'export_redacted' : 'export'

      const REDACT_CONTENT = new Set(['gen_ai.prompt','gen_ai.completion','llm.prompts','llm.completions',
        'tool_input','tool_result','user_prompt','system_prompt','input','output'])
      const REDACT_PII = new Set(['user.id','user.name','user.email','user.username',
        'enduser.id','enduser.name','enduser.email','organization.id','organization.name',
        'github.copilot.user','github.user'])
      const shouldRedact = (key: string) =>
        REDACT_CONTENT.has(key) || REDACT_PII.has(key) || key.endsWith('.content') ||
        key.includes('prompt') || key.includes('tool_input') || key.includes('tool_result') ||
        key.startsWith('user.') || key.startsWith('enduser.') || key.startsWith('organization.')

      const traceAgent: Record<string, string> = {}
      for (const s of sessions) {
        const agent = s.source === 'claude_code' ? 'claude' : (s.source || 'unknown')
        if (s.traceId) traceAgent[s.traceId] = agent
      }

      const groups: Record<string, Span[]> = {}
      for (const span of allSpans) {
        const agent = traceAgent[span.traceId]
        if (!agent) continue
        const attrs = Array.isArray(span.attributes) ? span.attributes : []
        const rawPath = attrs.find(a => a.key === '_agentlens.collector_path')?.value?.stringValue || ''
        const endpoint = rawPath ? rawPath.replace(/^\//, '').replace(/\//g, '-') : 'main'
        const key = `${endpoint}__${agent}`
        if (!groups[key]) groups[key] = []
        const exportSpan = redact
          ? { ...span, attributes: attrs.map(a => shouldRedact(a.key) ? { key: a.key, value: { stringValue: '[redacted]' } } : a) }
          : span
        groups[key].push(exportSpan)
      }

      const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename
        document.body.appendChild(a); a.click()
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
      }

      const groupEntries = Object.entries(groups)
      if (groupEntries.length === 0) return
      const files: Record<string, Uint8Array> = {}
      for (const [key, groupSpans] of groupEntries) {
        const [endpoint, agent] = key.split('__')
        files[`${prefix}_${agent}_${endpoint}_${timestamp}.json`] = strToU8(JSON.stringify(groupSpans, null, 2))
      }
      const blob = new Blob([zipSync(files)], { type: 'application/zip' })
      triggerDownload(blob, `agentlens_${prefix}_${timestamp}.zip`)
    }
    window.addEventListener('message', exportHandler)
    return () => window.removeEventListener('message', exportHandler)
  }, [])

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

  // Supplement session summary from initial data
  useEffect(() => {
    if (spans.value.length > 0) {
      const supplemented = fillMissingClaudeSessions(sessionSummary.value, spans.value)
      if (supplemented) sessionSummary.value = supplemented
    }
  }, [])

  // Handle messages from extension host
  useEffect(() => {
    // Skip alerts/automations on first update (historical data load)
    let initialLoadDone = false
    const handler = (e: MessageEvent) => {
      const msg = e.data as { type: string; spans?: Span[]; summary?: { toolCalls?: Record<string, number> }; sessionSummary?: typeof sessionSummary.value; tab?: string; agentFilter?: AgentFilter; sessionLimit?: number }
      if (msg.type === 'update') {
        spans.value = msg.spans ?? []
        if (msg.summary?.toolCalls) toolCalls.value = msg.summary.toolCalls
        const incomingSummary = msg.sessionSummary ?? sessionSummary.value
        const supplemented = fillMissingClaudeSessions(incomingSummary, spans.value)
        if (supplemented) sessionSummary.value = supplemented
        // Only fire alerts/automations for real-time updates, not initial historical load
        if (!initialLoadDone) {
          initialLoadDone = true
          // Seed firedSet with ALL sessions (not just the displayed slice) so that
          // expanding the filter later doesn't cause out-of-view sessions to re-fire.
          setTimeout(() => {
            checkAutomations(sessionSummary.value?.sessions ?? displaySessions.value)
            checkAlerts()
          }, 0)
        } else {
          // Run automations and alerts after signals settle
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
        spans.value = []
        toolCalls.value = {}
        sessionSummary.value = null
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
