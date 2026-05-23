import * as preact from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { sessionSummary, displaySessions, COLORS } from '../state'
import {
  getSessionGlobalNumber,
  formatMs, formatCompact, getAgentColor,
} from '../utils'
import type { SessionSummaryCard } from '../types'

type HeatReason = { text: string; linkPhrase?: string; helpId?: string }

// ── Context growth chart ──────────────────────────────────────────────────────

function ContextGrowthChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const seriesData: Array<{ label: string; points: number[]; color: string }> = []
    let globalMax = 0, globalMin = Infinity, globalMaxPoints = 0

    sessions.forEach((sess, idx) => {
      const llmEntries = (sess.timeline ?? []).filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0)
      if (llmEntries.length < 1) return
      const points = llmEntries.map(e => e.inputTokens ?? 0)
      const max = Math.max(...points), min = Math.min(...points)
      if (max > globalMax) globalMax = max
      if (min < globalMin) globalMin = min
      if (points.length > globalMaxPoints) globalMaxPoints = points.length
      const sessionNum = getSessionGlobalNumber(sess) || (idx + 1)
      seriesData.push({ label: '' + sessionNum, points, color: getAgentColor(sess.source) || COLORS[idx % COLORS.length] })
    })

    if (seriesData.length === 0) { canvas.style.display = 'none'; return }
    canvas.style.display = 'block'

    const dataRange = globalMax - globalMin
    const adjRange = dataRange === 0 ? (globalMax * 0.1 || 1) : dataRange
    const yPad = adjRange * 0.1
    const yMin = Math.max(0, globalMin - yPad), yMax = globalMax + yPad

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const w = rect.width, h = rect.height
    ctx.clearRect(0, 0, w, h)

    const pad = { top: 8, right: 40, bottom: 24, left: 64 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom

    const cs = getComputedStyle(document.body)
    const gridColor = cs.getPropertyValue('--vscode-panel-border').trim() || '#333'
    const textColor = cs.getPropertyValue('--vscode-descriptionForeground').trim() || '#888'
    const fontStr = '10px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')

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
    ctx.save()
    ctx.translate(10, pad.top + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = textColor; ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Input Tokens', 0, 0)
    ctx.restore()
    ctx.fillStyle = textColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('Turns (LLM Calls)', pad.left + chartW / 2, pad.top + chartH + 10)

    seriesData.forEach(series => {
      const pts = series.points
      const lastX = pad.left + (pts.length - 1) / Math.max(globalMaxPoints - 1, 1) * chartW
      const lastY = pad.top + chartH - (pts[pts.length - 1] - yMin) / (yMax - yMin) * chartH
      if (pts.length >= 2) {
        ctx.beginPath()
        for (let j = 0; j < pts.length; j++) {
          const x = pad.left + j / Math.max(globalMaxPoints - 1, 1) * chartW
          const y = pad.top + chartH - (pts[j] - yMin) / (yMax - yMin) * chartH
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = series.color; ctx.lineWidth = 1.5; ctx.stroke()
      }
      // Always draw a dot at the last (or only) point — larger for single-point (in-progress) sessions
      ctx.beginPath()
      ctx.arc(lastX, lastY, pts.length === 1 ? 5 : 3, 0, Math.PI * 2)
      ctx.fillStyle = series.color; ctx.fill()
      ctx.fillStyle = series.color; ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText(series.label, lastX + (pts.length === 1 ? 9 : 5), lastY)
    })
  })

  return <canvas ref={canvasRef} id="context-growth-chart" style="width:100%;height:180px;display:block" />
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
  const realIdx = getSessionGlobalNumber(sess) || (idx + 1)
  const cacheRate = sess.inputTokens > 0 ? ((sess.cacheReadTokens / sess.inputTokens) * 100).toFixed(0) : '—'
  const agentDotColor = getAgentColor(sess.source)

  let rowBg = ''
  if (heat.score > 60) rowBg = 'rgba(255,50,50,' + (0.15 + Math.min(heat.score - 60, 40) / 40 * 0.25) + ')'
  else if (heat.score > 30) rowBg = 'rgba(255,140,0,' + (0.12 + (heat.score - 30) / 30 * 0.18) + ')'
  else if (heat.score > 10) rowBg = 'rgba(255,180,50,' + (0.10 + (heat.score - 10) / 20 * 0.15) + ')'

  return (
    <>
      <tr style={'background:' + (rowBg || 'transparent') + ';cursor:pointer'} onClick={onToggle}>
        <td style="text-align:center;font-weight:bold;white-space:nowrap">
          <span style="font-size:9px;color:var(--muted);margin-right:3px">{expanded ? '▼' : '▶'}</span>{realIdx} <span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + agentDotColor + ';vertical-align:middle'} />
        </td>
        <td style="text-align:left;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title={sess.userRequest}>
          {(sess.userRequest ?? '').slice(0, 60)}{(sess.userRequest ?? '').length > 60 ? '…' : ''}
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

export function Efficiency() {
  const summary = sessionSummary.value
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0]))

  if (!summary?.sessions?.length) {
    return <div id="efficiency-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  const displaySess = displaySessions.value
  const breakdownSessions = displaySess.slice().reverse()

  // Heat scores for session rows
  const sessionHeats = breakdownSessions.map(sess => {
    let score = 0; const reasons: HeatReason[] = []
    if (sess.errors > 0) { score += Math.min(sess.errors * 25, 40); reasons.push({ text: sess.errors + ' error' + (sess.errors > 1 ? 's' : '') + ' — be explicit about file locations and command availability to avoid failed tool calls', linkPhrase: 'be explicit about file locations and command availability', helpId: 'help-tool-failures' }) }
    if (sess.totalLlmCalls > 8) { score += Math.min((sess.totalLlmCalls - 8) * 4, 30); reasons.push({ text: sess.totalLlmCalls + ' LLM calls — break the task into smaller pieces with explicit stopping conditions', linkPhrase: 'break the task into smaller pieces with explicit stopping conditions', helpId: 'help-high-turns' }) }
    const cacheRateNum = sess.inputTokens > 0 ? (sess.cacheReadTokens / sess.inputTokens) * 100 : 100
    if (cacheRateNum < 50 && sess.inputTokens > 5000) { score += Math.min((50 - cacheRateNum) * 0.5, 20); reasons.push({ text: 'Cache hit rate ' + cacheRateNum.toFixed(0) + '% — keep static content at the top of prompts so the cache prefix stays stable', linkPhrase: 'keep static content at the top of prompts so the cache prefix stays stable', helpId: 'help-cache-rate' }) }
    if (sess.inputTokens > 100000) { score += 10; reasons.push({ text: sess.inputTokens.toLocaleString() + ' input tokens — audit your instruction files and remove verbose examples', linkPhrase: 'audit your instruction files and remove verbose examples', helpId: 'help-large-context' }) }
    const llmEntries = (sess.timeline ?? []).filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0)
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
    (sess.timeline ?? []).filter(e => e.type === 'llm' && (e.inputTokens ?? 0) > 0).length >= 1
  )

  return (
    <div id="efficiency-content">

      {sessionsWithGrowth.length > 0 && (
        <>
          <h3 class="has-metric-tip" style="margin:24px 0 12px;font-size:13px;color:var(--muted)" data-tip="Input tokens sent per LLM call within each session. Rising lines indicate context accumulation. A sharp drop mid-session indicates context compaction. A single dot marks an in-progress session with one LLM call so far.">CONTEXT GROWTH PER SESSION</h3>
          <ContextGrowthChart sessions={breakdownSessions} />
          <div style="font-size:10px;color:var(--muted);opacity:0.7;margin:4px 0 12px 2px">
            Suggestion: If the graph appears crowded, consider refining the view by selecting fewer sessions (such as “Last 5”) or filtering by a specific agent to enhance clarity.
          </div>
        </>
      )}

      {breakdownSessions.length > 0 && (
        <>
          <h3 class="has-metric-tip" style="margin:24px 0 12px;font-size:13px;color:var(--muted)" data-tip="Per-session metrics with heat coloring. Warmer colors indicate higher token usage or more errors. Expand a row to see efficiency notes.">SESSION BREAKDOWN</h3>
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
                <th style="text-align:center" data-tip="Session number">#</th>
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

      </div>
    )
  }
