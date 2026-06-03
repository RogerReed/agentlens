import { useState } from 'preact/hooks'
import {
  filteredSessions, sessionSummary, sessionTimelines, burnRateData,
  focusedSessionId, vscode, ignoredInsightKeys,
  sessionSortKey, sessionSortDir, type SortKey,
} from '../state'
import {
  getAgentColor, getAgentSourceLabel, formatMs, formatCompact, formatSessionTime,
  getDataSourceBadgeHtml, getInitiatorBadgeHtml,
} from '../utils'
import { calcSessionCost } from '../sessionMetrics'
import { fmtUsd } from './Cost'
import { generateInsights, InsightCard } from './Insights'
import { buildDisplaySummary } from '../utils'
import { Step, StepRow } from './Traces'
import { FlowCanvas } from './Flow'
import { ToolsChart } from './Tools'
import type { SessionSummaryCard } from '../types'

// ── Session detail panel (shown in expanded row) ──────────────────────────────

type Section = 'overview' | 'trace' | 'files' | 'flow' | 'tools'

function PromptBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW_CHARS = 300
  const truncated = !expanded && text.length > PREVIEW_CHARS
  const display = truncated ? text.slice(0, PREVIEW_CHARS).trimEnd() + '…' : text
  return (
    <div style="margin-bottom:10px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:4px">Prompt</div>
      <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:4px;padding:7px 10px;font-size:11px;white-space:pre-wrap;word-break:break-word;line-height:1.5;color:var(--foreground);max-height:200px;overflow-y:auto">
        {display}
      </div>
      {text.length > PREVIEW_CHARS && (
        <button
          onClick={() => setExpanded(e => !e)}
          style="margin-top:4px;font-size:10px;color:var(--vscode-textLink-foreground,#4fc3f7);background:none;border:none;cursor:pointer;padding:0"
        >
          {expanded ? 'Show less' : 'Show full prompt'}
        </button>
      )}
    </div>
  )
}

function SessionDetail({ sess }: { sess: SessionSummaryCard }) {
  const [section, setSection] = useState<Section>('overview')
  const timelines = sessionTimelines.value
  const timeline = timelines[sess.sessionId] ?? sess.timeline ?? []
  const cost = calcSessionCost(sess, 'token')
  const cacheRate = sess.inputTokens > 0 ? Math.round(sess.cacheReadTokens / sess.inputTokens * 100) : 0
  const burnRate = burnRateData.value

  if (!timelines[sess.sessionId] && vscode) {
    vscode.postMessage({ type: 'loadSessionDetail', sessionId: sess.sessionId })
  }

  const ignored = ignoredInsightKeys.value
  const summary = buildDisplaySummary([sess])
  const sessInsights = generateInsights(summary, [sess]).filter(i => !ignored.has(i.title))

  const visibleEntries = timeline.filter(e => e.type !== 'background')
  const sessionStartMs = sess.startTime ? new Date(sess.startTime).getTime() : 0
  let sessionDur = sess.durationMs || 1

  const steps: Step[] = visibleEntries.map(entry => {
    const entryStart = entry.timestamp ? new Date(entry.timestamp).getTime() : 0
    const offset = sessionStartMs > 0 && entryStart > 0 ? entryStart - sessionStartMs : 0
    return { entry, offsetMs: Math.max(offset, 0), durationMs: entry.durationMs || 0 }
  })
  if (steps.length > 0) {
    const maxEnd = Math.max(...steps.map(s => s.offsetMs + s.durationMs))
    if (maxEnd > sessionDur) sessionDur = maxEnd
  }
  if (sessionDur <= 0) sessionDur = 1

  const navBtn = (s: Section, label: string) => (
    <button
      onClick={e => { e.stopPropagation(); setSection(s) }}
      style={[
        'padding:3px 10px;font-size:11px;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;',
        section === s ? 'color:var(--fg);border-bottom-color:var(--accent);font-weight:600' : 'color:var(--muted)',
      ].join('')}
    >{label}</button>
  )

  return (
    <div style="border-top:1px solid var(--border)" onClick={e => e.stopPropagation()}>
      <div style="display:flex;gap:0;padding:0 8px;border-bottom:1px solid var(--border);background:var(--vscode-editorWidget-background,var(--bg));overflow-x:auto">
        {navBtn('overview', 'Overview')}
        {navBtn('trace', `Trace${visibleEntries.length > 0 ? ' (' + visibleEntries.length + ')' : ''}`)}
        {navBtn('flow', `Flow${sess.totalLlmCalls > 0 ? ' (' + sess.totalLlmCalls + ')' : ''}`)}
        {navBtn('tools', `Tools${sess.totalToolCalls > 0 ? ' (' + sess.totalToolCalls + ')' : ''}`)}
        {navBtn('files', `Files${sess.filesChanged.length > 0 ? ' (' + sess.filesChanged.length + ')' : ''}`)}
      </div>

      <div style="padding:12px 14px">

        {section === 'overview' && (
          <div>
            {sess.userRequest
              ? <PromptBlock text={sess.userRequest} />
              : sess.turns === 0
                ? <div style="margin-bottom:10px;font-size:11px;color:var(--muted);font-style:italic">Waiting for first turn…</div>
                : <div style="margin-bottom:10px;font-size:11px;color:var(--muted)">Prompt not captured for this session</div>
            }
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin-bottom:10px">
              {[
                { k: 'LLM calls',  v: String(sess.totalLlmCalls) },
                { k: 'Tool calls', v: String(sess.totalToolCalls) },
                { k: 'Input tokens',  v: formatCompact(sess.inputTokens) },
                { k: 'Output tokens', v: formatCompact(sess.outputTokens) },
                { k: 'Cache hit',  v: cacheRate + '%' },
                { k: 'Duration',   v: formatMs(sess.durationMs) },
                ...(sess.errors > 0 ? [{ k: 'Errors', v: String(sess.errors) }] : []),
                ...(!cost.modelUnknown && cost.totalUsd > 0 ? [{ k: 'Est. cost', v: fmtUsd(cost.totalUsd) }] : []),
              ].map(({ k, v }) => (
                <div key={k} style="background:var(--card-bg);border:1px solid var(--border);border-radius:4px;padding:5px 8px">
                  <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px">{k}</div>
                  <div style="font-size:14px;font-weight:600;color:var(--vscode-textLink-foreground,#4fc3f7)">{v}</div>
                </div>
              ))}
            </div>

            {burnRate && burnRate.sessionId === sess.sessionId && (
              <div style="margin-bottom:10px;padding:6px 10px;border-radius:4px;border-left:3px solid #56D364;background:var(--hover);font-size:11px">
                <span style="color:#56D364;font-weight:600">{formatCompact(Math.round(burnRate.burnRate.tokensPerMinute))} tok/min</span>
                {burnRate.burnRate.costPerHour > 0.001 && <span style="color:var(--muted);margin-left:8px">~{fmtUsd(burnRate.burnRate.costPerHour)}/hr</span>}
                {burnRate.projection && <span style="color:var(--muted);margin-left:8px">{burnRate.projection.contextFillPct.toFixed(0)}% context used</span>}
              </div>
            )}

            {sessInsights.length > 0 && (
              <div>
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:6px">Insights</div>
                {sessInsights.slice(0, 4).map(ins => (
                  <InsightCard key={ins.title} ins={ins} isIgnored={false} sessions={[sess]} />
                ))}
              </div>
            )}

          </div>
        )}

        {section === 'trace' && (
          <div>
            {steps.length === 0
              ? (timelines[sess.sessionId] !== undefined
                  ? <div class="empty-state" style="padding:12px 0">No trace data for this session</div>
                  : <div class="empty-state" style="padding:12px 0">Loading…</div>)
              : (
                <div class="waterfall">
                  <div class="wf-time-ruler">
                    {Array.from({ length: 6 }, (_, t) => <span key={t}>{formatMs(sessionDur * t / 5)}</span>)}
                  </div>
                  {steps.map((step, si) => (
                    <StepRow
                      key={step.entry.spanId + si}
                      step={step}
                      idx={si}
                      sessIdx={0}
                      sessionDur={sessionDur}
                      sessionModel={sess.model ?? ''}
                    />
                  ))}
                </div>
              )
            }
          </div>
        )}

        {section === 'flow' && (
          <FlowCanvas sess={sess} height={420} />
        )}

        {section === 'tools' && (
          <ToolsChart sessions={[sess]} />
        )}

        {section === 'files' && (
          <div>
            {sess.filesChanged.length === 0
              ? <div class="empty-state" style="padding:12px 0">No files modified</div>
              : (
                <div style="display:flex;flex-direction:column;gap:3px">
                  {sess.filesChanged.map(f => (
                    <div
                      key={f}
                      style={`display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--hover);border-radius:4px;font-size:11px${vscode ? ';cursor:pointer' : ''}`}
                      onClick={() => vscode?.postMessage({ type: 'openFile', filePath: f })}
                      title={vscode ? 'Click to open in editor' : f}
                    >
                      <span style="color:var(--vscode-charts-green,#81c784);font-size:10px;flex-shrink:0">M</span>
                      <span style={`font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap${vscode ? ';color:var(--vscode-textLink-foreground,#4fc3f7)' : ''}`}>{f}</span>
                    </div>
                  ))}
                  {sess.filesChangedNote && (
                    <div style="font-size:10px;color:var(--muted);margin-top:3px">{sess.filesChangedNote}</div>
                  )}
                </div>
              )
            }
          </div>
        )}

      </div>
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────

function SessionRow({ sess }: { sess: SessionSummaryCard }) {
  const [expanded, setExpanded] = useState(false)
  const isFocused = focusedSessionId.value === sess.sessionId
  const cost = calcSessionCost(sess, 'token')
  const color = getAgentColor(sess.source)
  const prompt = sess.userRequest ?? ''

  function toggle() {
    const next = !expanded
    setExpanded(next)
    focusedSessionId.value = next ? sess.sessionId : null
  }

  const rowBg = isFocused ? 'var(--hover)' : 'transparent'

  return (
    <>
      <tr
        onClick={toggle}
        style={`cursor:pointer;background:${rowBg};border-bottom:1px solid var(--vscode-panel-border)`}
      >
        {/* Chevron */}
        <td style="padding:4px 4px 4px 8px;width:16px;color:var(--muted);font-size:9px;white-space:nowrap">
          {expanded ? '▼' : '▶'}
        </td>

        {/* Agent dot + data source badge */}
        <td style="padding:4px 4px;width:auto;white-space:nowrap">
          <span style={`display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;vertical-align:middle`} />
          <span style="margin-left:4px" dangerouslySetInnerHTML={{ __html: getDataSourceBadgeHtml(sess.dataSource ?? 'otel') }} />
          <span dangerouslySetInnerHTML={{ __html: getInitiatorBadgeHtml(sess.initiator) }} />
        </td>

        {/* Timestamp */}
        <td style="padding:4px 6px;white-space:nowrap;font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums">
          {formatSessionTime(sess)}
        </td>

        {/* Prompt */}
        <td style="padding:4px 6px;max-width:0;width:100%">
          {prompt
            ? <span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-style:italic;color:var(--foreground)" title={prompt}>{prompt}</span>
            : sess.turns === 0
              ? <span style="color:var(--muted);font-size:11px">…</span>
              : <span style="color:var(--muted);font-size:11px">—</span>
          }
        </td>

        {/* Model */}
        <td style="padding:4px 6px;white-space:nowrap;font-size:10px;color:var(--muted);max-width:130px;overflow:hidden;text-overflow:ellipsis">
          {sess.model || '—'}
        </td>

        {/* Tokens */}
        <td style="padding:4px 6px;text-align:right;white-space:nowrap;font-size:10px;color:var(--muted)">
          {formatCompact(sess.inputTokens + sess.outputTokens)}
        </td>

        {/* Duration */}
        <td style="padding:4px 6px;text-align:right;white-space:nowrap;font-size:10px;color:var(--muted)">
          {formatMs(sess.durationMs)}
        </td>

        {/* Cost */}
        <td style="padding:4px 8px 4px 6px;text-align:right;white-space:nowrap;font-size:10px">
          {!cost.modelUnknown && cost.totalUsd > 0
            ? <span style="color:var(--vscode-charts-green,#81c784)">{fmtUsd(cost.totalUsd)}</span>
            : sess.errors > 0
              ? <span style="color:var(--error)">{sess.errors} err</span>
              : <span style="color:var(--muted)">—</span>
          }
        </td>
      </tr>

      {expanded && (
        <tr style="border-bottom:1px solid var(--vscode-panel-border)">
          <td colspan={8} style="padding:0">
            <SessionDetail sess={sess} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Sessions component ───────────────────────────────────────────────────

export function Sessions() {
  const sessions = filteredSessions.value
  const hasAny = (sessionSummary.value?.sessions?.length ?? 0) > 0

  if (sessions.length === 0) {
    return (
      <div id="sessions-content">
        <div class="empty-state">{hasAny ? 'No sessions match the active filters.' : 'No sessions recorded yet.'}</div>
      </div>
    )
  }

  const sortKey = sessionSortKey.value
  const sortDir = sessionSortDir.value

  function sortArrow(key: SortKey) {
    if (sortKey !== key) return <span style="opacity:0.3;margin-left:3px">↕</span>
    return <span style="margin-left:3px;color:var(--accent)">{sortDir === 'desc' ? '▼' : '▲'}</span>
  }

  function onSortClick(key: SortKey) {
    if (sessionSortKey.value === key) {
      sessionSortDir.value = sessionSortDir.value === 'desc' ? 'asc' : 'desc'
    } else {
      sessionSortKey.value = key
      sessionSortDir.value = 'desc'
    }
  }

  const thBase = 'padding:3px 6px;font-size:10px;font-weight:600;white-space:nowrap;user-select:none'
  const thSort = thBase + ';cursor:pointer;color:var(--fg)'
  const thMuted = thBase + ';color:var(--muted);font-weight:500'

  return (
    <div id="sessions-content">
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="border-bottom:2px solid var(--vscode-panel-border)">
            <th style="width:16px;padding:3px 4px 3px 8px" />
            <th style={'width:10px;padding:3px 4px;' + thSort} onClick={() => onSortClick('source')} title="Sort by agent">{sortArrow('source')}</th>
            <th style={'text-align:left;' + thSort} onClick={() => onSortClick('start_time')}>Time{sortArrow('start_time')}</th>
            <th style={'text-align:left;' + thSort} onClick={() => onSortClick('prompt')}>Prompt{sortArrow('prompt')}</th>
            <th style={'text-align:left;' + thSort} onClick={() => onSortClick('model')}>Model{sortArrow('model')}</th>
            <th style={'text-align:right;' + thSort} onClick={() => onSortClick('total_tokens')}>Tokens{sortArrow('total_tokens')}</th>
            <th style={'text-align:right;' + thSort} onClick={() => onSortClick('duration_ms')}>Duration{sortArrow('duration_ms')}</th>
            <th style={'text-align:right;padding:3px 8px 3px 6px;' + thSort} onClick={() => onSortClick('cost')}>Cost{sortArrow('cost')}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(sess => (
            <SessionRow key={sess.sessionId} sess={sess} />
          ))}
        </tbody>
      </table>
      </div>
      <div style="padding:6px 8px;font-size:11px;color:var(--muted);border-top:1px solid var(--vscode-panel-border)">
        <span>{(sessionSummary.value?.sessions?.length ?? 0)} sessions stored — managed by retention policy</span>
      </div>
    </div>
  )
}
