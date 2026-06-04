import { useState, useRef, useEffect } from 'preact/hooks'
import { filteredSessions } from '../state'
import { getAgentColor, getAgentSourceLabel } from '../utils'
import { calcSessionCost } from '../sessionMetrics'
import { fmtUsd } from './Cost'
import type { SessionSummaryCard } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function sessionCost(s: SessionSummaryCard): number {
  return calcSessionCost(s, s.source === 'copilot' ? 'token' : 'token').totalUsd
}

function basename(p: string): string {
  return p.replace(/\\/g, '/').split('/').pop() ?? p
}

const MARKER_KEY = 'agentLens.patternMarkers'
interface Marker { date: string; label: string }
function loadMarkers(): Marker[] {
  try { return JSON.parse(localStorage.getItem(MARKER_KEY) ?? '[]') } catch { return [] }
}
function saveMarkers(m: Marker[]): void {
  try { localStorage.setItem(MARKER_KEY, JSON.stringify(m)) } catch {}
}

// ── Panel 1: Hot Files ────────────────────────────────────────────────────────

function HotFilesPanel({ sessions }: { sessions: SessionSummaryCard[] }) {
  const [showChanged, setShowChanged] = useState(false)

  const fileMap = new Map<string, { read: number; changed: number; sessionCount: number }>()
  for (const s of sessions) {
    const seen = new Set<string>()
    const allFiles = [
      ...(showChanged ? s.filesChanged ?? [] : []),
      ...(s.filesRead ?? []),
      ...(showChanged ? [] : s.filesChanged ?? []),
    ]
    for (const f of allFiles) {
      if (!seen.has(f)) {
        seen.add(f)
        const e = fileMap.get(f) ?? { read: 0, changed: 0, sessionCount: 0 }
        e.sessionCount++
        if (s.filesRead?.includes(f)) e.read++
        if (s.filesChanged?.includes(f)) e.changed++
        fileMap.set(f, e)
      }
    }
  }

  const total = sessions.length || 1
  const rows = [...fileMap.entries()]
    .map(([file, v]) => ({ file, ...v, pct: Math.round(v.sessionCount / total * 100) }))
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, 30)

  if (rows.length === 0) return <div class="empty-state">No file access data yet.</div>

  return (
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:11px;color:var(--muted)">Show:</span>
        <button class={'tab-mini' + (!showChanged ? ' active' : '')} onClick={() => setShowChanged(false)}>Read + Changed</button>
        <button class={'tab-mini' + (showChanged ? ' active' : '')} onClick={() => setShowChanged(true)}>Changed only</button>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <thead>
            <tr style="border-bottom:1px solid var(--border)">
              <th style="text-align:left;padding:4px 8px 4px 0;color:var(--muted);font-weight:500">File</th>
              <th style="text-align:right;padding:4px 8px;color:var(--muted);font-weight:500;white-space:nowrap">Sessions</th>
              <th style="text-align:right;padding:4px 8px;color:var(--muted);font-weight:500">%</th>
              <th style="text-align:left;padding:4px 8px;color:var(--muted);font-weight:500">Frequency</th>
              <th style="padding:4px 0;color:var(--muted);font-weight:500">CLAUDE.md?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.file} style="border-bottom:1px solid var(--border)">
                <td style="padding:4px 8px 4px 0;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title={r.file}>
                  <span style="color:var(--muted);font-size:10px">{r.file.replace(basename(r.file), '')}</span>
                  <span style="color:var(--fg)">{basename(r.file)}</span>
                </td>
                <td style="padding:4px 8px;text-align:right;font-variant-numeric:tabular-nums">{r.sessionCount}</td>
                <td style="padding:4px 8px;text-align:right;color:var(--muted)">{r.pct}%</td>
                <td style="padding:4px 8px;min-width:120px">
                  <div style={`height:6px;border-radius:3px;background:var(--border);overflow:hidden`}>
                    <div style={`height:100%;width:${r.pct}%;background:${r.pct >= 50 ? 'var(--accent)' : 'var(--muted)'};border-radius:3px`} />
                  </div>
                </td>
                <td style="padding:4px 0;text-align:center">
                  {r.pct >= 40 && (
                    <span style="font-size:10px;background:rgba(79,195,247,0.15);color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:1px 5px" title="Appears in 40%+ of sessions — consider mentioning in CLAUDE.md">
                      candidate
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Panel 2: Prompt Efficiency Scatter ────────────────────────────────────────

function ScatterPlot({ sessions }: { sessions: SessionSummaryCard[] }) {
  const [filter, setFilter] = useState('')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; s: SessionSummaryCard } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const points = sessions
    .filter(s => s.totalLlmCalls > 0)
    .map(s => ({
      s,
      cost: sessionCost(s),
      turns: s.totalLlmCalls,
      hasSignal: (s.loopSignals?.length ?? 0) > 0,
      hasErrors: s.errors > 0,
      matches: filter ? (s.userRequest ?? '').toLowerCase().includes(filter.toLowerCase()) : true,
    }))

  if (points.length === 0) return <div class="empty-state" style="padding:20px">No sessions with turn data yet.</div>

  const W = 560, H = 240, PAD = { top: 12, right: 16, bottom: 32, left: 52 }
  const cw = W - PAD.left - PAD.right
  const ch = H - PAD.top - PAD.bottom

  const maxCost  = Math.max(...points.map(p => p.cost), 0.01)
  const maxTurns = Math.max(...points.map(p => p.turns), 1)

  const xPos = (cost: number)  => PAD.left + (cost / maxCost) * cw
  const yPos = (turns: number) => PAD.top  + ch - (turns / maxTurns) * ch

  // Axis tick helpers
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: f * maxCost, x: PAD.left + f * cw }))
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: Math.round(f * maxTurns), y: PAD.top + ch - f * ch }))

  return (
    <div>
      <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <input
          type="text"
          placeholder="Filter by prompt keyword…"
          value={filter}
          onInput={e => setFilter((e.target as HTMLInputElement).value)}
          style="flex:1;max-width:240px;padding:3px 7px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
        />
        <span style="font-size:10px;color:var(--muted)">{points.filter(p => p.matches).length} sessions</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#81c784" /> clean
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f6a623;margin-left:6px" /> signals
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f44747;margin-left:6px" /> errors
        </span>
      </div>
      <div style="position:relative">
        <svg ref={svgRef} width={W} height={H} style="overflow:visible;max-width:100%">
          {/* Grid lines */}
          {yTicks.map(t => (
            <line key={t.v} x1={PAD.left} y1={t.y} x2={PAD.left + cw} y2={t.y}
              stroke="var(--border)" stroke-width="1" />
          ))}
          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + ch} stroke="var(--border)" stroke-width="1" />
          <line x1={PAD.left} y1={PAD.top + ch} x2={PAD.left + cw} y2={PAD.top + ch} stroke="var(--border)" stroke-width="1" />
          {/* Axis labels */}
          <text x={PAD.left + cw / 2} y={H - 2} text-anchor="middle" font-size="10" fill="var(--muted)">Cost (USD)</text>
          <text x={10} y={PAD.top + ch / 2} text-anchor="middle" font-size="10" fill="var(--muted)"
            transform={`rotate(-90,10,${PAD.top + ch / 2})`}>Turns</text>
          {/* X ticks */}
          {xTicks.map(t => (
            <g key={t.v}>
              <line x1={t.x} y1={PAD.top + ch} x2={t.x} y2={PAD.top + ch + 4} stroke="var(--border)" />
              <text x={t.x} y={PAD.top + ch + 14} text-anchor="middle" font-size="9" fill="var(--muted)">
                {t.v < 0.01 ? '$0' : `$${t.v.toFixed(2)}`}
              </text>
            </g>
          ))}
          {/* Y ticks */}
          {yTicks.map(t => (
            <g key={t.v}>
              <line x1={PAD.left - 4} y1={t.y} x2={PAD.left} y2={t.y} stroke="var(--border)" />
              <text x={PAD.left - 6} y={t.y + 4} text-anchor="end" font-size="9" fill="var(--muted)">{t.v}</text>
            </g>
          ))}
          {/* Points */}
          {points.map((p, i) => {
            const cx = xPos(p.cost), cy = yPos(p.turns)
            const color = p.hasErrors ? '#f44747' : p.hasSignal ? '#f6a623' : '#81c784'
            const opacity = filter ? (p.matches ? 1 : 0.15) : 0.75
            return (
              <circle
                key={i}
                cx={cx} cy={cy} r={filter && p.matches ? 5 : 4}
                fill={color} opacity={opacity}
                style="cursor:pointer"
                onMouseEnter={() => setTooltip({ x: cx, y: cy, s: p.s })}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}
        </svg>
        {/* Tooltip */}
        {tooltip && (() => {
          const s = tooltip.s
          const left = tooltip.x > W * 0.6 ? tooltip.x - 220 : tooltip.x + 12
          const top  = tooltip.y > H * 0.6 ? tooltip.y - 90  : tooltip.y + 8
          return (
            <div style={`position:absolute;left:${left}px;top:${top}px;background:var(--vscode-editorWidget-background,#252526);border:1px solid var(--border);border-radius:4px;padding:7px 10px;font-size:11px;pointer-events:none;z-index:10;max-width:210px`}>
              <div style="font-weight:600;color:var(--fg);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {s.userRequest ? s.userRequest.slice(0, 60) + (s.userRequest.length > 60 ? '…' : '') : '—'}
              </div>
              <div style="color:var(--muted);font-size:10px;line-height:1.6">
                <div>{getAgentSourceLabel(s.source)} · {s.model?.split('-').slice(-2).join('-')}</div>
                <div>{s.startTime.slice(0, 10)} · {fmtUsd(sessionCost(s))} · {s.totalLlmCalls} turns</div>
                {(s.loopSignals?.length ?? 0) > 0 && (
                  <div style="color:#f6a623">{s.loopSignals.map(l => l.type).join(', ')}</div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ── Panel 3: CLAUDE.md Recommendations ───────────────────────────────────────

function ClaudeMdPanel({ sessions }: { sessions: SessionSummaryCard[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const total = sessions.length || 1

  // Hot file candidates (≥40% of sessions)
  const fileMap = new Map<string, number>()
  for (const s of sessions) {
    const seen = new Set([...(s.filesRead ?? []), ...(s.filesChanged ?? [])])
    for (const f of seen) fileMap.set(f, (fileMap.get(f) ?? 0) + 1)
  }
  const hotFiles = [...fileMap.entries()]
    .filter(([, n]) => n / total >= 0.4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([file, n]) => ({ file, pct: Math.round(n / total * 100) }))

  // Loop signal patterns
  const sigMap = new Map<string, number>()
  for (const s of sessions) {
    for (const sig of s.loopSignals ?? []) sigMap.set(sig.type, (sigMap.get(sig.type) ?? 0) + 1)
  }
  const freqSignals = [...sigMap.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])

  // Avg cost by prompt pattern
  const refactorSess = sessions.filter(s => /refactor|clean up|improve/i.test(s.userRequest ?? ''))
  const scopedSess   = sessions.filter(s => /in\s+(src|file|function|the)\b/i.test(s.userRequest ?? ''))
  const refactorAvg  = refactorSess.length > 1 ? refactorSess.reduce((a, s) => a + sessionCost(s), 0) / refactorSess.length : 0
  const scopedAvg    = scopedSess.length > 1   ? scopedSess.reduce((a, s) => a + sessionCost(s), 0)   / scopedSess.length   : 0

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 2000)
    })
  }

  const suggestions: Array<{ key: string; text: string; copy: string }> = []

  for (const { file, pct } of hotFiles) {
    const line = `# ${basename(file)} (${file})`
    suggestions.push({
      key: file,
      text: `"${basename(file)}" appears in ${pct}% of sessions — add a reference so the agent can find it without searching.`,
      copy: line,
    })
  }

  if (freqSignals.length > 0) {
    const [type, count] = freqSignals[0]
    const label = type === 'exact_tool_repeat' ? 'tool call loops'
      : type === 'runaway_steps' ? 'runaway turn counts'
      : type.replace(/_/g, ' ')
    suggestions.push({
      key: 'signals',
      text: `"${label}" appeared in ${count} sessions. Add scope guidance to prevent open-ended tasks.`,
      copy: `# Scope guidance\nKeep tasks narrowly scoped. Name specific files and functions. Define a stopping condition.`,
    })
  }

  if (refactorAvg > 0 && scopedAvg > 0 && refactorAvg > scopedAvg * 1.5) {
    suggestions.push({
      key: 'refactor',
      text: `Prompts with "refactor"/"clean up" average ${fmtUsd(refactorAvg)} vs ${fmtUsd(scopedAvg)} for scoped prompts — ${Math.round(refactorAvg / scopedAvg)}× more expensive.`,
      copy: `# Prefer scoped prompts\nAvoid "refactor" or "clean up" without explicit scope. Specify files, functions, and what done looks like.`,
    })
  }

  if (suggestions.length === 0) {
    return (
      <div class="empty-state" style="padding:20px">
        No strong recommendations yet — keep working and patterns will emerge with more sessions.
      </div>
    )
  }

  return (
    <div style="display:flex;flex-direction:column;gap:10px">
      {suggestions.map(s => (
        <div key={s.key} style="background:var(--card-bg);border:1px solid var(--border);border-radius:5px;padding:10px 12px;display:flex;align-items:flex-start;gap:10px">
          <div style="flex:1;font-size:12px;color:var(--muted);line-height:1.5">{s.text}</div>
          <button
            onClick={() => copy(s.copy, s.key)}
            style="flex-shrink:0;font-size:10px;padding:3px 9px;border-radius:3px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);white-space:nowrap"
          >{copied === s.key ? '✓ Copied' : 'Copy line'}</button>
        </div>
      ))}
    </div>
  )
}

// ── Panel 4: Trend + Markers ──────────────────────────────────────────────────

function TrendPanel({ sessions }: { sessions: SessionSummaryCard[] }) {
  const [markers, setMarkers] = useState<Marker[]>(loadMarkers)
  const [newLabel, setNewLabel] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))

  // Build daily cost buckets
  const dayMap = new Map<string, { cost: number; turns: number; n: number }>()
  for (const s of sessions) {
    if (!s.startTime) continue
    const day = s.startTime.slice(0, 10)
    const e = dayMap.get(day) ?? { cost: 0, turns: 0, n: 0 }
    e.cost += sessionCost(s); e.turns += s.totalLlmCalls; e.n++
    dayMap.set(day, e)
  }
  const days = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  if (days.length < 2) return (
    <div class="empty-state" style="padding:20px">
      Not enough data yet — trend appears after 2+ days of sessions.
    </div>
  )

  const W = 560, H = 160, PAD = { top: 12, right: 16, bottom: 30, left: 52 }
  const cw = W - PAD.left - PAD.right
  const ch = H - PAD.top - PAD.bottom

  const maxCost = Math.max(...days.map(([, v]) => v.cost), 0.01)
  const xPos = (i: number) => PAD.left + (i / (days.length - 1)) * cw
  const yPos = (cost: number) => PAD.top + ch - (cost / maxCost) * ch

  const points = days.map(([, v], i) => ({ x: xPos(i), y: yPos(v.cost), cost: v.cost, n: v.n }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  const addMarker = () => {
    if (!newLabel.trim()) return
    const next = [...markers, { date: newDate, label: newLabel.trim() }].sort((a, b) => a.date.localeCompare(b.date))
    setMarkers(next); saveMarkers(next); setNewLabel('')
  }
  const removeMarker = (i: number) => {
    const next = markers.filter((_, j) => j !== i)
    setMarkers(next); saveMarkers(next)
  }

  return (
    <div>
      <svg width={W} height={H} style="overflow:visible;max-width:100%;display:block;margin-bottom:8px">
        {/* Grid */}
        {[0, 0.5, 1].map(f => {
          const y = PAD.top + ch - f * ch
          return <line key={f} x1={PAD.left} y1={y} x2={PAD.left + cw} y2={y} stroke="var(--border)" stroke-width="1" />
        })}
        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + ch} stroke="var(--border)" />
        <line x1={PAD.left} y1={PAD.top + ch} x2={PAD.left + cw} y2={PAD.top + ch} stroke="var(--border)" />
        {/* Y labels */}
        <text x={PAD.left - 4} y={PAD.top + 4} text-anchor="end" font-size="9" fill="var(--muted)">{fmtUsd(maxCost)}</text>
        <text x={PAD.left - 4} y={PAD.top + ch / 2 + 4} text-anchor="end" font-size="9" fill="var(--muted)">{fmtUsd(maxCost / 2)}</text>
        <text x={PAD.left - 4} y={PAD.top + ch + 4} text-anchor="end" font-size="9" fill="var(--muted)">$0</text>
        {/* X date labels (first + last) */}
        <text x={PAD.left} y={PAD.top + ch + 16} text-anchor="start" font-size="9" fill="var(--muted)">{days[0][0].slice(5)}</text>
        <text x={PAD.left + cw} y={PAD.top + ch + 16} text-anchor="end" font-size="9" fill="var(--muted)">{days[days.length - 1][0].slice(5)}</text>
        {/* Area fill */}
        <polygon
          points={`${PAD.left},${PAD.top + ch} ${polyline} ${PAD.left + cw},${PAD.top + ch}`}
          fill="rgba(79,195,247,0.1)"
        />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="var(--accent)" stroke-width="1.5" />
        {/* Dots */}
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--accent)" />)}
        {/* Markers */}
        {markers.map(m => {
          const dayIdx = days.findIndex(([d]) => d >= m.date)
          if (dayIdx < 0) return null
          const x = xPos(dayIdx)
          return (
            <g key={m.date + m.label}>
              <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + ch} stroke="#f6a623" stroke-width="1" stroke-dasharray="3 2" />
              <text x={x + 3} y={PAD.top + 10} font-size="9" fill="#f6a623">{m.label}</text>
            </g>
          )
        })}
      </svg>

      {/* Add marker */}
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px">
        <span style="color:var(--muted);flex-shrink:0">Add marker:</span>
        <input type="date" value={newDate} onInput={e => setNewDate((e.target as HTMLInputElement).value)}
          style="padding:2px 6px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none" />
        <input type="text" placeholder="e.g. edited CLAUDE.md" value={newLabel}
          onInput={e => setNewLabel((e.target as HTMLInputElement).value)}
          onKeyDown={e => { if (e.key === 'Enter') addMarker() }}
          style="flex:1;min-width:140px;padding:2px 6px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none" />
        <button onClick={addMarker}
          style="padding:2px 10px;font-size:11px;cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--muted)">Add</button>
      </div>
      {markers.length > 0 && (
        <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">
          {markers.map((m, i) => (
            <span key={i} style="display:inline-flex;align-items:center;gap:4px;font-size:10px;background:rgba(246,166,35,0.12);border:1px solid #f6a623;border-radius:3px;padding:2px 7px;color:#f6a623">
              {m.date.slice(5)} {m.label}
              <button onClick={() => removeMarker(i)}
                style="background:none;border:none;color:#f6a623;cursor:pointer;padding:0;line-height:1;font-size:12px">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function Patterns() {
  const sessions = filteredSessions.value
  const [panel, setPanel] = useState<'files' | 'scatter' | 'claude' | 'trend'>('files')

  if (sessions.length === 0) {
    return <div class="empty-state">No sessions recorded yet — patterns will appear once you have session history.</div>
  }

  const h3Style = 'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin:0'

  const panels = [
    { id: 'files'   as const, label: 'Hot Files' },
    { id: 'scatter' as const, label: 'Efficiency Map' },
    { id: 'claude'  as const, label: 'CLAUDE.md Tips' },
    { id: 'trend'   as const, label: 'Cost Trend' },
  ]

  return (
    <div id="patterns-content">
      {/* Sub-tab nav */}
      <div style="display:flex;gap:2px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:0">
        {panels.map(p => (
          <button
            key={p.id}
            class={'tab-mini' + (panel === p.id ? ' active' : '')}
            style="border-bottom:none;border-radius:3px 3px 0 0;margin-bottom:-1px"
            onClick={() => setPanel(p.id)}
          >{p.label}</button>
        ))}
        <span style="margin-left:auto;font-size:10px;color:var(--muted);align-self:center;padding-bottom:4px">
          {sessions.length} sessions
        </span>
      </div>

      {panel === 'files'   && <HotFilesPanel sessions={sessions} />}
      {panel === 'scatter' && <ScatterPlot   sessions={sessions} />}
      {panel === 'claude'  && <ClaudeMdPanel sessions={sessions} />}
      {panel === 'trend'   && <TrendPanel    sessions={sessions} />}
    </div>
  )
}
