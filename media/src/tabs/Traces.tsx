import { useState } from 'preact/hooks'
import clsx from 'clsx'
import {
  waterfallSpans, expandedSpanIds,
  displaySessions, sessionSummary,
} from '../state'
import {
  esc, nanoToMs, formatMs, getAgentDotHtml,
  buildSpanTree, isSessionSpan, getSessionUserRequest, extractUserRequest,
  spanTypeBadge, getSessionGlobalNumber, getCodexSessionId, getAttr,
  extractSpanSummary, SPAN_ATTR_HIGHLIGHT, SPAN_ATTR_SUPPRESS,
  isLlmSpan, extractLlmResponseText, extractLlmToolCalls,
} from '../utils'
import type { Span, SessionSummaryCard } from '../types'


function isCodexWebsocketSpan(span: Span): boolean {
  const name = (span.name ?? '').toLowerCase()
  if (!name.includes('websocket')) return false
  const eventName = String(getAttr(span, 'event.name') ?? '').toLowerCase()
  return name.startsWith('codex.') || eventName.startsWith('codex.') || Boolean(getCodexSessionId(span))
}

function SpanRow({ span, minStart, traceRange, depth }: {
  span: Span; minStart: number; traceRange: number; depth: number
}) {
  const isExpanded = expandedSpanIds.has(span.spanId)
  const [localOpen, setLocalOpen] = useState(isExpanded)
  const [showSuppressed, setShowSuppressed] = useState(false)
  const [showFullResponse, setShowFullResponse] = useState(false)

  const st = nanoToMs(span.startTime), en = nanoToMs(span.endTime)
  const dur = en - st
  const left = minStart > 0 && st > 0 ? ((st - minStart) / traceRange * 100) : 0
  const width = traceRange > 0 ? Math.max((dur / traceRange * 100), 0.5) : 100
  const badge = spanTypeBadge(span)
  const isErr = span.status?.code === 2
  const barColor = isErr ? 'var(--error)' : badge.color
  const summary = extractSpanSummary(span)

  const attrs = span.attributes ?? []
  const tipLines = [
    span.name,
    ...(summary ? [summary] : []),
    'Duration: ' + formatMs(dur),
    'Span: ' + span.spanId,
    ...(span.parentSpanId ? ['Parent: ' + span.parentSpanId] : []),
    ...attrs.filter(a => SPAN_ATTR_HIGHLIGHT.has(a.key)).slice(0, 6).map(a => {
      const v = a.value
      const display = v.stringValue ?? v.intValue ?? v.doubleValue ?? v.boolValue
      return a.key + ': ' + String(display ?? JSON.stringify(v))
    }),
  ]

  const statusStr = span.status
    ? (span.status.code === 0 ? 'OK' : span.status.code === 2 ? 'ERROR' : 'UNSET')
      + (span.status.message ? ' — ' + span.status.message : '')
    : 'UNSET'

  const metaLines = [
    { k: 'Span ID', v: span.spanId ?? '—' },
    { k: 'Trace ID', v: span.traceId ?? '—' },
    ...(span.parentSpanId ? [{ k: 'Parent Span ID', v: span.parentSpanId }] : []),
    { k: 'Status', v: statusStr },
  ]

  const attrToRow = (a: typeof attrs[number]) => {
    const v = a.value
    const display = v.stringValue ?? v.intValue ?? v.doubleValue ?? v.boolValue
    return { k: a.key, v: String(display ?? JSON.stringify(v)) }
  }

  const highlightedRows = attrs.filter(a => SPAN_ATTR_HIGHLIGHT.has(a.key)).map(attrToRow)
  const normalRows      = attrs.filter(a => !SPAN_ATTR_HIGHLIGHT.has(a.key) && !SPAN_ATTR_SUPPRESS.has(a.key)).map(attrToRow)
  const suppressedRows  = attrs.filter(a => SPAN_ATTR_SUPPRESS.has(a.key)).map(attrToRow)

  function toggle() {
    const next = !localOpen
    setLocalOpen(next)
    if (next) expandedSpanIds.add(span.spanId); else expandedSpanIds.delete(span.spanId)
  }

  return (
    <>
      <div class={clsx('wf-row', { selected: localOpen })} onClick={toggle}>
        <div class="wf-label" title={summary ? span.name + ' — ' + summary : span.name}>
          {Array.from({ length: depth }, (_, i) => <span key={i} class="wf-indent" />)}
          <span class="wf-chevron">{localOpen ? '▼' : '▶'}</span>
          <span class="wf-type-badge" style={'background:' + barColor + ';color:#000'}>{badge.label}</span>
          <span style="display:inline-flex;flex-direction:column;min-width:0">
            <span class="wf-name">{span.name}</span>
            {summary && <span style="font-size:9px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px">{summary}</span>}
          </span>
        </div>
        <div class="wf-bar-area">
          <div class="wf-bar" style={`left:${left.toFixed(2)}%;width:${width.toFixed(2)}%`}>
            <div class="wf-bar-inner" style={'background:' + barColor + ';opacity:' + (isErr ? '1' : '0.7')} />
            {width < 15 && <span class="wf-dur">{formatMs(dur)}</span>}
            <div class="wf-tip" dangerouslySetInnerHTML={{ __html: tipLines.map(l => esc(l)).join('<br>') }} />
          </div>
        </div>
        <div class="wf-info">{formatMs(dur)}</div>
      </div>

      <div class={clsx('wf-detail', { open: localOpen })} id={'detail-' + span.spanId}>
        {metaLines.map(dl => (
          <div key={dl.k} class="wf-detail-row">
            <span class="wf-detail-key">{dl.k}</span>
            <span class="wf-detail-val">{dl.v}</span>
          </div>
        ))}
        {highlightedRows.length > 0 && (
          <>
            <div class="wf-detail-row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px">
              <span class="wf-detail-key" style="color:var(--accent);font-weight:600">Tool detail</span>
              <span class="wf-detail-val" />
            </div>
            {highlightedRows.map(dl => (
              <div key={dl.k} class="wf-detail-row">
                <span class="wf-detail-key">{dl.k}</span>
                <span class="wf-detail-val" style="white-space:pre-wrap;word-break:break-all">{dl.v}</span>
              </div>
            ))}
          </>
        )}
        {isLlmSpan(span) && (() => {
          const responseText = extractLlmResponseText(span)
          const toolCalls = extractLlmToolCalls(span)
          const inTok = Number(getAttr(span, 'input_tokens') ?? 0)
          const outTok = Number(getAttr(span, 'output_tokens') ?? 0)
          const hasContent = responseText || toolCalls.length > 0 || inTok > 0
          if (!hasContent) return null
          const PREVIEW_LEN = 600
          const isLong = (responseText?.length ?? 0) > PREVIEW_LEN
          return (
            <div style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px">
              <div class="wf-detail-row">
                <span class="wf-detail-key" style="color:var(--accent);font-weight:600">Response</span>
                <span class="wf-detail-val" style="color:var(--muted);font-size:10px">
                  {inTok > 0 && <>{inTok.toLocaleString()} in → {outTok.toLocaleString()} out</>}
                </span>
              </div>
              {toolCalls.length > 0 && (
                <div class="wf-detail-row">
                  <span class="wf-detail-key">Tool calls</span>
                  <span class="wf-detail-val">{toolCalls.join(', ')}</span>
                </div>
              )}
              {responseText && (
                <div class="wf-detail-row" style="align-items:flex-start">
                  <span class="wf-detail-key" style="padding-top:2px">Text</span>
                  <span class="wf-detail-val" style="white-space:pre-wrap;word-break:break-word;font-size:11px">
                    {showFullResponse ? responseText : responseText.slice(0, PREVIEW_LEN)}
                    {isLong && !showFullResponse && <span style="color:var(--muted)">…</span>}
                    {isLong && (
                      <button
                        class="sw-show-full-btn"
                        style="display:block;margin-top:4px"
                        onClick={e => { e.stopPropagation(); setShowFullResponse(v => !v) }}
                      >
                        {showFullResponse ? 'Collapse' : 'Show full response'}
                      </button>
                    )}
                  </span>
                </div>
              )}
            </div>
          )
        })()}
        {normalRows.length > 0 && normalRows.map(dl => (
          <div key={dl.k} class="wf-detail-row">
            <span class="wf-detail-key">{dl.k}</span>
            <span class="wf-detail-val">{dl.v}</span>
          </div>
        ))}
        {suppressedRows.length > 0 && (
          <>
            <div class="wf-detail-row" style="margin-top:4px">
              <span
                class="wf-detail-key"
                style="color:var(--muted);cursor:pointer;user-select:none"
                onClick={e => { e.stopPropagation(); setShowSuppressed(v => !v) }}
              >
                {showSuppressed ? '▼' : '▶'} SDK / identity attrs ({suppressedRows.length})
              </span>
              <span class="wf-detail-val" />
            </div>
            {showSuppressed && suppressedRows.map(dl => (
              <div key={dl.k} class="wf-detail-row" style="opacity:0.55">
                <span class="wf-detail-key">{dl.k}</span>
                <span class="wf-detail-val">{dl.v}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}

function TraceGroup({
  traceId, traceSpans, sessionNum, source, sessionPrompt, model, isFirst,
}: {
  traceId: string; traceSpans: Span[]; sessionNum?: number; source?: string;
  sessionPrompt?: string; model?: string; isFirst: boolean
}) {
  const [collapsed, setCollapsed] = useState(!isFirst)
  const [promptExpanded, setPromptExpanded] = useState(false)

  const minStart = Math.min(...traceSpans.map(s => nanoToMs(s.startTime)).filter(t => t > 0)) || 0
  const maxEnd = Math.max(...traceSpans.map(s => nanoToMs(s.endTime)))
  const traceRange = maxEnd - minStart || 1
  const traceDur = formatMs(traceRange)
  const errorCount = traceSpans.filter(s => s.status?.code === 2).length
  const tree = buildSpanTree(traceSpans)

  const traceLabel = sessionNum ? <><strong>{sessionNum}</strong> {source && <span dangerouslySetInnerHTML={{ __html: getAgentDotHtml(source) }} />} </> : null
  const sessionTitle = sessionNum ? (sessionPrompt || '[session in progress]') : sessionPrompt
  const isLongPrompt = (sessionTitle?.length ?? 0) > 120
  const promptSnippet = sessionTitle ? ` ${isLongPrompt ? sessionTitle.slice(0, 120) + '…' : sessionTitle}` : ''
  const idLabel = traceId.startsWith('codex:') ? 'Session' : 'Trace'

  const timeMarks = Array.from({ length: 6 }, (_, t) => formatMs(traceRange * t / 5))

  return (
    <div class="wf-trace-group">
      <div class="wf-trace-header" onClick={() => setCollapsed(c => !c)}>
        <span>
          <span class="wf-header-chevron">{collapsed ? '▶' : '▼'}</span>
          {traceLabel}{promptSnippet}
          {isLongPrompt && (
            <button class="sw-show-full-btn" style="margin-left:8px" onClick={e => { e.stopPropagation(); setPromptExpanded(v => !v) }}>
              {promptExpanded ? 'Collapse' : 'Show full prompt'}
            </button>
          )}
        </span>
        <span class="wf-trace-stats">
          <span class="wf-trace-id">{idLabel} {traceId.substring(0, 16)}...</span>
          {' · '}{traceSpans.length} spans{' · '}{traceDur}
          {model && <>{' · '}{model}</>}
          {errorCount > 0 && <span class="err"> · {errorCount} errors</span>}
        </span>
      </div>
      {promptExpanded && sessionTitle && (
        <div style="padding:6px 10px 6px 28px;background:var(--hover);border-left:1px solid var(--border);border-right:1px solid var(--border);font-size:11px;color:var(--fg);white-space:pre-wrap;word-break:break-word">
          {sessionTitle}
        </div>
      )}
      <div class={clsx('wf-trace-body', { collapsed })}>
        <div class="wf-time-ruler">
          {timeMarks.map((m, i) => <span key={i}>{m}</span>)}
        </div>
        {tree.map(node => (
          <SpanRow
            key={node.span.spanId}
            span={node.span}
            minStart={minStart}
            traceRange={traceRange}
            depth={node.depth}
          />
        ))}
      </div>
    </div>
  )
}

export function Traces() {
  const wfSpans = waterfallSpans.value
  const sessions = displaySessions.value
  const codexRawTraceSessionMap = new Map<string, string>()
  wfSpans.forEach((span: Span) => {
    const sessionId = getCodexSessionId(span)
    const rawTraceId = getAttr(span, 'otel.trace_id')
    if (sessionId && rawTraceId) codexRawTraceSessionMap.set(String(rawTraceId), sessionId)
  })
  const sessionSpanMap = new Map<string, string>()
  sessions.forEach((sess: SessionSummaryCard) => {
    if (sess.source !== 'codex' || !sess.traceId) return
    if (sess.sessionId) sessionSpanMap.set(sess.sessionId, sess.traceId)
    for (const entry of sess.timeline ?? []) {
      if (entry.spanId) sessionSpanMap.set(entry.spanId, sess.traceId)
    }
  })
  const groupKeyForSpan = (span: Span) =>
    sessionSpanMap.get(span.spanId) || getCodexSessionId(span) || codexRawTraceSessionMap.get(span.traceId) || span.traceId

  const displayTraceIds = sessions.length > 0
    ? new Set(sessions.map((s: SessionSummaryCard) => s.traceId).filter(Boolean))
    : null

  // All trace IDs that belong to any known completed/synthetic session.
  // Spans outside this set are in-progress and always shown regardless of display limit.
  const allSessionTraceIds = new Set(
    (sessionSummary.value?.sessions ?? []).map(s => s.traceId).filter(Boolean)
  )

  const filtered = wfSpans.filter(s => {
    if (isCodexWebsocketSpan(s)) return false
    const groupKey = groupKeyForSpan(s)
    return !displayTraceIds                       // no sessions yet → show everything
      || displayTraceIds.has(groupKey)            // within the session display window
      || !allSessionTraceIds.has(groupKey)        // not part of any known session (in-progress)
  })

  const traceMap: Record<string, Span[]> = {}
  const traceOrder: string[] = []
  filtered.forEach(s => {
    const groupKey = groupKeyForSpan(s)
    if (!traceMap[groupKey]) { traceMap[groupKey] = []; traceOrder.push(groupKey) }
    traceMap[groupKey].push(s)
  })

  const spanCount = filtered.length
  const traceCount = new Set(filtered.map(s => groupKeyForSpan(s))).size
  const errorCount = filtered.filter(s => s.status?.code === 2).length

  // Build session metadata
  const sessionTraceMap: Record<string, number> = {}
  const sessionPromptMap: Record<string, string> = {}
  const sessionSourceMap: Record<string, string> = {}
  const sessionModelMap: Record<string, string> = {}
  sessions.forEach((sess: SessionSummaryCard) => {
    if (sess.traceId) {
      sessionTraceMap[sess.traceId] = getSessionGlobalNumber(sess)
      sessionPromptMap[sess.traceId] = sess.userRequest ?? ''
      sessionSourceMap[sess.traceId] = sess.source ?? ''
      sessionModelMap[sess.traceId] = sess.model ?? ''
    }
  })

  const reverseOrder = [...traceOrder].reverse()
  const sessionTraceIdsFromSummary = sessions
    .map((sess: SessionSummaryCard) => sess.traceId)
    .filter((traceId): traceId is string => Boolean(traceId && traceMap[traceId]))
  const seenSessionTraceIds = new Set(sessionTraceIdsFromSummary)
  const sessionTraceIdsRev = [
    ...sessionTraceIdsFromSummary.reverse(),
    ...reverseOrder.filter(tid => sessionTraceMap[tid] && !seenSessionTraceIds.has(tid)),
  ]
  const bgTraceIdsRev = reverseOrder.filter(tid => !sessionTraceMap[tid])

  const toRender = sessionTraceIdsRev.length > 0 ? sessionTraceIdsRev : reverseOrder

  return (
    <div id="traces-content">
      <div class="tab-stats">
        <div><strong class="tab-stat-val">{spanCount}</strong> spans</div>
        <div><strong class="tab-stat-val">{traceCount}</strong> traces</div>
        {errorCount > 0 && <div><strong class="tab-stat-val err">{errorCount}</strong> errors</div>}
      </div>
      <div id="traces-content-inner">
        {filtered.length === 0 ? (
          <div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div>
        ) : (
          <>
            <div class="waterfall">
              {toRender.map((tid, i) => {
                const prompt = sessionPromptMap[tid] || (() => {
                  const spans = traceMap[tid] ?? []
                  for (const s of spans) {
                    if (isSessionSpan(s.name)) return extractUserRequest(getSessionUserRequest(s))
                  }
                  return ''
                })()
                return (
                  <TraceGroup
                    key={tid}
                    traceId={tid}
                    traceSpans={traceMap[tid]}
                    sessionNum={sessionTraceMap[tid]}
                    source={sessionSourceMap[tid]}
                    sessionPrompt={prompt}
                    model={sessionModelMap[tid]}
                    isFirst={i === 0}
                  />
                )
              })}
              {bgTraceIdsRev.length > 0 && sessionTraceIdsRev.length > 0 && (
                <BgGroup bgTraceIds={bgTraceIdsRev} traceMap={traceMap} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BgGroup({ bgTraceIds, traceMap }: { bgTraceIds: string[]; traceMap: Record<string, Span[]> }) {
  const [collapsed, setCollapsed] = useState(true)
  const totalBgSpans = bgTraceIds.reduce((s, tid) => s + (traceMap[tid]?.length ?? 0), 0)
  return (
    <div class="sw-bg-group" style="margin-top:16px">
      <div class="sw-bg-header" onClick={() => setCollapsed(c => !c)}>
        <span class="sw-bg-chevron">{collapsed ? '▶' : '▼'}</span>
        <strong>Background Overhead</strong>
        <span class="sw-bg-summary">{bgTraceIds.length} trace{bgTraceIds.length !== 1 ? 's' : ''} · {totalBgSpans} spans</span>
      </div>
      <div class={clsx('sw-bg-body', { collapsed })}>
        {bgTraceIds.map((tid, _i) => (
          <TraceGroup key={tid} traceId={tid} traceSpans={traceMap[tid]} isFirst={false} />
        ))}
      </div>
    </div>
  )
}
