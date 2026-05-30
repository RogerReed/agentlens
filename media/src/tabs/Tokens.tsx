import { useEffect, useRef } from 'preact/hooks'
import { displaySessions } from '../state'
import { formatCompact, getSessionGlobalNumber, getAgentColor } from '../utils'
import type { SessionSummaryCard } from '../types'

function SessionChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const sessionData = sessions.map((sess, idx) => {
      const input = sess.inputTokens ?? 0, output = sess.outputTokens ?? 0
      const num = getSessionGlobalNumber(sess) || (idx + 1)
      return input + output > 0 ? { session: num, input, output, source: sess.source } : null
    }).filter(Boolean).reverse() as Array<{ session: number; input: number; output: number; source: string }>

    if (sessionData.length === 0) { canvas.style.display = 'none'; return }
    canvas.style.display = 'block'

    const dpr = window.devicePixelRatio || 1
    const drect = canvas.getBoundingClientRect()
    canvas.width = drect.width * dpr; canvas.height = drect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const w = drect.width, h = drect.height
    ctx.clearRect(0, 0, w, h)

    const pad = { top: 8, right: 44, bottom: 34, left: 44 }
    const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom

    const maxIn = Math.max(...sessionData.map(s => s.input)) || 1
    const maxOut = Math.max(...sessionData.map(s => s.output)) || 1

    const cs = getComputedStyle(document.body)
    const gridColor = cs.getPropertyValue('--vscode-panel-border').trim() || '#333'
    const textColor = cs.getPropertyValue('--vscode-descriptionForeground').trim() || '#888'
    const fontStr = '10px ' + (cs.getPropertyValue('--vscode-font-family').trim() || 'sans-serif')

    ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH * i / 4)
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke()
    }
    ctx.fillStyle = '#FFB74D'; ctx.font = fontStr; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    for (let i = 0; i <= 4; i++) {
      const val = maxIn * (4 - i) / 4
      if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + (chartH * i / 4))
    }
    ctx.fillStyle = '#81C784'; ctx.textAlign = 'left'
    for (let i = 0; i <= 4; i++) {
      const val = maxOut * (4 - i) / 4
      if (val > 0) ctx.fillText(formatCompact(val), pad.left + chartW + 4, pad.top + (chartH * i / 4))
    }

    const barGap = 8
    const sl = sessionData.length
    const groupWidth = Math.max(12, (chartW - barGap * (sl + 1)) / sl)
    const halfBar = groupWidth / 2
    const totalBarsW = sl * groupWidth + (sl + 1) * barGap
    const offsetX = pad.left + (chartW - totalBarsW) / 2 + barGap
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'

    sessionData.forEach((s, i) => {
      const x = offsetX + i * (groupWidth + barGap)
      const inH = (s.input / maxIn) * chartH
      ctx.fillStyle = '#FFB74D'; ctx.fillRect(x, pad.top + chartH - inH, halfBar, inH)
      const outH = (s.output / maxOut) * chartH
      ctx.fillStyle = '#81C784'; ctx.fillRect(x + halfBar, pad.top + chartH - outH, halfBar, outH)
      ctx.fillStyle = textColor; ctx.fillText('' + s.session, x + groupWidth / 2, pad.top + chartH + 4)
      ctx.beginPath()
      ctx.arc(x + groupWidth / 2, pad.top + chartH + 18, 3, 0, Math.PI * 2)
      ctx.fillStyle = getAgentColor(s.source); ctx.fill()
    })
  })

  return (
    <>
      <canvas ref={canvasRef} id="dashboard-session-chart" style="width:100%;height:200px;display:block" />
      <div class="heatmap-axis-label">← Session (latest to earliest) →</div>
    </>
  )
}

function agentLabel(source: string): string {
  if (source === 'claude_code') return 'Claude'
  if (source === 'copilot') return 'Copilot'
  if (source === 'codex') return 'Codex'
  return 'Agent'
}

export function Tokens() {
  const sessions = displaySessions.value

  if (sessions.length === 0) {
    return <div id="tokens-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  // Aggregate tokens by model / label from session-level data.
  const byName: Record<string, { tokens: number; count: number }> = {}
  sessions.forEach(sess => {
    const key = sess.model ? `${agentLabel(sess.source)}: ${sess.model}` : agentLabel(sess.source)
    const tokens = (sess.inputTokens ?? 0) + (sess.outputTokens ?? 0)
    if (tokens <= 0) return
    if (!byName[key]) byName[key] = { tokens: 0, count: 0 }
    byName[key].tokens += tokens
    byName[key].count++
  })

  const data = Object.entries(byName).map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.tokens - a.tokens)
  const maxTokensBar = data.length > 0 ? data[0].tokens : 1

  return (
    <div id="tokens-content">
      <div style="margin-bottom:24px">
        <h3 style="margin:0 0 8px;font-size:13px;color:var(--muted)">TOKEN USAGE PER SESSION</h3>
        <div style="display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)">
          <span><span style="display:inline-block;width:10px;height:3px;background:#FFB74D;border-radius:1px;vertical-align:middle" /> Input</span>
          <span><span style="display:inline-block;width:10px;height:3px;background:#81C784;border-radius:1px;vertical-align:middle" /> Output</span>
        </div>
        <SessionChart sessions={sessions} />
      </div>

      <h3 style="margin:32px 0 12px;font-size:13px;color:var(--muted)">TOKENS BY MODEL / AGENT</h3>
      <div class="bar-chart-container" style="margin-top:32px">
        <div class="bar-chart">
          {data.slice(0, 20).map(d => {
            const h = Math.max((d.tokens / maxTokensBar) * 180, 2)
            const countLabel = d.count > 1 ? ` (${d.count} sessions)` : ''
            return (
              <div key={d.name} class="bar-col">
                <div class="bar-value">{d.tokens.toLocaleString()}</div>
                <div class="bar-rect" style={'height:' + h + 'px'} title={`${d.name}: ${d.tokens.toLocaleString()} tokens${countLabel}`} />
                <div class="bar-label">{d.name}{countLabel}</div>
              </div>
            )
          })}
        </div>
        <div class="axis-label">Token consumption by model (aggregated across sessions)</div>
      </div>
    </div>
  )
}
