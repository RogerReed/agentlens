import { useState } from 'preact/hooks'
import clsx from 'clsx'
import { displaySpans, displaySessions } from '../state'
import {
  nanoToMs, formatMs, spanTypeBadge,
  getAgentColor, getAgentSourceLabel, inferSpanSource,
} from '../utils'
import type { Span, SessionSummaryCard } from '../types'

function ErrorItem({ span, source }: { span: Span; source: string | null }) {
  const [open, setOpen] = useState(false)
  const st = nanoToMs(span.startTime)
  const en = nanoToMs(span.endTime)
  const dur = en - st
  const badge = spanTypeBadge(span)
  const statusMsg = span.status?.message ?? ''
  const dotColor = source ? getAgentColor(source) : null

  const detailLines = [
    { k: 'Span Name', v: span.name ?? '—' },
    { k: 'Span ID', v: span.spanId ?? '—' },
    { k: 'Trace ID', v: span.traceId ?? '—' },
    ...(span.parentSpanId ? [{ k: 'Parent Span ID', v: span.parentSpanId }] : []),
    { k: 'Start Time', v: st > 0 ? new Date(st).toISOString() : '—' },
    { k: 'End Time', v: en > 0 ? new Date(en).toISOString() : '—' },
    { k: 'Duration', v: dur > 0 ? formatMs(dur) : '—' },
    ...(span.attributes ?? []).map(a => {
      const v = a.value
      const display = v.stringValue ?? v.intValue ?? v.doubleValue ?? v.boolValue
      return { k: a.key, v: String(display ?? JSON.stringify(v)) }
    }),
  ]

  return (
    <div class={clsx('error-item', { open })}>
      <div class="error-item-header" onClick={() => setOpen(o => !o)} data-error-id={span.spanId}>
        <span class="error-chevron">{open ? '▼' : '▶'}</span>
        <span class="wf-type-badge" style={'background:' + badge.color + ';color:#000'}>{badge.label}</span>
        <span class="error-name">
          {dotColor && (
            <span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dotColor + ';vertical-align:middle;margin-right:4px'} title={source ? getAgentSourceLabel(source) : ''} />
          )}
          {span.name}
        </span>
        <span class="error-dur">{formatMs(dur)}</span>
        {st > 0 && <span class="error-time">{new Date(st).toLocaleTimeString()}</span>}
      </div>
      <div class={clsx('error-detail', { open })}>
        {statusMsg && <div class="error-message">{statusMsg}</div>}
        {detailLines.map(dl => (
          <div key={dl.k} class="wf-detail-row">
            <span class="wf-detail-key">{dl.k}</span>
            <span class="wf-detail-val">{dl.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Errors() {
  const spans = displaySpans.value
  const sessions = displaySessions.value

  const traceSourceMap: Record<string, string> = {}
  sessions.forEach((sess: SessionSummaryCard) => {
    if (sess.traceId && sess.source) traceSourceMap[sess.traceId] = sess.source
  })

  const errorSpans = spans
    .filter(s => s.status?.code === 2)
    .sort((a, b) => nanoToMs(b.startTime) - nanoToMs(a.startTime))

  if (errorSpans.length === 0) {
    return <div id="errors-content"><div class="empty-state">No errors recorded</div></div>
  }

  return (
    <div id="errors-content">
      <div class="error-list">
        {errorSpans.map(s => {
          const src = (s.traceId && traceSourceMap[s.traceId]) || inferSpanSource(s) || null
          return <ErrorItem key={s.spanId} span={s} source={src} />
        })}
      </div>
    </div>
  )
}
