import { useEffect, useRef } from 'preact/hooks'
import { displaySpans, displaySessions } from '../state'
import { getTokenCount, formatCompact, getSessionGlobalNumber, getAgentColor, isSessionSpan } from '../utils'
import type { Span, SessionSummaryCard } from '../types'

function getOutputTokenCount(span: Span): number {
  let output = 0
  ;(span.attributes ?? []).forEach(a => {
    if (/output.?tokens|completion.?tokens/i.test(a.key))
      output = parseInt(String(a.value.intValue ?? a.value.stringValue ?? a.value.doubleValue)) || 0
  })
  return output
}

function SessionChart({ sessions }: { sessions: SessionSummaryCard[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const sessionData = sessions.map((sess, idx) => {
      const totalIn = sess.inputTokens ?? 0, totalOut = sess.outputTokens ?? 0
      const inputs: number[] = [], outputs: number[] = []
      ;(sess.timeline ?? []).forEach(e => {
        if (e.type === 'llm' && ((e.inputTokens ?? 0) > 0 || (e.outputTokens ?? 0) > 0)) {
          inputs.push(e.inputTokens ?? 0)
          outputs.push(e.outputTokens ?? 0)
        }
      })
      if (inputs.length === 0 && (totalIn > 0 || totalOut > 0)) { inputs.push(totalIn); outputs.push(totalOut) }
      const num = getSessionGlobalNumber(sess) || (idx + 1)
      return totalIn + totalOut > 0 ? { session: num, tokens: totalIn + totalOut, inputTokens: inputs, outputTokens: outputs, source: sess.source } : null
    }).filter(Boolean).reverse() as Array<{ session: number; tokens: number; inputTokens: number[]; outputTokens: number[]; source: string }>

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

    // Compute per-session input/output totals
    const sessionTotals = sessionData.map(d => {
      const input = d.inputTokens.reduce((a, b) => a + b, 0)
      const output = d.outputTokens.reduce((a, b) => a + b, 0)
      return { input, output, session: d.session, source: d.source }
    })
    const maxIn = Math.max(...sessionTotals.map(s => s.input)) || 1
    const maxOut = Math.max(...sessionTotals.map(s => s.output)) || 1

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

    sessionTotals.forEach((s, i) => {
      const x = offsetX + i * (groupWidth + barGap)

      // Input bar (left half, scaled to maxIn)
      const inH = (s.input / maxIn) * chartH
      const inY = pad.top + chartH - inH
      ctx.fillStyle = '#FFB74D'; ctx.fillRect(x, inY, halfBar, inH)

      // Output bar (right half, scaled to maxOut)
      const outH = (s.output / maxOut) * chartH
      const outY = pad.top + chartH - outH
      ctx.fillStyle = '#81C784'; ctx.fillRect(x + halfBar, outY, halfBar, outH)

      ctx.fillStyle = textColor; ctx.fillText('' + s.session, x + groupWidth / 2, pad.top + chartH + 4)
      ctx.beginPath()
      ctx.arc(x + groupWidth / 2, pad.top + chartH + 18, 3, 0, Math.PI * 2)
      ctx.fillStyle = getAgentColor(s.source)
      ctx.fill()
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
  const spans = displaySpans.value
  const sessions = displaySessions.value

  const byName: Record<string, { tokens: number; count: number }> = {}
  if (sessions.length > 0) {
    sessions.forEach(sess => {
      ;(sess.timeline ?? []).forEach(entry => {
        const tokens = (entry.inputTokens ?? 0) + (entry.outputTokens ?? 0)
        if (tokens <= 0) { return }
        const name = entry.type === 'llm'
          ? (entry.model || `${agentLabel(sess.source)} LLM`)
          : `${agentLabel(sess.source)} ${entry.label}`
        if (!byName[name]) byName[name] = { tokens: 0, count: 0 }
        byName[name].tokens += tokens
        byName[name].count++
      })
    })
  } else {
    const tokenSpans = spans.filter(s => getTokenCount(s) > 0 && !isSessionSpan(s.name))
    tokenSpans.forEach(s => {
      if (!byName[s.name]) byName[s.name] = { tokens: 0, count: 0 }
      byName[s.name].tokens += getTokenCount(s)
      byName[s.name].count++
    })
  }

  if (Object.keys(byName).length === 0) {
    return <div id="tokens-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }

  const _totalOutput = spans.reduce((s, sp) => s + getOutputTokenCount(sp), 0)

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

      <h3 style="margin:32px 0 12px;font-size:13px;color:var(--muted)">TOKENS BY SPAN TYPE</h3>
      <div class="bar-chart-container" style="margin-top:32px">
        <div class="bar-chart">
          {data.slice(0, 20).map(d => {
            const h = Math.max((d.tokens / maxTokensBar) * 180, 2)
            const label = d.name.split('/').pop() ?? d.name
            const countLabel = d.count > 1 ? ` (${d.count}×)` : ''
            return (
              <div key={d.name} class="bar-col">
                <div class="bar-value">{d.tokens.toLocaleString()}</div>
                <div class="bar-rect" style={'height:' + h + 'px'} title={`${d.name}: ${d.tokens.toLocaleString()} tokens${countLabel}`} />
                <div class="bar-label">{label}{countLabel}</div>
              </div>
            )
          })}
        </div>
        <div class="axis-label">Token consumption by operation type (top 20, aggregated)</div>
      </div>
    </div>
  )
}
