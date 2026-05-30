import { useState } from 'preact/hooks'
import { useEffect, useRef } from 'preact/hooks'
import { displaySessions, dailyStats, lifetimeStats, selectedAgentFilter } from '../state'
import { getAgentColor, getSessionGlobalNumber, formatCompact, getAgentSourceLabel } from '../utils'
import { calcSessionCost } from '../sessionMetrics'
import { PRICING_LAST_UPDATED } from '../pricing'
import type { PricingMode } from '../sessionMetrics'
import type { SessionSummaryCard, DailyStatRow } from '../types'

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

function sessionCostMode(session: SessionSummaryCard, mode: PricingMode): PricingMode {
  // Codex and Claude Code are always token-based; the mode toggle only applies to Copilot
  return (session.source === 'codex' || session.source === 'claude_code') ? 'token' : mode
}

// ── 30-day history chart (SVG) ────────────────────────────────────────────────

function HistoryChart({ rows }: { rows: DailyStatRow[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (rows.length === 0) {
    return <div class="empty-state" style="margin-bottom:16px">No historical data yet — sessions will appear here as they are recorded.</div>
  }

  const W = 600, H = 180
  const pad = { top: 12, right: 48, bottom: 28, left: 52 }
  const chartW = W - pad.left - pad.right
  const chartH = H - pad.top - pad.bottom

  const maxTokens = Math.max(...rows.map(r => r.totalTokens + r.cacheReadTokens + r.cacheCreateTokens), 1)
  const maxCost   = Math.max(...rows.map(r => r.costUsd), 0.001)

  const barW = Math.max(4, Math.floor(chartW / rows.length) - 2)
  const gap  = Math.max(1, Math.floor((chartW - barW * rows.length) / (rows.length + 1)))
  const startX = pad.left + gap

  // Y-axis gridlines: 4 lines
  const gridLines = [0, 1, 2, 3, 4].map(i => ({
    y: pad.top + chartH * (1 - i / 4),
    label: formatCompact(Math.round(maxTokens * i / 4)),
  }))

  const costPoints = rows.map((r, i) => {
    const cx = startX + i * (barW + gap) + barW / 2
    const cy = r.costUsd > 0
      ? pad.top + chartH * (1 - r.costUsd / maxCost)
      : pad.top + chartH
    return `${cx},${cy}`
  })

  const hovRow = hovered !== null ? rows[hovered] : null

  return (
    <div style="position:relative;margin-bottom:8px">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style="width:100%;height:180px;display:block"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid */}
        {gridLines.map(gl => (
          <g key={gl.y}>
            <line x1={pad.left} y1={gl.y} x2={W - pad.right} y2={gl.y} stroke="var(--vscode-panel-border,#333)" stroke-width="0.5" />
            <text x={pad.left - 4} y={gl.y} text-anchor="end" dominant-baseline="middle" fill="var(--vscode-descriptionForeground,#888)" font-size="9">{gl.label}</text>
          </g>
        ))}

        {/* Cost axis labels (right side) */}
        {[0, 1, 2, 3, 4].map(i => (
          <text key={i} x={W - pad.right + 4} y={pad.top + chartH * (1 - i / 4)} text-anchor="start" dominant-baseline="middle" fill="var(--vscode-descriptionForeground,#888)" font-size="9">
            {'$' + (maxCost * i / 4).toFixed(maxCost < 0.1 ? 3 : 2)}
          </text>
        ))}

        {/* Stacked bars */}
        {rows.map((r, i) => {
          const x = startX + i * (barW + gap)
          // Stack: inputOnly (bottom), cacheRead, cacheCreate, output (top)
          const inputOnlyH  = ((r.totalTokens - r.outputTokens) / maxTokens) * chartH
          const cacheReadH  = (r.cacheReadTokens   / maxTokens) * chartH
          const cacheCreateH= (r.cacheCreateTokens / maxTokens) * chartH
          const outputH     = (r.outputTokens       / maxTokens) * chartH

          let yBase = pad.top + chartH
          const bars: Array<{ fill: string; height: number }> = [
            { fill: 'var(--vscode-charts-blue,#4fc3f7)',   height: Math.max(0, inputOnlyH) },
            { fill: 'var(--vscode-charts-green,#81c784)',  height: Math.max(0, cacheReadH) },
            { fill: 'var(--vscode-charts-yellow,#ffb74d)', height: Math.max(0, cacheCreateH) },
            { fill: 'var(--vscode-charts-red,#e57373)',    height: Math.max(0, outputH) },
          ]

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} style="cursor:default">
              {bars.map((bar, bi) => {
                if (bar.height < 0.5) return null
                yBase -= bar.height
                return <rect key={bi} x={x} y={yBase} width={barW} height={bar.height} fill={bar.fill} opacity={hovered === i ? 1 : 0.85} />
              })}
              {/* X-axis label: abbreviated day */}
              <text x={x + barW / 2} y={H - pad.bottom + 10} text-anchor="middle" fill="var(--vscode-descriptionForeground,#888)" font-size="8">
                {r.day.slice(5)}
              </text>
            </g>
          )
        })}

        {/* Cost line overlay */}
        {rows.length > 1 && (
          <polyline
            points={costPoints.join(' ')}
            fill="none"
            stroke="var(--vscode-charts-purple,#ba68c8)"
            stroke-width="1.5"
            stroke-dasharray="3 2"
            opacity="0.9"
          />
        )}
        {rows.map((r, i) => {
          if (r.costUsd === 0) return null
          const cx = startX + i * (barW + gap) + barW / 2
          const cy = pad.top + chartH * (1 - r.costUsd / maxCost)
          return <circle key={i} cx={cx} cy={cy} r="2.5" fill="var(--vscode-charts-purple,#ba68c8)" />
        })}
      </svg>

      {/* Legend */}
      <div style="display:flex;gap:12px;font-size:10px;color:var(--muted);margin-top:2px;flex-wrap:wrap">
        {[
          ['var(--vscode-charts-blue,#4fc3f7)',   'Input tok'],
          ['var(--vscode-charts-green,#81c784)',  'Cache read'],
          ['var(--vscode-charts-yellow,#ffb74d)', 'Cache write'],
          ['var(--vscode-charts-red,#e57373)',    'Output tok'],
          ['var(--vscode-charts-purple,#ba68c8)', 'Cost (dashed line)'],
        ].map(([color, label]) => (
          <span key={label} style="display:flex;align-items:center;gap:4px">
            <span style={`display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Hover tooltip */}
      {hovRow && (
        <div style="position:absolute;top:4px;right:4px;background:var(--vscode-editorWidget-background,#252526);border:1px solid var(--vscode-panel-border,#333);border-radius:4px;padding:8px 10px;font-size:11px;line-height:1.8;pointer-events:none;z-index:10;min-width:150px">
          <div style="font-weight:600;margin-bottom:2px">{hovRow.day}</div>
          <div style="color:var(--muted)">{hovRow.sessionCount} session{hovRow.sessionCount !== 1 ? 's' : ''}</div>
          <div>Input: <strong>{formatCompact(hovRow.totalTokens)}</strong></div>
          <div>Cache read: {formatCompact(hovRow.cacheReadTokens)}</div>
          <div>Cache write: {formatCompact(hovRow.cacheCreateTokens)}</div>
          <div>Output: {formatCompact(hovRow.outputTokens)}</div>
          <div style="margin-top:4px;color:var(--vscode-charts-purple,#ba68c8)">Cost: <strong>{'$' + (hovRow.costUsd).toFixed(3)}</strong></div>
        </div>
      )}
    </div>
  )
}

// ── Per-session cost bar chart ─────────────────────────────────────────────────

function CostBarChart({ sessions, mode }: { sessions: SessionSummaryCard[]; mode: PricingMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const data = sessions.map((sess, idx) => {
      const cost = calcSessionCost(sess, sessionCostMode(sess, mode))
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
      const color = d.unknown ? '#666' : getAgentColor(d.source)
      if (barH < 1) {
        // Zero-cost: draw a tick on the x-axis instead of an invisible bar
        ctx.strokeStyle = color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x, pad.top + chartH); ctx.lineTo(x + barW, pad.top + chartH); ctx.stroke()
      } else {
        ctx.fillStyle = color
        ctx.fillRect(x, y, barW, barH)
      }
      ctx.fillStyle = textColor; ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(String(d.session), x + barW / 2, pad.top + chartH + 4)
      if (d.unknown) {
        ctx.fillStyle = '#999'; ctx.textBaseline = 'bottom'
        ctx.fillText('?', x + barW / 2, pad.top + chartH - 3)
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



// ── Main tab ──────────────────────────────────────────────────────────────────

export function Cost() {
  const sessions = displaySessions.value
  const [mode, setMode] = useState<PricingMode>('token')

  const copilotSessions = sessions.filter(s => s.source === 'copilot')
  const codexSessions = sessions.filter(s => s.source === 'codex')
  const claudeSessions = sessions.filter(s => s.source === 'claude_code')
  const pricedSessions = sessions.filter(s => s.source === 'copilot' || s.source === 'codex' || s.source === 'claude_code')

  const disclaimer = (
    <div style="font-size:11px;background:var(--hover);border:1px solid var(--border);border-left:3px solid var(--warning,#ffb74d);border-radius:4px;padding:8px 10px;margin-bottom:16px;line-height:1.6;color:var(--muted);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <span><strong style="color:var(--foreground)">Estimates only</strong> — not your actual bill. <a href="#cost-known-gaps" style="color:inherit;text-decoration:underline;text-underline-offset:2px">See known gaps.</a></span>
      <span style="white-space:nowrap">Rates last updated: {PRICING_LAST_UPDATED}</span>
    </div>
  )

  if (pricedSessions.length === 0) {
    return (
      <div id="cost-content">
        {disclaimer}
        <div class="empty-state">No Copilot, Claude, or Codex sessions recorded — start a session to see cost estimates</div>
      </div>
    )
  }

  const copilotCosts = copilotSessions.map(s => ({ session: s, cost: calcSessionCost(s, mode) }))
  const codexCosts = codexSessions.map(s => ({ session: s, cost: calcSessionCost(s, 'token') }))
  const claudeCosts = claudeSessions.map(s => ({ session: s, cost: calcSessionCost(s, 'token') }))
  const allCosts = pricedSessions.map(s => ({ session: s, cost: calcSessionCost(s, sessionCostMode(s, mode)) }))

  const copilotTotalUsd = copilotCosts.reduce((sum, c) => sum + c.cost.totalUsd, 0)
  const copilotTotalCredits = copilotTotalUsd / 0.01
  const copilotAnyUnknown = copilotCosts.some(c => c.cost.modelUnknown)
  const codexTotalUsd = codexCosts.reduce((sum, c) => sum + c.cost.totalUsd, 0)
  const codexAnyUnknown = codexCosts.some(c => c.cost.modelUnknown)
  const claudeTotalUsd = claudeCosts.reduce((sum, c) => sum + c.cost.totalUsd, 0)
  const claudeAnyUnknown = claudeCosts.some(c => c.cost.modelUnknown)

  const sessionRows = allCosts.slice().sort((a, b) => {
    const na = getSessionGlobalNumber(a.session) ?? 0
    const nb = getSessionGlobalNumber(b.session) ?? 0
    return nb - na
  })

  const showCreditsCol = mode === 'token'

  return (
    <div id="cost-content">
      {disclaimer}
      {/* Pricing model labels */}
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
        {copilotSessions.length > 0 && (<>
          <span style="font-size:11px;color:var(--muted)">
            <span style={'display:inline-block;width:7px;height:7px;border-radius:50%;background:' + getAgentColor('copilot') + ';vertical-align:middle;margin-right:5px'} />
            Copilot — Select pricing model
          </span>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
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
            <button
              class={'tab-mini' + (mode === 'request-annual' ? ' active' : '')}
              onClick={() => setMode('request-annual')}
              title="Annual plan holders staying on request billing after Jun 1, 2026 face significantly higher multipliers"
            >Annual plan request-based (post-Jun 1, 2026)</button>
          </div>
        </>)}
        {codexSessions.length > 0 && (
          <span style="font-size:11px;color:var(--muted)">
            <span style={'display:inline-block;width:7px;height:7px;border-radius:50%;background:' + getAgentColor('codex') + ';vertical-align:middle;margin-right:5px'} />
            Codex — Always uses token-based pricing
          </span>
        )}
        {claudeSessions.length > 0 && (
          <span style="font-size:11px;color:var(--muted)">
            <span style={'display:inline-block;width:7px;height:7px;border-radius:50%;background:' + getAgentColor('claude_code') + ';vertical-align:middle;margin-right:5px'} />
            Claude — Always uses token-based pricing
          </span>
        )}
      </div>

      {/* 30-day history */}
      {(() => {
        const stats = dailyStats.value
        const lifetime = lifetimeStats.value
        const agentFilter = selectedAgentFilter.value
        const filteredStats = agentFilter !== 'all'
          ? stats  // dailyStats already filtered server-side when filter active; show as-is
          : stats
        return (
          <div style="margin-bottom:24px">
            <h3 style="margin:0 0 8px;font-size:13px;color:var(--muted)">30-DAY TOKEN &amp; COST HISTORY</h3>
            <HistoryChart rows={filteredStats} />
            {lifetime && lifetime.totalSessions > 0 && (
              <div style="display:flex;gap:20px;font-size:11px;color:var(--muted);flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px solid var(--vscode-panel-border)">
                <span>{lifetime.totalSessions} total sessions</span>
                <span>{formatCompact(lifetime.totalTokens)} total tokens</span>
                <span style="color:var(--foreground)">~{'$' + lifetime.totalCostUsd.toFixed(2)} estimated lifetime cost</span>
                {lifetime.oldestSessionMs > 0 && (
                  <span>{new Date(lifetime.oldestSessionMs).toISOString().slice(0, 10)} → {new Date(lifetime.newestSessionMs).toISOString().slice(0, 10)}</span>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* Per-session cost bar chart */}
      <h3 style="margin:0 0 8px;font-size:13px;color:var(--muted)">ESTIMATED COST PER SESSION</h3>
      <CostBarChart sessions={pricedSessions} mode={mode} />

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
              {showCreditsCol && <th style="padding:4px 8px;text-align:right" data-tip="Copilot AI Credits (1 credit = $0.01); not applicable to Codex">AI Credits</th>}
            </tr>
          </thead>
          <tbody>
            {sessionRows.map(({ session: s, cost }) => {
              const num = getSessionGlobalNumber(s)
              const rawInput = Math.max(0, s.inputTokens - s.cacheReadTokens - s.cacheCreateTokens)
              const isCopilot = s.source === 'copilot'
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
                  {showCreditsCol && (
                    <td style="padding:4px 8px;text-align:right;color:var(--muted)">
                      {!isCopilot ? '—' : cost.modelUnknown ? '?' : fmtCredits(cost.aiCredits)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            {copilotSessions.length > 0 && (
              <tr style="border-top:1px solid var(--vscode-panel-border)">
                <td colSpan={7} style="padding:5px 8px;text-align:right;color:var(--muted);font-size:10px">
                  Copilot ({copilotSessions.length} session{copilotSessions.length !== 1 ? 's' : ''})
                </td>
                <td style="padding:5px 8px;text-align:right;font-weight:600">{copilotAnyUnknown ? '~' : ''}{fmtUsd(copilotTotalUsd)}</td>
                {showCreditsCol && <td style="padding:5px 8px;text-align:right;color:var(--muted)">{copilotAnyUnknown ? '~' : ''}{fmtCredits(copilotTotalCredits)}</td>}
              </tr>
            )}
            {codexSessions.length > 0 && (
              <tr style="border-top:1px solid var(--vscode-panel-border)">
                <td colSpan={7} style="padding:5px 8px;text-align:right;color:var(--muted);font-size:10px">
                  Codex ({codexSessions.length} session{codexSessions.length !== 1 ? 's' : ''})
                </td>
                <td style="padding:5px 8px;text-align:right;font-weight:600">{codexAnyUnknown ? '~' : ''}{fmtUsd(codexTotalUsd)}</td>
                {showCreditsCol && <td style="padding:5px 8px;text-align:right;color:var(--muted)">—</td>}
              </tr>
            )}
            {claudeSessions.length > 0 && (
              <tr style="border-top:1px solid var(--vscode-panel-border)">
                <td colSpan={7} style="padding:5px 8px;text-align:right;color:var(--muted);font-size:10px">
                  Claude ({claudeSessions.length} session{claudeSessions.length !== 1 ? 's' : ''})
                </td>
                <td style="padding:5px 8px;text-align:right;font-weight:600">{claudeAnyUnknown ? '~' : ''}{fmtUsd(claudeTotalUsd)}</td>
                {showCreditsCol && <td style="padding:5px 8px;text-align:right;color:var(--muted)">—</td>}
              </tr>
            )}
            {[copilotSessions, codexSessions, claudeSessions].filter(s => s.length > 0).length > 1 && (
              <tr style="border-top:2px solid var(--vscode-panel-border);font-weight:600">
                <td colSpan={7} style="padding:6px 8px;text-align:right;color:var(--muted)">
                  Total ({pricedSessions.length} session{pricedSessions.length !== 1 ? 's' : ''})
                </td>
                <td style="padding:6px 8px;text-align:right">{(copilotAnyUnknown || codexAnyUnknown || claudeAnyUnknown) ? '~' : ''}{fmtUsd(copilotTotalUsd + codexTotalUsd + claudeTotalUsd)}</td>
                {showCreditsCol && <td style="padding:6px 8px;text-align:right;color:var(--muted)">—</td>}
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Footer note */}
      <div style="margin-top:16px;font-size:10px;color:var(--muted);line-height:1.6">
        {mode === 'token'
          ? 'Token-based AI Credits: effective Jun 1, 2026. Per-turn chart uses input+output only; session totals include cache tokens.'
          : mode === 'request'
            ? 'Request-based: active before Jun 1, 2026. Cost = multiplier × $0.04 per user prompt. Models marked 0× (e.g. GPT-4.1) are free under this model.'
            : 'Annual plan request-based: for annual-plan holders staying on old billing after Jun 1, 2026. Multipliers are significantly higher on this plan post-June.'}
        {codexSessions.length > 0 && ' Codex sessions use token-based pricing regardless of the Copilot billing model selected above.'}
        {claudeSessions.length > 0 && ' Claude sessions use Anthropic API token-based pricing regardless of the Copilot billing model selected above.'}
      </div>

      {/* Known gaps */}
      <div id="cost-known-gaps" style="margin-top:24px;padding-top:16px;border-top:1px solid var(--vscode-panel-border);font-size:11px;color:var(--muted);line-height:1.7">
        <strong style="color:var(--foreground);font-size:12px">Known gaps</strong>
        <div style="margin-top:8px">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:.4px">
            <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;background:' + getAgentColor('copilot') + ';vertical-align:middle;margin-right:4px'} />
            Copilot
          </span>
          <ul style="margin:4px 0 0;padding-left:18px">
            <li>Long-context surcharges are not applied — GPT-5.4 (prompts &gt;272K tokens) and Gemini 2.5 Pro / 3.1 Pro (prompts &gt;200K tokens) have higher rates above those thresholds, which require per-prompt token counts not available in session telemetry.</li>
            <li>Models not in the rate table are shown as <strong>~$?</strong> — this can happen when GitHub releases a new model after the last rate update, or when the model ID in telemetry doesn't match the published name.</li>
            <li>Request-based cost uses session turn count as a proxy for billable prompts, which may not match exactly for all session shapes.</li>
          </ul>
        </div>
        <div style="margin-top:12px">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:.4px">
            <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;background:' + getAgentColor('codex') + ';vertical-align:middle;margin-right:4px'} />
            Codex
          </span>
          <ul style="margin:4px 0 0;padding-left:18px">
            <li>Long-context surcharges are not applied — GPT-5.5 has a higher-rate tier above an unconfirmed token threshold.</li>
            <li>Reasoning tokens (<code>codex.usage.reasoning_output_tokens</code>) are included in output token counts and billed at the standard output rate. A separate reasoning rate has not been confirmed from official sources.</li>
            <li>Models not in the rate table are shown as <strong>~$?</strong>. The official Codex rate card (<code>help.openai.com</code>) may list additional model aliases not yet captured here.</li>
          </ul>
        </div>
        <div style="margin-top:12px">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:.4px">
            <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;background:' + getAgentColor('claude_code') + ';vertical-align:middle;margin-right:4px'} />
            Claude
          </span>
          <ul style="margin:4px 0 0;padding-left:18px">
            <li>Cache write TTL cannot be determined from telemetry. Claude Code uses 5-minute prompt caches by default (1.25× input rate); if 1-hour caches are active (2× input rate), cost will be underestimated by ~37%.</li>
            <li>Fast mode (<code>/fast</code>): Opus fast-mode requests are billed at $30 input / $150 output per MTok — 6× the standard Opus rate. The model ID in telemetry does not indicate fast mode, so fast-mode sessions are costed at the standard Opus rate and will be significantly underestimated.</li>
            <li>Opus 4.7 tokenizer change (from Apr 16, 2026) generates up to 35% more tokens for the same text. Per-token prices are unchanged; sessions before and after this date are not directly cost-comparable.</li>
            <li>Models not in the rate table are shown as <strong>~$?</strong>. Older Claude models (claude-3-5-sonnet, claude-3-opus, etc.) may appear in imported historical sessions.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
