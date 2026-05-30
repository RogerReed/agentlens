import * as preact from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { sessionSummary, displaySessions, rangedSessions, sessionTimelines, burnRateData, focusedSessionId, CHART_MAX, COLORS, vscode } from '../state'
import {
  getSessionGlobalNumber,
  formatMs, formatCompact, getAgentColor, formatSessionTime,
} from '../utils'
import type { SessionSummaryCard } from '../types'

type HeatReason = { text: string; linkPhrase?: string; helpId?: string }

// ── Context growth — small-multiples sparkline per session ────────────────────
// Each session gets its own mini chart labeled with its timestamp.
// Scales to many sessions without overlap; focused session is highlighted.

function ContextSparkline({ sess, points, isFocused }: {
  sess: SessionSummaryCard; points: number[]; isFocused: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const color = getAgentColor(sess.source)
  const timeLabel = formatSessionTime(sess)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || points.length === 0) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (!rect.width) return
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const W = rect.width, H = rect.height
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 4, right: 4, bottom: 4, left: 4 }
    const cW = W - pad.left - pad.right
    const cH = H - pad.top - pad.bottom

    const maxY = Math.max(...points) || 1
    const minY = Math.min(...points)
    const range = maxY - minY || maxY * 0.1 || 1

    ctx.beginPath()
    points.forEach((p, i) => {
      const x = pad.left + (points.length === 1 ? cW / 2 : i / (points.length - 1) * cW)
      const y = pad.top + cH - ((p - minY) / range) * cH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color + (isFocused ? 'ff' : 'cc')
    ctx.lineWidth = isFocused ? 2 : 1.5
    ctx.stroke()

    // Fill under line
    const lastX = pad.left + (points.length === 1 ? cW / 2 : cW)
    ctx.lineTo(lastX, pad.top + cH)
    ctx.lineTo(pad.left, pad.top + cH)
    ctx.closePath()
    ctx.fillStyle = color + '22'
    ctx.fill()

    // Dot at last point
    const dotX = pad.left + (points.length === 1 ? cW / 2 : cW)
    const dotY = pad.top + cH - ((points[points.length - 1] - minY) / range) * cH
    ctx.beginPath()
    ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  })

  return (
    <div
      style={[
        'cursor:pointer;border-radius:4px;padding:4px 6px 2px;',
        isFocused
          ? 'outline:2px solid var(--vscode-focusBorder,#007fd4);background:rgba(55,148,255,0.08)'
          : 'background:var(--vscode-editor-background)',
      ].join('')}
      onClick={() => { focusedSessionId.value = isFocused ? null : sess.sessionId }}
      title={`${timeLabel} — ${formatCompact(Math.max(...points))} max input tok · ${points.length} turn${points.length !== 1 ? 's' : ''}`}
    >
      <canvas ref={canvasRef} style="width:100%;height:52px;display:block" />
      <div style="font-size:9px;color:var(--muted);text-align:center;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        {timeLabel}
      </div>
    </div>
  )
}

function ContextGrowthChart({ sessions, timelines }: { sessions: SessionSummaryCard[]; timelines: Record<string, import('../types').TimelineEntry[]> }) {
  const sessionsWithPoints = sessions
    .map(sess => {
      const entries = (timelines[sess.sessionId] ?? sess.timeline ?? []).filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0)
      return { sess, points: entries.map(e => e.inputTokens ?? 0) }
    })
    .filter(s => s.points.length >= 1)
    // newest first → reverse for chart (oldest left)
    .slice().reverse()

  if (sessionsWithPoints.length === 0) return null

  const focusedId = focusedSessionId.value

  // 1 session: full-width line chart (original style, repurposed)
  if (sessionsWithPoints.length === 1) {
    const { sess, points } = sessionsWithPoints[0]
    return (
      <div>
        <ContextSparkline sess={sess} points={points} isFocused={focusedId === sess.sessionId} />
        <div style="font-size:10px;color:var(--muted);margin-top:2px">{formatSessionTime(sess)} · {points.length} turn{points.length !== 1 ? 's' : ''} · peak {formatCompact(Math.max(...points))} input tok</div>
      </div>
    )
  }

  // 2+ sessions: responsive small-multiples grid
  const cols = sessionsWithPoints.length <= 4 ? sessionsWithPoints.length :
               sessionsWithPoints.length <= 8 ? 4 :
               sessionsWithPoints.length <= 16 ? 5 : 6

  return (
    <div style={`display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px`}>
      {sessionsWithPoints.map(({ sess, points }) => (
        <ContextSparkline
          key={sess.sessionId}
          sess={sess}
          points={points}
          isFocused={focusedId === sess.sessionId}
        />
      ))}
    </div>
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
      <td colSpan={11} style="padding:0">
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
        <td style="text-align:left;white-space:nowrap;min-width:100px">
          <span style="font-size:9px;color:var(--muted);margin-right:4px">{expanded ? '▼' : '▶'}</span>
          <span style={'display:inline-block;width:7px;height:7px;border-radius:50%;background:' + agentDotColor + ';vertical-align:middle;margin-right:4px'} />
          <span style="font-size:11px;color:var(--foreground)">{timeLabel}</span>
        </td>
        <td style="text-align:left;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title={sess.userRequest}>
          {(sess.userRequest ?? '').slice(0, 60)}{(sess.userRequest ?? '').length > 60 ? '…' : ''}
          {(() => {
            const br = burnRateData.value
            if (!br || br.sessionId !== sess.sessionId) return null
            const tpm = br.burnRate.tokensPerMinute
            const cph = br.burnRate.costPerHour
            const label = formatCompact(Math.round(tpm)) + ' tok/min' + (cph > 0.001 ? ' · $' + cph.toFixed(2) + '/hr' : '')
            return <span style="margin-left:6px;padding:1px 5px;background:var(--vscode-charts-green,#81c784);color:#000;border-radius:3px;font-size:9px;font-weight:600;vertical-align:middle" data-tip={'Active session burn rate: ' + label}>{label}</span>
          })()}
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

// ── Token usage chart — time-positioned bars ──────────────────────────────────
// X-axis is actual time; bars placed at session start times so gaps are visible.
// For >25 sessions: aggregates to daily totals (same chart shape, daily granularity).

function SessionTokenChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // Determine granularity: individual sessions vs. daily aggregates
    const useDaily = sessions.length > CHART_MAX

    type Bar = { label: string; input: number; output: number; source: string; timeMs: number }
    let bars: Bar[]

    if (useDaily) {
      // Aggregate by calendar day
      const byDay = new Map<string, Bar>()
      sessions.forEach(sess => {
        if (!sess.startTime) return
        const day = sess.startTime.slice(0, 10)
        const existing = byDay.get(day)
        if (existing) {
          existing.input  += sess.inputTokens
          existing.output += sess.outputTokens
        } else {
          byDay.set(day, {
            label: day.slice(5),   // "MM-DD"
            input: sess.inputTokens,
            output: sess.outputTokens,
            source: sess.source,
            timeMs: new Date(day + 'T00:00:00').getTime(),
          })
        }
      })
      bars = [...byDay.values()].sort((a, b) => a.timeMs - b.timeMs)
    } else {
      // Individual sessions, oldest→newest left→right
      bars = [...sessions].reverse().map(sess => ({
        label: formatSessionTime(sess),
        input: sess.inputTokens,
        output: sess.outputTokens,
        source: sess.source,
        timeMs: sess.startTime ? new Date(sess.startTime).getTime() : 0,
      }))
    }

    bars = bars.filter(b => b.input + b.output > 0)
    if (bars.length === 0) { canvas.style.display = 'none'; return }
    canvas.style.display = 'block'

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const w = rect.width, h = rect.height
    ctx.clearRect(0, 0, w, h)

    const pad = { top: 8, right: 44, bottom: 40, left: 44 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom

    const maxIn  = Math.max(...bars.map(b => b.input))  || 1
    const maxOut = Math.max(...bars.map(b => b.output)) || 1

    const cs = getComputedStyle(document.body)
    const gridColor = cs.getPropertyValue('--vscode-panel-border').trim() || '#333'
    const textColor = cs.getPropertyValue('--vscode-descriptionForeground').trim() || '#888'
    const fontStr = '9px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')

    // Gridlines + y-axis labels
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

    // Position bars by actual time (reveals gaps in activity)
    const n = bars.length
    const minT = bars[0].timeMs, maxT = bars[n - 1].timeMs
    const timeSpan = maxT - minT || 1

    const minBarW = 6, maxBarW = 28
    const barW = Math.max(minBarW, Math.min(maxBarW, chartW / (n * 1.6)))
    const halfBar = barW / 2

    ctx.textAlign = 'center'; ctx.textBaseline = 'top'

    // Decide which x-axis labels to show (avoid crowding)
    const labelEvery = Math.ceil(n / Math.max(1, Math.floor(chartW / 40)))

    bars.forEach((b, i) => {
      // When bars > 1: position by time. When 1: center it.
      const tFrac = n === 1 ? 0.5 : (b.timeMs - minT) / timeSpan
      const cx = pad.left + tFrac * chartW

      const inH = (b.input / maxIn) * chartH
      ctx.fillStyle = '#FFB74D'
      ctx.fillRect(cx - halfBar, pad.top + chartH - inH, halfBar, inH)

      const outH = (b.output / maxOut) * chartH
      ctx.fillStyle = '#81C784'
      ctx.fillRect(cx, pad.top + chartH - outH, halfBar, outH)

      // X-axis label (time or date)
      if (i % labelEvery === 0 || i === n - 1) {
        ctx.fillStyle = textColor; ctx.font = fontStr
        const lbl = useDaily ? b.label : (b.timeMs > 0
          ? new Date(b.timeMs).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
          : '')
        ctx.fillText(lbl, cx, pad.top + chartH + 4)
      }

      // Agent dot
      ctx.beginPath()
      ctx.arc(cx, pad.top + chartH + 24, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = getAgentColor(b.source)
      ctx.fill()
    })
  })

  return (
    <>
      <canvas ref={canvasRef} style="width:100%;height:200px;display:block" />
      <div class="heatmap-axis-label">← earlier · time · later →</div>
    </>
  )
}

export function Efficiency() {
  const summary = sessionSummary.value
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0]))

  if (!summary?.sessions?.length) {
    return <div id="efficiency-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  const displaySess = rangedSessions.value
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

  const sessionsWithGrowth = breakdownSessions.filter(sess =>
    (timelines[sess.sessionId] ?? sess.timeline ?? []).filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0).length >= 1
  )

  const totalSessionCount = sessionSummary.value?.sessions?.length ?? breakdownSessions.length
  const cappedChart = breakdownSessions  // small multiples scale; no hard cap on context growth

  return (
    <div id="efficiency-content">
      {sessionsWithGrowth.length > 0 && (
        <>
          <h3 class="has-metric-tip" style="margin:24px 0 4px;font-size:13px;color:var(--muted)" data-tip="Input tokens per LLM call within each session. Rising lines show context accumulation; a sharp drop indicates compaction.">CONTEXT GROWTH PER SESSION</h3>
          <ContextGrowthChart sessions={cappedChart} timelines={timelines} />
        </>
      )}

      {breakdownSessions.length > 0 && (
        <>
          <div style="display:flex;align-items:baseline;gap:10px;margin:24px 0 8px">
            <h3 class="has-metric-tip" style="margin:0;font-size:13px;color:var(--muted)" data-tip="Per-session metrics with heat coloring. Warmer colors indicate higher token usage or more errors. Click a row to focus it — Traces and Flow will open to that session.">SESSION BREAKDOWN</h3>
            <span style="font-size:10px;color:var(--muted)">
              {breakdownSessions.length < totalSessionCount
                ? `Showing ${breakdownSessions.length} of ${totalSessionCount} sessions`
                : `${totalSessionCount} session${totalSessionCount !== 1 ? 's' : ''}`}
            </span>
          </div>
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
                <th style="text-align:left;min-width:100px" data-tip="Session start time — click a row to focus it in Traces and Flow">Time</th>
                <th style="text-align:left" data-tip="The user prompt that started this session">Prompt</th>
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
                <td /><td style="text-align:left"><strong>Total</strong></td>
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

      {/* Token usage per session */}
      {displaySess.length > 0 && (
        <div style="margin-top:32px">
          <h3 style="margin:0 0 4px;font-size:13px;color:var(--muted)">
            TOKEN USAGE — {displaySess.length > CHART_MAX ? 'DAILY TOTALS' : 'PER SESSION'}
          </h3>
          {displaySess.length > CHART_MAX && (
            <div style="font-size:10px;color:var(--muted);margin-bottom:4px">{displaySess.length} sessions aggregated by day — narrow the time range to see individual sessions</div>
          )}
          <div style="display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)">
            <span><span style="display:inline-block;width:10px;height:3px;background:#FFB74D;border-radius:1px;vertical-align:middle" /> Input</span>
            <span><span style="display:inline-block;width:10px;height:3px;background:#81C784;border-radius:1px;vertical-align:middle" /> Output</span>
          </div>
          <SessionTokenChart sessions={displaySess} />
        </div>
      )}

      </div>
    )
  }
