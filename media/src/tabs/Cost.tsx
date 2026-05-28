import { useState } from 'preact/hooks'
import { useEffect, useRef } from 'preact/hooks'
import { displaySessions, COLORS } from '../state'
import { getAgentColor, getSessionGlobalNumber, formatCompact, getAgentSourceLabel } from '../utils'
import { calcSessionCost } from '../sessionMetrics'
import { PRICING_LAST_UPDATED } from '../pricing'
import type { PricingMode } from '../sessionMetrics'
import type { SessionSummaryCard } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUsd(usd: number): string {
  if (usd === 0) return '$0.00'
  if (usd < 0.001) return '<$0.001'
  if (usd < 1) return '$' + usd.toFixed(3)
  return '$' + usd.toFixed(2)
}

function fmtCredits(credits: number): string {
  if (credits === 0) return '0'
  if (credits < 0.1) return '<0.1'
  return credits.toFixed(1)
}

// ── Per-session cost bar chart ─────────────────────────────────────────────────

function CostBarChart({ sessions, mode }: { sessions: SessionSummaryCard[]; mode: PricingMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const data = sessions.map((sess, idx) => {
      const cost = calcSessionCost(sess, mode)
      return { cost: cost.totalUsd, unknown: cost.modelUnknown, session: getSessionGlobalNumber(sess) || (idx + 1), source: sess.source }
    }).reverse()

    const maxCost = Math.max(...data.map(d => d.cost), 0.0001)

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const w = rect.width, h = rect.height
    ctx.clearRect(0, 0, w, h)

    const pad = { top: 8, right: 16, bottom: 30, left: 64 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom

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
      const val = maxCost * (4 - i) / 4
      ctx.fillText('$' + val.toFixed(val < 0.01 ? 3 : 2), pad.left - 4, pad.top + chartH * i / 4)
    }

    const barGap = 6
    const barW = Math.max(10, (chartW - barGap * (data.length + 1)) / data.length)
    const offsetX = pad.left + (chartW - (data.length * barW + (data.length + 1) * barGap)) / 2 + barGap

    data.forEach((d, i) => {
      const x = offsetX + i * (barW + barGap)
      const barH = (d.cost / maxCost) * chartH
      const y = pad.top + chartH - barH
      ctx.fillStyle = d.unknown ? '#666' : getAgentColor(d.source)
      ctx.fillRect(x, y, barW, barH)
      ctx.fillStyle = textColor; ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(String(d.session), x + barW / 2, pad.top + chartH + 4)
      if (d.unknown) {
        ctx.fillStyle = '#999'; ctx.textBaseline = 'bottom'
        ctx.fillText('?', x + barW / 2, y - 1)
      }
    })
  })

  return (
    <>
      <canvas ref={canvasRef} style="width:100%;height:180px;display:block" />
      <div class="heatmap-axis-label">← Session (latest to earliest) →</div>
    </>
  )
}

// ── Per-turn cumulative cost line chart ────────────────────────────────────────

function CostGrowthChart({ sessions, mode }: { sessions: SessionSummaryCard[]; mode: PricingMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const seriesData: Array<{ label: string; points: number[]; color: string }> = []
    let globalMax = 0, globalMaxPoints = 0

    sessions.forEach((sess, idx) => {
      const cost = calcSessionCost(sess, mode)
      if (cost.byTurn.length === 0) return
      const max = cost.byTurn[cost.byTurn.length - 1]
      if (max > globalMax) globalMax = max
      if (cost.byTurn.length > globalMaxPoints) globalMaxPoints = cost.byTurn.length
      seriesData.push({
        label: String(getSessionGlobalNumber(sess) || (idx + 1)),
        points: cost.byTurn,
        color: getAgentColor(sess.source) || COLORS[idx % COLORS.length],
      })
    })

    if (seriesData.length === 0) { canvas.style.display = 'none'; return }
    canvas.style.display = 'block'

    const yMax = globalMax * 1.1 || 0.001

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
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom

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
      const val = yMax * (4 - i) / 4
      ctx.fillText('$' + (val < 0.01 ? val.toFixed(3) : val.toFixed(2)), pad.left - 4, pad.top + chartH * i / 4)
    }
    ctx.save()
    ctx.translate(10, pad.top + chartH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = textColor; ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Cumulative Cost (USD)', 0, 0)
    ctx.restore()
    ctx.fillStyle = textColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('Turns (LLM Calls)', pad.left + chartW / 2, pad.top + chartH + 10)

    seriesData.forEach(series => {
      const pts = series.points
      const lastX = pad.left + (pts.length - 1) / Math.max(globalMaxPoints - 1, 1) * chartW
      const lastY = pad.top + chartH - (pts[pts.length - 1] / yMax) * chartH
      if (pts.length >= 2) {
        ctx.beginPath()
        for (let j = 0; j < pts.length; j++) {
          const x = pad.left + j / Math.max(globalMaxPoints - 1, 1) * chartW
          const y = pad.top + chartH - (pts[j] / yMax) * chartH
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = series.color; ctx.lineWidth = 1.5; ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(lastX, lastY, pts.length === 1 ? 5 : 3, 0, Math.PI * 2)
      ctx.fillStyle = series.color; ctx.fill()
      ctx.fillStyle = series.color; ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText(series.label, lastX + (pts.length === 1 ? 9 : 5), lastY)
    })
  })

  return <canvas ref={canvasRef} style="width:100%;height:180px;display:block" />
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function Cost() {
  const sessions = displaySessions.value
  const [mode, setMode] = useState<PricingMode>('token')

  const copilotSessions = sessions.filter(s => s.source === 'copilot')

  const scopeNote = (
    <div style="font-size:11px;color:var(--muted);background:var(--hover);border:1px solid var(--border);border-radius:4px;padding:7px 10px;margin-bottom:16px;line-height:1.5">
      Cost estimation is currently implemented for <strong>Copilot</strong> sessions only. Claude and Codex support coming soon.
    </div>
  )

  if (copilotSessions.length === 0) {
    return (
      <div id="cost-content">
        {scopeNote}
        <div class="empty-state">No Copilot sessions recorded — start a Copilot chat session to see cost estimates</div>
      </div>
    )
  }

  const costs = copilotSessions.map(s => ({ session: s, cost: calcSessionCost(s, mode) }))
  const totalUsd = costs.reduce((sum, c) => sum + c.cost.totalUsd, 0)
  const totalCredits = totalUsd / 0.01
  const anyUnknown = costs.some(c => c.cost.modelUnknown)

  const sessionRows = costs.slice().reverse()

  return (
    <div id="cost-content">
      {scopeNote}
      {/* Mode toggle */}
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Pricing model</span>
        <div style="display:flex;gap:4px">
          <button
            class={'tab-mini' + (mode === 'token' ? ' active' : '')}
            onClick={() => setMode('token')}
            title="Token-based AI Credits billing, effective Jun 1, 2026"
          >Token-based (from Jun 1, 2026)</button>
          <button
            class={'tab-mini' + (mode === 'request' ? ' active' : '')}
            onClick={() => setMode('request')}
            title="Request-based billing with model multipliers, active before Jun 1, 2026"
          >Request-based (pre-Jun 1, 2026)</button>
        </div>
      </div>

      {/* Per-session cost bar chart */}
      <h3 style="margin:0 0 8px;font-size:13px;color:var(--muted)">ESTIMATED COST PER SESSION</h3>
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)">
        <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#00EAFF;vertical-align:middle;margin-right:3px" />Copilot</span>
        <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#FFB085;vertical-align:middle;margin-right:3px" />Claude</span>
        <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#F0FF42;vertical-align:middle;margin-right:3px" />Codex</span>
      </div>
      <CostBarChart sessions={copilotSessions} mode={mode} />

      {/* Per-turn cumulative cost chart */}
      <h3 style="margin:24px 0 8px;font-size:13px;color:var(--muted)">COST OVER TURNS</h3>
      <div style="font-size:10px;color:var(--muted);margin-bottom:6px">
        {mode === 'token'
          ? 'Cumulative cost per LLM call. Cache tokens included in session totals below but not per-turn (not separately tracked in telemetry).'
          : 'Cumulative cost per LLM call at multiplier × $0.04/request.'}
      </div>
      <CostGrowthChart sessions={copilotSessions} mode={mode} />

      {/* Session cost table */}
      <h3 style="margin:24px 0 8px;font-size:13px;color:var(--muted)">SESSION COST TABLE</h3>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <thead>
            <tr style="border-bottom:1px solid var(--vscode-panel-border);color:var(--muted);text-align:left">
              <th style="padding:4px 8px">#</th>
              <th style="padding:4px 8px">Agent</th>
              <th style="padding:4px 8px">Model</th>
              <th style="padding:4px 8px;text-align:right">Turns</th>
              <th style="padding:4px 8px;text-align:right">Input tok</th>
              <th style="padding:4px 8px;text-align:right">Output tok</th>
              <th style="padding:4px 8px;text-align:right">Cache read</th>
              <th style="padding:4px 8px;text-align:right">Est. cost</th>
              {mode === 'token' && <th style="padding:4px 8px;text-align:right" data-tip="Copilot AI Credits (1 credit = $0.01)">Credits</th>}
            </tr>
          </thead>
          <tbody>
            {sessionRows.map(({ session: s, cost }) => {
              const num = getSessionGlobalNumber(s)
              const rawInput = Math.max(0, s.inputTokens - s.cacheReadTokens - s.cacheCreateTokens)
              return (
                <tr key={s.sessionId} style="border-bottom:1px solid var(--vscode-panel-border)">
                  <td style="padding:4px 8px;color:var(--muted)">{num}</td>
                  <td style="padding:4px 8px">
                    <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;background:' + getAgentColor(s.source) + ';margin-right:5px;vertical-align:middle'} />
                    {getAgentSourceLabel(s.source)}
                  </td>
                  <td style="padding:4px 8px;color:var(--muted);font-size:10px">{s.model || '—'}</td>
                  <td style="padding:4px 8px;text-align:right">{s.turns}</td>
                  <td style="padding:4px 8px;text-align:right">{formatCompact(rawInput)}</td>
                  <td style="padding:4px 8px;text-align:right">{formatCompact(s.outputTokens)}</td>
                  <td style="padding:4px 8px;text-align:right">{s.cacheReadTokens > 0 ? formatCompact(s.cacheReadTokens) : '—'}</td>
                  <td style="padding:4px 8px;text-align:right;font-weight:600">
                    {cost.modelUnknown
                      ? <span style="color:var(--muted)" data-tip={'Model "' + s.model + '" not in rate table — add rates in pricing.ts'}>~$?</span>
                      : fmtUsd(cost.totalUsd)}
                  </td>
                  {mode === 'token' && (
                    <td style="padding:4px 8px;text-align:right;color:var(--muted)">
                      {cost.modelUnknown ? '?' : fmtCredits(cost.aiCredits)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid var(--vscode-panel-border);font-weight:600">
              <td colSpan={7} style="padding:6px 8px;text-align:right;color:var(--muted)">Total ({copilotSessions.length} Copilot session{copilotSessions.length !== 1 ? 's' : ''})</td>
              <td style="padding:6px 8px;text-align:right">{anyUnknown ? '~' : ''}{fmtUsd(totalUsd)}</td>
              {mode === 'token' && <td style="padding:6px 8px;text-align:right;color:var(--muted)">{anyUnknown ? '~' : ''}{fmtCredits(totalCredits)}</td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer note */}
      <div style="margin-top:16px;font-size:10px;color:var(--muted);line-height:1.6">
        Rates as of {PRICING_LAST_UPDATED} ·{' '}
        {anyUnknown && <span style="color:var(--warning,#ffb74d)">⚠ Some models not in rate table (shown as ~$?) · </span>}
        {mode === 'token'
          ? 'Token-based AI Credits: effective Jun 1, 2026. Per-turn chart uses input+output only; session totals include cache tokens.'
          : 'Request-based: active before Jun 1, 2026. Cost = multiplier × $0.04 per LLM call. Models marked 0× (e.g. GPT-4.1) are free under this model.'}
      </div>
    </div>
  )
}
