import { displaySpans, displaySessions, COLORS } from '../state'
import { nanoToMs, formatMs, getAgentColor, getAgentSourceLabel, inferSpanSource } from '../utils'
import type { Span, SessionSummaryCard } from '../types'

function getInputTokenCount(span: Span | undefined): number {
  let input = 0
  ;(span?.attributes ?? []).forEach(a => {
    if (/input.?tokens|prompt.?tokens/i.test(a.key))
      input = parseInt(String(a.value.intValue ?? a.value.stringValue ?? a.value.doubleValue)) || 0
  })
  return input
}

function getOutputTokenCount(span: Span | undefined): number {
  let output = 0
  ;(span?.attributes ?? []).forEach(a => {
    if (/output.?tokens|completion.?tokens/i.test(a.key))
      output = parseInt(String(a.value.intValue ?? a.value.stringValue ?? a.value.doubleValue)) || 0
  })
  return output
}

export function Tools() {
  const spans = displaySpans.value
  const sessions = displaySessions.value

  const traceSourceMap: Record<string, string> = {}
  sessions.forEach((sess: SessionSummaryCard) => { if (sess.traceId && sess.source) traceSourceMap[sess.traceId] = sess.source })

  const counts: Record<string, number> = {}
  const toolTokens: Record<string, { input: number; output: number }> = {}
  const toolDurations: Record<string, number[]> = {}
  const toolErrors: Record<string, number> = {}
  const toolAgents: Record<string, Record<string, boolean>> = {}

  spans.forEach(s => {
    if (s.name?.includes('tool')) {
      const name = s.name
      counts[name] = (counts[name] ?? 0) + 1
      if (!toolTokens[name]) toolTokens[name] = { input: 0, output: 0 }
      toolTokens[name].input += getInputTokenCount(s)
      toolTokens[name].output += getOutputTokenCount(s)
      if (!toolDurations[name]) toolDurations[name] = []
      const dur = nanoToMs(s.endTime) - nanoToMs(s.startTime)
      if (dur > 0) toolDurations[name].push(dur)
      if (s.status?.code === 2) toolErrors[name] = (toolErrors[name] ?? 0) + 1
      const src = (s.traceId && traceSourceMap[s.traceId]) || inferSpanSource(s) || null
      if (src) { if (!toolAgents[name]) toolAgents[name] = {}; toolAgents[name][src] = true }
    }
  })

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])

  if (entries.length === 0) {
    return <div id="tools-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  const total = entries.reduce((sum, e) => sum + e[1], 0)
  const _totalErrors = entries.reduce((s, e) => s + (toolErrors[e[0]] ?? 0), 0)
  const _failedTools = entries.filter(e => (toolErrors[e[0]] ?? 0) > 0)
  const _mostUsed = entries[0]
  const mostTokens = entries.slice().sort((a, b) => {
    const tA = toolTokens[a[0]] ? toolTokens[a[0]].input + toolTokens[a[0]].output : 0
    const tB = toolTokens[b[0]] ? toolTokens[b[0]].input + toolTokens[b[0]].output : 0
    return tB - tA
  })[0]
  const _mostTokVal = mostTokens && toolTokens[mostTokens[0]] ? toolTokens[mostTokens[0]].input + toolTokens[mostTokens[0]].output : 0

  // SVG donut
  const r = 80, cx = 100, cy = 100, sw = 30
  const angleOffset = -Math.PI / 2
  let currentAngle = angleOffset

  function arcPath(startAngle: number, endAngle: number): string {
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const slices = entries.map((e, i) => {
    const pct = e[1] / total
    const sliceAngle = pct * 2 * Math.PI
    const color = COLORS[i % COLORS.length]
    const startA = currentAngle
    currentAngle += sliceAngle
    return { name: e[0], count: e[1], pct, color, startA, endA: currentAngle }
  })

  let grandErrors = 0

  return (
    <div id="tools-content">
      <h3 style="margin:0 0 16px;font-size:13px;color:var(--muted)">TOOL CALL DISTRIBUTION</h3>


      <div class="donut-container">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map(sl =>
            sl.pct >= 1
              ? <circle key={sl.name} cx={cx} cy={cy} r={r} fill="none" stroke={sl.color} stroke-width={sw} />
              : <path key={sl.name} d={arcPath(sl.startA, sl.endA)} fill="none" stroke={sl.color} stroke-width={sw} stroke-linecap="butt" />
          )}
          <text x={cx} y={cy} text-anchor="middle" dy="4" font-size="18" font-weight="bold" fill="var(--fg)">{total}</text>
          <text x={cx} y={cy + 16} text-anchor="middle" font-size="10" fill="var(--muted)" opacity="0.7">total</text>
        </svg>
        <div class="donut-legend">
          {slices.map(sl => (
            <div key={sl.name} class="donut-legend-item">
              <div class="donut-legend-color" style={'background:' + sl.color} />
              <span>{sl.name} ({sl.count}, {(sl.pct * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>

      <h3 style="margin:24px 0 12px;font-size:13px;color:var(--muted)">TOOL TOKEN USAGE &amp; PERFORMANCE</h3>
      <table class="tool-insights-table">
        <thead>
          <tr>
            <th>Tool</th><th>Calls</th><th>Errors</th><th>Avg Duration</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, callCount]) => {
            const durations = toolDurations[name] ?? []
            const errCount = toolErrors[name] ?? 0
            grandErrors += errCount
            const avgDur = durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : 0
            const agents = toolAgents[name] ? Object.keys(toolAgents[name]) : []
            return (
              <tr key={name}>
                <td>
                  {agents.map(a => (
                    <span key={a} style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + getAgentColor(a) + ';vertical-align:middle;margin-right:4px'} title={getAgentSourceLabel(a)} />
                  ))}
                  {name}
                </td>
                <td class="right">{callCount}</td>
                <td style={'text-align:right' + (errCount > 0 ? ';color:var(--error)' : '')}>{errCount}</td>
                <td class="right">{avgDur > 0 ? formatMs(avgDur) : '—'}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total</strong></td>
            <td class="right"><strong>{total}</strong></td>
            <td style={'text-align:right' + (grandErrors > 0 ? ';color:var(--error)' : '')}><strong>{grandErrors}</strong></td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
