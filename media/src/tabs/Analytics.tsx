import { useState } from 'preact/hooks'
import {
  filteredSessions, sessionSummary, agentFilteredSessions, rangedSessions,
  sessionTimelines,
  CHART_MAX, vscode,
} from '../state'
import { getAgentColor, getAgentSourceLabel, formatMs, formatCompact } from '../utils'
import { calcSessionCost } from '../sessionMetrics'
import type { SessionSummaryCard } from '../types'
import type { PricingMode } from '../sessionMetrics'
import { PRICING_LAST_UPDATED } from '../pricing'

import { ContextGrowthChart, SessionTokenChart } from './SessionCharts'
import { CostBarChart, fmtUsd } from './Cost'
import { computeStats } from './Agents'

// ── Section heading helper ────────────────────────────────────────────────────

function SectionHead({ title, tip }: { title: string; tip?: string }) {
  return (
    <h3
      class={tip ? 'has-metric-tip' : undefined}
      style="margin:16px 0 6px;font-size:12px;color:var(--muted)"
      data-tip={tip}
    >{title}</h3>
  )
}

// ── Agent breakdown cards ─────────────────────────────────────────────────────

function AgentCard({ source, sessions }: { source: string; sessions: SessionSummaryCard[] }) {
  const s = computeStats(sessions)
  if (s.sessions === 0) return null
  const color = getAgentColor(source)
  const label = getAgentSourceLabel(source)
  const topTools = Object.entries(s.toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)
  return (
    <div style={`background:var(--card-bg);border:1px solid var(--border);border-left:3px solid ${color};border-radius:6px;padding:12px 14px;flex:1;min-width:180px`}>
      <div style={`display:flex;align-items:center;gap:6px;margin-bottom:10px`}>
        <span style={`display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}`} />
        <span style="font-weight:600;font-size:13px">{label}</span>
        <span style="font-size:11px;color:var(--muted);margin-left:auto">{s.sessions} session{s.sessions !== 1 ? 's' : ''}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
        <div><span style="color:var(--muted)">LLM calls</span> <strong>{s.totalLlm}</strong></div>
        <div><span style="color:var(--muted)">Tool calls</span> <strong>{s.totalTools}</strong></div>
        <div><span style="color:var(--muted)">Input tokens</span> <strong>{formatCompact(s.totalInput)}</strong></div>
        <div><span style="color:var(--muted)">Output tokens</span> <strong>{formatCompact(s.totalOutput)}</strong></div>
        <div><span style="color:var(--muted)">Cache hit</span> <strong>{(s.cacheHitRate * 100).toFixed(0)}%</strong></div>
        <div><span style="color:var(--muted)">Avg dur</span> <strong>{formatMs(s.avgDuration)}</strong></div>
        {s.avgTtft > 0 && <div><span style="color:var(--muted)">Avg TTFT</span> <strong>{formatMs(s.avgTtft)}</strong></div>}
      </div>
      {topTools.length > 0 && (
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-size:10px;color:var(--muted)">
          <div style="margin-bottom:3px;text-transform:uppercase;letter-spacing:.3px">Top tools</div>
          {topTools.map(([t, n]) => (
            <div key={t} style="display:flex;justify-content:space-between;margin-bottom:1px">
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px">{t}</span>
              <span style="color:var(--fg);margin-left:6px;flex-shrink:0">{n}×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Analytics component ──────────────────────────────────────────────────

export function Analytics() {
  const [mode, setMode] = useState<PricingMode>('token')
  const sessions = filteredSessions.value
  const allFiltered = agentFilteredSessions.value
  const timelines = sessionTimelines.value
  const hasAny = (sessionSummary.value?.sessions?.length ?? 0) > 0

  if (sessions.length === 0) {
    return (
      <div id="analytics-content">
        <div class="empty-state">{hasAny ? 'No sessions match the active filters.' : 'No sessions recorded yet.'}</div>
      </div>
    )
  }

  const pricedSess = sessions.filter(s => s.source === 'copilot' || s.source === 'codex' || s.source === 'claude_code')
  const copilotSess = sessions.filter(s => s.source === 'copilot')
  const claudeSess  = sessions.filter(s => s.source === 'claude_code')
  const codexSess   = sessions.filter(s => s.source === 'codex')

  // Charts always use time-ordered (newest-first) sessions so internal .reverse() gives oldest-first.
  // filteredSessions may be sorted by cost/model/etc — that's only for the Sessions table.
  const timeOrdered = rangedSessions.value
  const pricedChartSess = timeOrdered.filter(s => s.source === 'copilot' || s.source === 'codex' || s.source === 'claude_code')

  // rangedSessions: time-range + agent filtered, with correct in-memory fallback while DB results load
  const chartSessions = timeOrdered.slice().reverse()

  // Load timelines for context growth chart
  chartSessions.slice(0, CHART_MAX).forEach(sess => {
    if (!sessionTimelines.value[sess.sessionId] && vscode) {
      vscode.postMessage({ type: 'loadSessionDetail', sessionId: sess.sessionId })
    }
  })

  const disclaimer = (
    <div style="font-size:11px;background:var(--hover);border:1px solid var(--border);border-radius:4px;padding:6px 10px;margin-bottom:8px;color:var(--muted)">
      Estimates only — not your actual bill. Rates last updated: {PRICING_LAST_UPDATED}
    </div>
  )

  // Multi-dimensional cost table: day → agent
  interface AgentDay { source: string; input: number; output: number; cacheCreate: number; cacheRead: number; cost: number; models: Set<string> }
  interface DayEntry { input: number; output: number; cacheCreate: number; cacheRead: number; cost: number; agents: Map<string, AgentDay> }
  const dayMap = new Map<string, DayEntry>()
  pricedSess.forEach(sess => {
    const day = sess.startTime ? new Date(sess.startTime).toISOString().slice(0, 10) : 'unknown'
    const effMode: PricingMode = (sess.source === 'codex' || sess.source === 'claude_code') ? 'token' : mode
    const cost = calcSessionCost(sess, effMode).totalUsd
    if (!dayMap.has(day)) dayMap.set(day, { input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0, agents: new Map() })
    const de = dayMap.get(day)!
    de.input += sess.inputTokens; de.output += sess.outputTokens
    de.cacheCreate += sess.cacheCreateTokens ?? 0; de.cacheRead += sess.cacheReadTokens; de.cost += cost
    if (!de.agents.has(sess.source)) de.agents.set(sess.source, { source: sess.source, input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0, models: new Set() })
    const ae = de.agents.get(sess.source)!
    ae.input += sess.inputTokens; ae.output += sess.outputTokens
    ae.cacheCreate += sess.cacheCreateTokens ?? 0; ae.cacheRead += sess.cacheReadTokens; ae.cost += cost
    if (sess.model) ae.models.add(sess.model)
  })
  const dayRows = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const grand = dayRows.reduce((g, [, d]) => ({
    input: g.input + d.input, output: g.output + d.output,
    cacheCreate: g.cacheCreate + d.cacheCreate, cacheRead: g.cacheRead + d.cacheRead, cost: g.cost + d.cost,
  }), { input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0 })
  const fmtN = (n: number) => n.toLocaleString()

  return (
    <div id="analytics-content">

      {/* Estimated cost */}
      {pricedSess.length > 0 && (
        <>
          <SectionHead title="ESTIMATED COST" />
          {disclaimer}

          {copilotSess.length > 0 && (
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-bottom:8px">
              <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;background:' + getAgentColor('copilot')} />
              <span style="text-transform:uppercase;letter-spacing:.3px;font-size:10px">Copilot</span>
              <button
                class={'tab-mini' + (mode === 'token' ? ' active' : '')}
                onClick={() => setMode('token')}
              >Token-based</button>
              <button
                class={'tab-mini' + (mode === 'request-annual' ? ' active' : '')}
                onClick={() => setMode('request-annual')}
              >Annual request-based</button>
            </div>
          )}

          {/* Daily total legend above chart */}
          <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted);margin-bottom:6px">
            <svg width="16" height="8" viewBox="0 0 16 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="var(--vscode-charts-green,#81c784)" stroke-width="1.5" stroke-dasharray="4 2" />
            </svg>
            Daily total (right axis)
          </div>

          <CostBarChart sessions={pricedChartSess} mode={mode} />

          {/* Multi-dimensional cost table: date → agent, scrollable */}
          {dayRows.length > 0 && (
            <div style="overflow-x:auto;margin-bottom:8px">
              <table style="border-collapse:collapse;font-size:10px;min-width:100%;white-space:nowrap">
                <thead>
                  <tr style="border-bottom:1px solid var(--border)">
                    {(['Date','Agent','Model','Input','Output','Cache Create','Cache Read','Total Tokens','Cost (USD)'] as const).map(h => (
                      <th key={h} style={`padding:3px 8px 3px ${h==='Date'?'0':'6px'};color:var(--muted);font-weight:500;text-align:${['Input','Output','Cache Create','Cache Read','Total Tokens','Cost (USD)'].includes(h)?'right':'left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayRows.map(([day, d]) => {
                    const agents = [...d.agents.entries()].sort((a, b) => b[1].cost - a[1].cost)
                    const dayTotal = d.input + d.output + d.cacheCreate + d.cacheRead
                    return (
                      <>
                        {/* Day aggregate row */}
                        <tr key={day} style="border-bottom:1px solid var(--border);background:var(--hover)">
                          <td style="padding:3px 8px 3px 0;font-weight:600">{day}</td>
                          <td style="padding:3px 8px;color:var(--muted)">All</td>
                          <td style="padding:3px 8px" />
                          <td style="padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums">{fmtN(d.input)}</td>
                          <td style="padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums">{fmtN(d.output)}</td>
                          <td style="padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums">{fmtN(d.cacheCreate)}</td>
                          <td style="padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums">{fmtN(d.cacheRead)}</td>
                          <td style="padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums">{fmtN(dayTotal)}</td>
                          <td style="padding:3px 8px;text-align:right;color:var(--vscode-charts-green,#81c784);font-weight:600">{fmtUsd(d.cost)}</td>
                        </tr>
                        {/* Per-agent rows */}
                        {agents.map(([src, ae]) => {
                          const agentTotal = ae.input + ae.output + ae.cacheCreate + ae.cacheRead
                          const modelList = [...ae.models].join(', ') || '—'
                          return (
                            <tr key={day + src} style="border-bottom:1px solid var(--border)">
                              <td style="padding:3px 8px 3px 0" />
                              <td style="padding:3px 8px">
                                <span style={'display:inline-block;width:5px;height:5px;border-radius:50%;background:' + getAgentColor(src) + ';vertical-align:middle;margin-right:4px'} />
                                {getAgentSourceLabel(src)}
                              </td>
                              <td style="padding:3px 8px;color:var(--muted);font-family:monospace;font-size:9px">{modelList}</td>
                              <td style="padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums">{fmtN(ae.input)}</td>
                              <td style="padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums">{fmtN(ae.output)}</td>
                              <td style="padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums">{fmtN(ae.cacheCreate)}</td>
                              <td style="padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums">{fmtN(ae.cacheRead)}</td>
                              <td style="padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums">{fmtN(agentTotal)}</td>
                              <td style="padding:3px 8px;text-align:right;color:var(--vscode-charts-green,#81c784)">{fmtUsd(ae.cost)}</td>
                            </tr>
                          )
                        })}
                      </>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style="border-top:2px solid var(--border)">
                    <td style="padding:3px 8px 3px 0;font-weight:600">Total</td>
                    <td style="padding:3px 8px" />
                    <td style="padding:3px 8px" />
                    <td style="padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{fmtN(grand.input)}</td>
                    <td style="padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{fmtN(grand.output)}</td>
                    <td style="padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{fmtN(grand.cacheCreate)}</td>
                    <td style="padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{fmtN(grand.cacheRead)}</td>
                    <td style="padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{fmtN(grand.input+grand.output+grand.cacheCreate+grand.cacheRead)}</td>
                    <td style="padding:3px 8px;text-align:right;font-weight:600;color:var(--vscode-charts-green,#81c784)">{fmtUsd(grand.cost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {/* Agent breakdown */}
      {(copilotSess.length > 0 || claudeSess.length > 0 || codexSess.length > 0) && (
        <>
          <SectionHead title="AGENT BREAKDOWN" />
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            {copilotSess.length > 0 && <AgentCard source="copilot"    sessions={copilotSess} />}
            {claudeSess.length  > 0 && <AgentCard source="claude_code" sessions={claudeSess} />}
            {codexSess.length   > 0 && <AgentCard source="codex"      sessions={codexSess} />}
          </div>
        </>
      )}

      {/* Token usage per session */}
      <SectionHead title="TOKEN USAGE PER SESSION" />
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)">
        <span><span style="display:inline-block;width:10px;height:3px;background:#FFB74D;border-radius:1px;vertical-align:middle" /> Input tokens</span>
        <span><span style="display:inline-block;width:10px;height:3px;background:#81C784;border-radius:1px;vertical-align:middle" /> Output tokens</span>
      </div>
      {/* Always pass newest-first (rangedSessions); chart reverses internally to oldest-first */}
      <SessionTokenChart sessions={timeOrdered} />

      {/* Context growth — at the bottom */}
      <SectionHead title="CONTEXT GROWTH" />
      <ContextGrowthChart sessions={chartSessions.slice(0, CHART_MAX)} timelines={timelines} />

    </div>
  )
}
