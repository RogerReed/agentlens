import * as preact from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { sessionSummary, displaySessions, rangedSessions, agentFilteredSessions, filteredSessions, sessionTimelines, burnRateData, focusedSessionId, CHART_MAX, COLORS, vscode, goToHelp, timeRange } from '../state'
import {
  getSessionGlobalNumber,
  formatMs, formatCompact, getAgentColor, formatSessionTime, formatSessionTimeShort,
} from '../utils'
import type { SessionSummaryCard } from '../types'

type HeatReason = { text: string; linkPhrase?: string; helpId?: string }

export function TurnsLink() {
  return (
    <span
      onClick={() => goToHelp('gl-turn')}
      style="cursor:pointer;border-bottom:1px dotted currentColor"
      title="View 'Turn' definition in glossary"
    >Turns</span>
  )
}

// ── Context growth — each session is a line, x-axis = LLM turn number ─────────
// One line per session shows how input tokens accumulate turn by turn.
// Easier to compare growth profiles across sessions than a wall-clock view.

type GrowthSeries = {
  sessionId: string; label: string; color: string; focused: boolean
  points: Array<{ turn: number; tokens: number }>
}

// Shared drawing state for click-detection
interface GrowthState { series: GrowthSeries[]; xPos: (t: number) => number; yPos: (tok: number) => number; chartH: number; pad: { top: number; left: number } }
const growthStateRef: { current: GrowthState | null } = { current: null }

export function ContextGrowthChart({ sessions, timelines }: { sessions: SessionSummaryCard[]; timelines: Record<string, import('../types').TimelineEntry[]> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const focusedId = focusedSessionId.value

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const seriesData: GrowthSeries[] = []
    sessions.forEach(sess => {
      const llmEntries = (timelines[sess.sessionId] ?? sess.timeline ?? [])
        .filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0)
      if (llmEntries.length < 1) return
      seriesData.push({
        sessionId: sess.sessionId,
        label: formatSessionTimeShort(sess),
        color: getAgentColor(sess.source) || COLORS[seriesData.length % COLORS.length],
        focused: focusedId === sess.sessionId,
        points: llmEntries.map((e, i) => ({ turn: i + 1, tokens: e.inputTokens ?? 0 })),
      })
    })

    if (seriesData.length === 0) { canvas.style.display = 'none'; growthStateRef.current = null; return }
    canvas.style.display = 'block'

    const maxTurns = Math.max(...seriesData.map(s => s.points.length), 2)
    const allTokens = seriesData.flatMap(s => s.points.map(p => p.tokens))
    const rawMin = Math.min(...allTokens), rawMax = Math.max(...allTokens)
    const spread = rawMax - rawMin || rawMax * 0.1 || 1
    // Fit y-axis tightly to data — 10% padding on each side so lines spread out
    const yMin = Math.max(0, rawMin - spread * 0.1)
    const yMax = rawMax + spread * 0.1

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const w = rect.width, h = rect.height
    ctx.clearRect(0, 0, w, h)

    // Extra right padding for end-of-line labels
    const pad = { top: 8, right: 80, bottom: 22, left: 56 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom

    const xPos = (turn: number) => pad.left + ((turn - 1) / Math.max(maxTurns - 1, 1)) * chartW
    const yPos = (tok: number) => pad.top + chartH - ((tok - yMin) / (yMax - yMin)) * chartH

    // Save state for click detection
    growthStateRef.current = { series: seriesData, xPos, yPos, chartH, pad }

    const cs = getComputedStyle(document.body)
    const gridColor = cs.getPropertyValue('--vscode-panel-border').trim() || '#333'
    const textColor = cs.getPropertyValue('--vscode-descriptionForeground').trim() || '#888'
    const fontStr = '9px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')

    // Y gridlines + labels (fitted to data range)
    ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH * i / 4
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke()
    }
    ctx.fillStyle = textColor; ctx.font = fontStr; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    for (let i = 0; i <= 4; i++) {
      const val = yMax - (yMax - yMin) * i / 4
      if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + chartH * i / 4)
    }

    // X axis — turn number ticks
    const xStep = maxTurns <= 10 ? 1 : maxTurns <= 30 ? 5 : maxTurns <= 100 ? 10 : 20
    ctx.fillStyle = textColor; ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    for (let t = 1; t <= maxTurns; t += xStep) {
      const x = xPos(t)
      ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + chartH); ctx.stroke()
      ctx.fillText('T' + t, x, pad.top + chartH + 4)
    }
    if (maxTurns > 1 && (maxTurns - 1) % xStep !== 0) {
      ctx.fillText('T' + maxTurns, xPos(maxTurns), pad.top + chartH + 4)
    }

    // Draw series — unfocused first so focused renders on top
    const sorted = [...seriesData].sort((a, b) => (a.focused ? 1 : 0) - (b.focused ? 1 : 0))
    sorted.forEach(series => {
      const alpha = (focusedId && !series.focused) ? '30' : ''
      ctx.strokeStyle = series.color + alpha
      ctx.lineWidth = series.focused ? 2.5 : 1.5

      ctx.beginPath()
      series.points.forEach(({ turn, tokens }, j) => {
        const x = xPos(turn), y = yPos(tokens)
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Time label at the end of each line
      const last = series.points[series.points.length - 1]
      if (last) {
        const lx = xPos(last.turn) + 4, ly = yPos(last.tokens)
        ctx.fillStyle = series.color + (alpha || 'cc')
        ctx.font = '8px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillText(series.label, lx, ly)
      }
    })
  })

  function handleCanvasClick(e: MouseEvent) {
    const canvas = canvasRef.current; if (!canvas) return
    const state = growthStateRef.current; if (!state || !state.series.length) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    let bestDist = 20, bestId = ''
    state.series.forEach(s => {
      s.points.forEach(({ turn, tokens }) => {
        const dx = mx - state.xPos(turn), dy = my - state.yPos(tokens)
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < bestDist) { bestDist = dist; bestId = s.sessionId }
      })
    })
    if (bestId) focusedSessionId.value = focusedSessionId.peek() === bestId ? null : bestId
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        id="context-growth-chart"
        style="width:100%;height:200px;display:block;cursor:pointer"
        onClick={handleCanvasClick}
        title="Click a line to select that session"
      />
      <div style="text-align:center;font-size:9px;color:var(--muted);margin-top:2px">
        <TurnsLink />
      </div>
    </>
  )
}

const HELP_TOOLTIPS: Record<string, string> = {
  'help-tool-failures':        'Failures come from guessed file paths or unavailable commands. Provide exact paths and tell the agent which tools and runtimes are available.',
  'help-high-turns':           'Prompt describes the goal but not the location. Add explicit file paths, stopping conditions, and break multi-step tasks into separate prompts.',
  'help-cache-rate':           'Cache breaks when the prompt prefix changes between calls. Keep static instructions identical at the top; avoid timestamps in instruction files.',
  'help-large-context':        'Large instruction files make every session start expensive. Audit and trim instruction files; move reference docs out of instruction files.',
  'help-context-bloat':        'Tool results and instruction files expand context each turn. Keep instruction files under 4 KB; use line-ranged reads instead of full file reads.',
}

function renderHeatReason(r: HeatReason): preact.JSX.Element {
  if (!r.linkPhrase || !r.helpId) return <span style="color:var(--fg)">{r.text}</span>
  const idx = r.text.indexOf(r.linkPhrase)
  if (idx === -1) return <span style="color:var(--fg)">{r.text}</span>
  const before = r.text.slice(0, idx)
  const after  = r.text.slice(idx + r.linkPhrase.length)
  const tip = HELP_TOOLTIPS[r.helpId] || ''
  return (
    <span style="color:var(--fg)">
      {before}<span data-tip={tip} style="border-bottom:1px dotted currentColor;cursor:help">{r.linkPhrase}</span>{after}
    </span>
  )
}

function SessionDiagRow({ reasons }: { reasons: HeatReason[] }) {
  return (
    <tr>
      <td colSpan={10} style="padding:0">
        <div style="padding:8px 16px 12px 32px;background:var(--vscode-editorWidget-background,var(--bg));border-top:1px solid var(--border);font-size:11px">
          <div style="font-weight:600;color:var(--muted);margin-bottom:4px;font-size:10px;text-transform:uppercase">What needs attention</div>
          {reasons.map((r, i) => (
            <div key={i} style="display:flex;align-items:baseline;gap:6px;margin-bottom:3px">
              <span style="color:var(--error);flex-shrink:0">•</span>
              {renderHeatReason(r)}
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}

function SessionRow({ sess, idx, heat, expanded, onToggle }: {
  sess: SessionSummaryCard; idx: number;
  heat: { score: number; reasons: HeatReason[] }; expanded: boolean; onToggle: () => void
}) {
  const timeLabel = formatSessionTime(sess)
  const cacheRate = sess.inputTokens > 0 ? ((sess.cacheReadTokens / sess.inputTokens) * 100).toFixed(0) : '—'
  const agentDotColor = getAgentColor(sess.source)
  const isFocused = focusedSessionId.value === sess.sessionId

  let rowBg = ''
  if (isFocused) rowBg = 'rgba(55,148,255,0.12)'
  else if (heat.score > 60) rowBg = 'rgba(255,50,50,' + (0.15 + Math.min(heat.score - 60, 40) / 40 * 0.25) + ')'
  else if (heat.score > 30) rowBg = 'rgba(255,140,0,' + (0.12 + (heat.score - 30) / 30 * 0.18) + ')'
  else if (heat.score > 10) rowBg = 'rgba(255,180,50,' + (0.10 + (heat.score - 10) / 20 * 0.15) + ')'

  function handleRowClick() {
    focusedSessionId.value = isFocused ? null : sess.sessionId
    onToggle()
  }

  return (
    <>
      <tr style={'background:' + (rowBg || 'transparent') + ';cursor:pointer' + (isFocused ? ';outline:1px solid var(--vscode-focusBorder,#007fd4)' : '')} onClick={handleRowClick}>
        <td style="text-align:left;min-width:130px;padding:4px 8px">
          <div style="display:flex;align-items:flex-start;gap:4px">
            <span style="font-size:9px;color:var(--muted);flex-shrink:0;margin-top:2px">{expanded ? '▼' : '▶'}</span>
            <span style={'display:inline-block;width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:2px;background:' + agentDotColor} />
            <div>
              <div style="font-size:10px;color:var(--foreground);white-space:nowrap">{timeLabel}</div>
              {(sess.userRequest ?? '').length > 0 && (
                <div style="font-size:9px;color:var(--muted);margin-top:1px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic" title={sess.userRequest}>
                  {(sess.userRequest ?? '').slice(0, 55)}{(sess.userRequest ?? '').length > 55 ? '…' : ''}
                </div>
              )}
              {(() => {
                const br = burnRateData.value
                if (!br || br.sessionId !== sess.sessionId) return null
                const tpm = br.burnRate.tokensPerMinute
                const cph = br.burnRate.costPerHour
                const label = formatCompact(Math.round(tpm)) + ' tok/min' + (cph > 0.001 ? ' · $' + cph.toFixed(2) + '/hr' : '')
                return <span style="padding:1px 5px;background:var(--vscode-charts-green,#81c784);color:#000;border-radius:3px;font-size:9px;font-weight:600" data-tip={'Active session burn rate: ' + label}>{label}</span>
              })()}
            </div>
          </div>
        </td>
        <td style="text-align:left;white-space:nowrap;color:var(--muted);font-size:10px" title={sess.model}>{sess.model ? sess.model.split('/').pop() : '—'}</td>
        <td style="text-align:left;white-space:nowrap;font-size:10px;font-family:monospace;color:var(--muted)" title={sess.conversationId || ''}>
          {sess.conversationId ? sess.conversationId.slice(0, 8) : '—'}
        </td>
        <td class="right">{sess.totalLlmCalls}</td>
        <td class="right">{sess.totalToolCalls}</td>
        <td class="right">{sess.inputTokens.toLocaleString()}</td>
        <td class="right">{sess.outputTokens.toLocaleString()}</td>
        <td class="right">{cacheRate}%</td>
        <td class="right">{formatMs(sess.durationMs)}</td>
        <td style={'text-align:right' + (sess.errors > 0 ? ';color:var(--error)' : '')}>{sess.errors}</td>
      </tr>
      {expanded && heat.reasons.length > 0 && <SessionDiagRow reasons={heat.reasons} />}
    </>
  )
}

// ── Token usage per session — evenly-spaced bars, x-axis labeled with timestamps

export function SessionTokenChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // Oldest → newest left → right
    const sessionData = [...sessions].reverse()
      .map(sess => {
        const input = sess.inputTokens ?? 0, output = sess.outputTokens ?? 0
        return input + output > 0
          ? { startTime: sess.startTime, input, output, source: sess.source }
          : null
      })
      .filter(Boolean) as Array<{ startTime: string; input: number; output: number; source: string }>

    if (sessionData.length === 0) { canvas.style.display = 'none'; return }
    canvas.style.display = 'block'

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const w = rect.width, h = rect.height
    ctx.clearRect(0, 0, w, h)

    // No X-axis time labels — just slim bars + agent color dot beneath each
    const pad = { top: 8, right: 44, bottom: 14, left: 44 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom

    const maxIn  = Math.max(...sessionData.map(s => s.input))  || 1
    const maxOut = Math.max(...sessionData.map(s => s.output)) || 1

    const cs = getComputedStyle(document.body)
    const gridColor = cs.getPropertyValue('--vscode-panel-border').trim() || '#333'
    const fontStr = '9px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')

    ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH * i / 4
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke()
    }
    ctx.fillStyle = '#FFB74D'; ctx.font = fontStr; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    for (let i = 0; i <= 4; i++) {
      const val = maxIn * (4 - i) / 4
      if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + chartH * i / 4)
    }
    ctx.fillStyle = '#81C784'; ctx.textAlign = 'left'
    for (let i = 0; i <= 4; i++) {
      const val = maxOut * (4 - i) / 4
      if (val > 0) ctx.fillText(formatCompact(val), pad.left + chartW + 4, pad.top + chartH * i / 4)
    }

    const sl = sessionData.length
    // Slot-based sizing: fill full chart width regardless of session count
    const slotW = chartW / Math.max(sl, 1)
    const barPad = sl > 100 ? 0 : sl > 50 ? 0.2 : sl > 20 ? 0.5 : 1
    const halfSlot = slotW / 2
    const halfBar = Math.max(0.5, halfSlot - barPad)

    sessionData.forEach((s, i) => {
      const slotX = pad.left + i * slotW
      const inH = (s.input / maxIn) * chartH
      ctx.fillStyle = '#FFB74D'; ctx.fillRect(slotX + barPad, pad.top + chartH - inH, halfBar, inH)
      const outH = (s.output / maxOut) * chartH
      ctx.fillStyle = '#81C784'; ctx.fillRect(slotX + halfSlot, pad.top + chartH - outH, halfBar, outH)
      // Agent color dot below bar
      ctx.beginPath()
      ctx.arc(slotX + slotW / 2, pad.top + chartH + 7, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = getAgentColor(s.source); ctx.fill()
    })
  })

  return (
    <>
      <canvas ref={canvasRef} style="width:100%;height:160px;display:block" />
      <div class="heatmap-axis-label">← older · sessions · newer →</div>
    </>
  )
}

export function Efficiency() {
  const summary = sessionSummary.value
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0]))

  const hasAny = (summary?.sessions?.length ?? 0) > 0

  const displaySess = filteredSessions.value
  const range = timeRange.value
  const isTimeFiltered = range.preset !== 'all'

  // When a time range filter returns no sessions show a clear empty state rather
  // than a mostly-blank tab (rangedSessions falls back to live data while loading,
  // so empty here means the query completed with 0 results).
  if (displaySess.length === 0) {
    return (
      <div id="efficiency-content">
        <div class="empty-state">
          {hasAny ? 'No sessions match the active filters.' : 'No sessions recorded yet.'}
        </div>
      </div>
    )
  }

  const breakdownSessions = displaySess.slice().reverse()

  // Request timeline for any session not yet loaded — needed for context growth chart and heat scores.
  const timelines = sessionTimelines.value
  breakdownSessions.forEach(sess => {
    if (!timelines[sess.sessionId]) {
      vscode?.postMessage({ type: 'loadSessionDetail', sessionId: sess.sessionId })
    }
  })

  // Heat scores for session rows
  const sessionHeats = breakdownSessions.map(sess => {
    let score = 0; const reasons: HeatReason[] = []
    if (sess.errors > 0) { score += Math.min(sess.errors * 25, 40); reasons.push({ text: sess.errors + ' error' + (sess.errors > 1 ? 's' : '') + ' — be explicit about file locations and command availability to avoid failed tool calls', linkPhrase: 'be explicit about file locations and command availability', helpId: 'help-tool-failures' }) }
    if (sess.totalLlmCalls > 8) { score += Math.min((sess.totalLlmCalls - 8) * 4, 30); reasons.push({ text: sess.totalLlmCalls + ' LLM calls — break the task into smaller pieces with explicit stopping conditions', linkPhrase: 'break the task into smaller pieces with explicit stopping conditions', helpId: 'help-high-turns' }) }
    const cacheRateNum = sess.inputTokens > 0 ? (sess.cacheReadTokens / sess.inputTokens) * 100 : 100
    if (cacheRateNum < 50 && sess.inputTokens > 5000) { score += Math.min((50 - cacheRateNum) * 0.5, 20); reasons.push({ text: 'Cache hit rate ' + cacheRateNum.toFixed(0) + '% — keep static content at the top of prompts so the cache prefix stays stable', linkPhrase: 'keep static content at the top of prompts so the cache prefix stays stable', helpId: 'help-cache-rate' }) }
    if (sess.inputTokens > 100000) { score += 10; reasons.push({ text: sess.inputTokens.toLocaleString() + ' input tokens — audit your instruction files and remove verbose examples', linkPhrase: 'audit your instruction files and remove verbose examples', helpId: 'help-large-context' }) }
    const llmEntries = (timelines[sess.sessionId] ?? sess.timeline ?? []).filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0)
    if (llmEntries.length >= 3) {
      const first = llmEntries[0].inputTokens ?? 0, last = llmEntries[llmEntries.length - 1].inputTokens ?? 0
      const growthPct = first > 0 ? ((last - first) / first) * 100 : 0
      if (growthPct > 50) { score += Math.min(growthPct / 10, 15); reasons.push({ text: 'Context grew ' + growthPct.toFixed(0) + '% — review instruction file sizes and use narrower tool reads', linkPhrase: 'review instruction file sizes and use narrower tool reads', helpId: 'help-context-bloat' }) }
    }
    return { score: Math.min(score, 100), reasons }
  })

  let totLlm = 0, totTool = 0, totIn = 0, totOut = 0, totDur = 0, totErr = 0
  breakdownSessions.forEach(s => { totLlm += s.totalLlmCalls; totTool += s.totalToolCalls; totIn += s.inputTokens; totOut += s.outputTokens; totDur += s.durationMs; totErr += s.errors })

  const totalSessionCount = sessionSummary.value?.sessions?.length ?? breakdownSessions.length

  // For the growth chart, use ALL in-memory sessions (bypasses the sessionLimit cap)
  // so sessions from all agent types appear, not just the most recent N.
  // For time-bounded ranges, rangedSessions already contains the right set.
  const chartSessions = isTimeFiltered
    ? displaySess.slice().reverse().slice(0, CHART_MAX)
    : agentFilteredSessions.value.slice().reverse().slice(0, CHART_MAX)

  // Load timelines for chart sessions too (they may differ from breakdownSessions)
  chartSessions.forEach(sess => {
    if (!timelines[sess.sessionId]) {
      vscode?.postMessage({ type: 'loadSessionDetail', sessionId: sess.sessionId })
    }
  })

  return (
    <div id="efficiency-content">
      {/* Context Growth — turn-based x-axis */}
      <h3 class="has-metric-tip" style="margin:0 0 4px;font-size:13px;color:var(--muted)" data-tip="Input tokens per LLM call by turn number. Each line is one session — steeper = faster context growth. Click a line to select that session.">CONTEXT GROWTH</h3>
      <ContextGrowthChart sessions={chartSessions} timelines={timelines} />

      {/* Token Usage — right below Context Growth */}
      {displaySess.length > 0 && (
        <div style="margin-top:16px">
          <h3 style="margin:0 0 4px;font-size:13px;color:var(--muted)">TOKEN USAGE PER SESSION</h3>
          <div style="display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)">
            <span><span style="display:inline-block;width:10px;height:3px;background:#FFB74D;border-radius:1px;vertical-align:middle" /> Input</span>
            <span><span style="display:inline-block;width:10px;height:3px;background:#81C784;border-radius:1px;vertical-align:middle" /> Output</span>
          </div>
          <SessionTokenChart sessions={displaySess.slice(0, CHART_MAX)} />
        </div>
      )}

      {breakdownSessions.length > 0 && (
        <>
          <h3 class="has-metric-tip" style="margin:24px 0 8px;font-size:13px;color:var(--muted)" data-tip="Per-session metrics with heat coloring. Warmer colors indicate higher token usage or more errors. Click a row to focus it — Traces and Flow will open to that session.">SESSION BREAKDOWN</h3>
          <div style="display:flex;gap:16px;margin-bottom:4px;font-size:10px;color:var(--muted);align-items:center">
            <span style="font-weight:600">Usage:</span>
            <span class="flex-4"><span style="display:inline-block;width:12px;height:10px;border-radius:2px;background:var(--vscode-editorWidget-background,var(--bg));border:1px solid var(--border)"></span> Minimal</span>
            <span class="flex-4"><span style="display:inline-block;width:12px;height:10px;border-radius:2px;background:rgba(255,180,50,0.25);border:1px solid rgba(255,180,50,0.4)"></span> Light</span>
            <span class="flex-4"><span style="display:inline-block;width:12px;height:10px;border-radius:2px;background:rgba(255,140,0,0.30);border:1px solid rgba(255,140,0,0.5)"></span> Moderate</span>
            <span class="flex-4"><span style="display:inline-block;width:12px;height:10px;border-radius:2px;background:rgba(255,50,50,0.35);border:1px solid rgba(255,50,50,0.5)"></span> Heavy</span>
          </div>
          <table class="tool-insights-table">
            <thead>
              <tr>
                <th style="text-align:left;min-width:130px" data-tip="Agent type (dot color), session start time, and initial prompt — click a row to focus it in Traces and Flow">Session</th>
                <th style="text-align:left" data-tip="LLM model used">Model</th>
                <th style="text-align:left" data-tip="Conversation thread ID — groups multiple sessions from the same chat thread. Copilot and Codex report this; Claude sessions are standalone with no conversation wrapper.">Conv ID</th>
                <th class="right" data-tip="LLM round-trips">LLM Calls</th>
                <th class="right" data-tip="Tool invocations">Tool Calls</th>
                <th class="right" data-tip="Total input tokens">Input Tokens</th>
                <th class="right" data-tip="Total output tokens">Output Tokens</th>
                <th class="right" data-tip="Cache hit rate">Cache Hit</th>
                <th class="right" data-tip="Wall-clock duration">Duration</th>
                <th class="right" data-tip="Error count">Errors</th>
              </tr>
            </thead>
            <tbody>
              {breakdownSessions.map((sess, idx) => (
                <SessionRow
                  key={sess.traceId + idx}
                  sess={sess}
                  idx={idx}

                  heat={sessionHeats[idx]}
                  expanded={expandedRows.has(idx)}
                  onToggle={() => setExpandedRows(prev => {
                    const next = new Set(prev)
                    next.has(idx) ? next.delete(idx) : next.add(idx)
                    return next
                  })}
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style="text-align:left;padding:4px 8px"><strong>Total</strong></td>
                <td /><td />
                <td class="right"><strong>{totLlm}</strong></td>
                <td class="right"><strong>{totTool}</strong></td>
                <td class="right"><strong>{totIn.toLocaleString()}</strong></td>
                <td class="right"><strong>{totOut.toLocaleString()}</strong></td>
                <td />
                <td class="right"><strong>{formatMs(totDur)}</strong></td>
                <td style={'text-align:right' + (totErr > 0 ? ';color:var(--error)' : '')}><strong>{totErr}</strong></td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      </div>
    )
  }
