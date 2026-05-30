import { useEffect, useRef } from 'preact/hooks'
import { displaySessions } from '../state'
import { formatMs, getAgentDotHtml, getSessionGlobalNumber } from '../utils'
import type { SessionSummaryCard } from '../types'

function TtftChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

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
    const pad = { top: 8, right: 12, bottom: 34, left: 56 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom
    const maxTtft = Math.max(...barData.map(d => d.ttft)) || 1
    const cs = getComputedStyle(document.body)
    const textColor = cs.getPropertyValue('--vscode-descriptionForeground').trim() || '#888'
    const fontStr = '10px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')
    ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = textColor
    const barW = Math.max(8, (chartW - 4 * (barData.length + 1)) / barData.length)
    barData.forEach((d, i) => {
      const x = pad.left + i * (barW + 4)
      const barH = (d.ttft / maxTtft) * chartH
      ctx.fillStyle = '#4fc3f7'
      ctx.fillRect(x, pad.top + chartH - barH, barW, barH)
      ctx.fillStyle = textColor
      ctx.fillText('' + d.session, x + barW / 2, pad.top + chartH + 4)
    })
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    for (let i = 0; i <= 4; i++) {
      const val = maxTtft * (4 - i) / 4
      ctx.fillText(val > 1000 ? (val / 1000).toFixed(1) + 's' : val.toFixed(0) + 'ms', pad.left - 4, pad.top + chartH * i / 4)
    }
  })

  return (
    <>
      <canvas ref={canvasRef} id="ttft-chart" style="width:100%;height:160px;display:block" />
      <div class="heatmap-axis-label">← Session (latest to earliest) →</div>
    </>
  )
}

export function Latency() {
  const sessions = displaySessions.value

  if (sessions.length === 0) {
    return <div id="latency-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  const displayGroups = sessions.slice().reverse().slice(0, 20).map((sess: SessionSummaryCard, idx) => ({
    label: '' + (getSessionGlobalNumber(sess) || idx + 1),
    source: sess.source,
    durationMs: sess.durationMs,
  }))

  const maxDur = Math.max(...displayGroups.map(g => g.durationMs)) || 1
  const sessionsWithTtft = sessions.filter(s => (s.timeline ?? []).some(e => e.type === 'llm' && (e.ttft ?? 0) > 0))

  return (
    <div id="latency-content">
      {sessionsWithTtft.length > 0 && (
        <>
          <h3 class="has-metric-tip" style="margin:0 0 12px;font-size:13px;color:var(--muted)" data-tip="Average time to first token per session.">TIME TO FIRST TOKEN</h3>
          <TtftChart sessions={sessions} />
        </>
      )}
      <h3 style="margin:24px 0 12px;font-size:13px;color:var(--muted)">SESSION DURATION</h3>
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
            <tr>
              <td class="heatmap-row-label">Session</td>
              {displayGroups.map((g, idx) => {
                const intensity = g.durationMs / maxDur
                const r = Math.round(79 + intensity * 176)
                const gr = Math.round(195 - intensity * 130)
                const bl = Math.round(247 - intensity * 180)
                const bg = g.durationMs > 0 ? `rgb(${r},${gr},${bl})` : 'transparent'
                return (
                  <td key={idx} style="text-align:center;width:32px;min-width:32px;padding:2px 4px">
                    <div class="heatmap-cell" style={'background:' + bg}>
                      {g.durationMs > 0 && (
                        <span class="htip">Session {g.label}: {formatMs(g.durationMs)}</span>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
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
