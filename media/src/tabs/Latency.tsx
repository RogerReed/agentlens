import { useEffect, useRef } from 'preact/hooks'
import { displaySpans, displaySessions } from '../state'
import { nanoToMs, formatMs, formatCompact, getAgentDotHtml, isSessionSpan, getSessionGlobalNumber, getAgentColor } from '../utils'
import type { SessionSummaryCard } from '../types'

function TtftChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // Build per-session TTFT data, latest first
    const barData = sessions.map((sess, idx) => {
      const llmEntries = (sess.timeline ?? []).filter(e => e.type === 'llm' && (e.ttft ?? 0) > 0)
      if (llmEntries.length === 0) return null
      const ttft = Math.round(llmEntries.reduce((s, e) => s + (e.ttft ?? 0), 0) / llmEntries.length)
      return ttft > 0 ? { session: getSessionGlobalNumber(sess) || (idx + 1), ttft, source: sess.source } : null
    }).filter(Boolean).reverse() as Array<{ session: number; ttft: number; source: string }>

    if (barData.length === 0) { canvas.style.display = 'none'; return }
    canvas.style.display = 'block'

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const w = rect.width, h = rect.height
    ctx.clearRect(0, 0, w, h)

    const pad = { top: 8, right: 44, bottom: 34, left: 44 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom
    const maxTtft = Math.max(...barData.map(d => d.ttft)) || 1

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
      const val = maxTtft * (4 - i) / 4
      if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + chartH * i / 4)
    }

    const barGap = 8
    const sl = barData.length
    const barWidth = Math.max(12, (chartW - barGap * (sl + 1)) / sl)
    const totalBarsW = sl * barWidth + (sl + 1) * barGap
    const offsetX = pad.left + (chartW - totalBarsW) / 2 + barGap
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'

    barData.forEach((d, i) => {
      const x = offsetX + i * (barWidth + barGap)
      const barH = (d.ttft / maxTtft) * chartH
      const barY = pad.top + chartH - barH
      ctx.fillStyle = getAgentColor(d.source)
      ctx.fillRect(x, barY, barWidth, barH)
      ctx.fillStyle = textColor; ctx.font = fontStr
      ctx.fillText('' + d.session, x + barWidth / 2, pad.top + chartH + 4)
      // Removed dot under session number for clarity; color of bar is sufficient
    })
  })

  return (
    <>
      <canvas ref={canvasRef} style="width:100%;height:200px;display:block" />
      <div class="heatmap-axis-label">← Session (latest to earliest) →</div>
    </>
  )
}

export function Latency() {
  const spans = displaySpans.value
  const sessions = displaySessions.value

  if (spans.length === 0) {
    return <div id="latency-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  let displayGroups: Array<{ label: string; source?: string; spans: typeof spans }>
  if (sessions.length === 0) {
    displayGroups = [{ label: '1', spans }]
  } else {
    displayGroups = sessions.map((sess: SessionSummaryCard, idx) => ({
      label: '' + (getSessionGlobalNumber(sess) || idx + 1),
      source: sess.source,
      spans: spans.filter(s => s.traceId === sess.traceId),
    }))
  }
  displayGroups.reverse()
  if (displayGroups.length > 20) displayGroups = displayGroups.slice(0, 20)

  const nameSet = new Set<string>()
  spans.forEach(s => nameSet.add(s.name.split('/')[0] ?? s.name))
  let names = Array.from(nameSet)
  names.sort((a, b) => {
    const aA = isSessionSpan(a) ? 0 : 1
    const bA = isSessionSpan(b) ? 0 : 1
    if (aA !== bA) return aA - bA
    return a.localeCompare(b)
  })
  names = names.filter(name =>
    displayGroups.some(g => g.spans.some(s => {
      const sName = s.name.split('/')[0] ?? s.name
      if (sName !== name) return false
      return (nanoToMs(s.endTime) - nanoToMs(s.startTime)) > 0
    }))
  )

  const grid: Record<string, number[]> = {}
  let maxDur = 0
  names.forEach(name => {
    grid[name] = displayGroups.map(g => {
      let best = 0
      g.spans.forEach(s => {
        const sName = s.name.split('/')[0] ?? s.name
        if (sName === name) {
          const dur = nanoToMs(s.endTime) - nanoToMs(s.startTime)
          if (dur > best) best = dur
        }
      })
      if (best > maxDur) maxDur = best
      return best
    })
  })
  maxDur = maxDur || 1

  const slowest = names.map(name => ({ name, dur: Math.max(...grid[name]) }))
    .filter(x => x.dur > 0)
    .sort((a, b) => b.dur - a.dur)

  const _consistentlySlow = slowest.filter(s => {
    const allDurs = grid[s.name].filter(d => d > 0)
    if (allDurs.length < 2) return false
    const avg = allDurs.reduce((sum, d) => sum + d, 0) / allDurs.length
    return avg > maxDur * 0.5
  })

  const sessionsWithTtft = sessions.filter(s => (s.timeline ?? []).some(e => e.type === 'llm' && (e.ttft ?? 0) > 0))

  return (
    <div id="latency-content">
      {sessionsWithTtft.length > 0 && (
        <>
          <h3 class="has-metric-tip" style="margin:0 0 12px;font-size:13px;color:var(--muted)" data-tip="Time to first token per session, broken out by agent. Each dot is one session. A rising trend indicates model load or growing context is increasing response start latency.">TIME TO FIRST TOKEN</h3>
          <TtftChart sessions={sessions} />
        </>
      )}
      <h3 style="margin:24px 0 12px;font-size:13px;color:var(--muted)">SPAN DURATION HEATMAP</h3>
      <div class="heatmap">
        <table style="border-collapse:collapse">
          <thead>
            <tr>
              <td />
              {displayGroups.map((g, gi) => (
                <td key={gi} style="text-align:center;width:32px;min-width:32px;padding:2px 4px;vertical-align:bottom">
                  <div style="font-size:10px;white-space:nowrap;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:2px">
                    <span style="opacity:0.6">{g.label}</span>
                    {g.source && <span dangerouslySetInnerHTML={{ __html: getAgentDotHtml(g.source) }} />}
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {names.map(name => (
              <tr key={name}>
                <td class="heatmap-row-label">{name}</td>
                {grid[name].map((dur, idx) => {
                  const intensity = dur / maxDur
                  const r = Math.round(79 + intensity * 176)
                  const g = Math.round(195 - intensity * 130)
                  const bl = Math.round(247 - intensity * 180)
                  const bg = dur > 0 ? `rgb(${r},${g},${bl})` : 'transparent'
                  return (
                    <td key={idx} style="text-align:center;width:32px;min-width:32px;padding:2px 4px">
                      <div class="heatmap-cell" style={'background:' + bg}>
                        {dur > 0 && (
                          <span class="htip">{name} session {displayGroups[idx].label}: {formatMs(dur)}</span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div class="heatmap-axis-label">← Session (latest to earliest) →</div>
        <div class="heatmap-legend">
          <span>Duration:</span><span>Low</span>
          <div class="heatmap-legend-bar">
            {Array.from({ length: 6 }, (_, li) => {
              const int = li / 5
              const lr = Math.round(79 + int * 176)
              const lg = Math.round(195 - int * 130)
              const lb = Math.round(247 - int * 180)
              return <span key={li} style={`background:rgb(${lr},${lg},${lb})`} />
            })}
          </div>
          <span>High ({formatMs(maxDur)})</span>
        </div>
      </div>
    </div>
  )
}
