import { useState } from 'preact/hooks'
import clsx from 'clsx'
import { displaySpans } from '../state'
import { nanoToMs, formatMs, getAgentColor, getAgentSourceLabel, inferSpanSource } from '../utils'
import type { Span } from '../types'

function TimelineItem({ span, idx }: { span: Span; idx: number }) {
  const [open, setOpen] = useState(false)
  const st = nanoToMs(span.startTime)
  const dur = nanoToMs(span.endTime) - st
  const timeStr = st > 0 ? new Date(st).toLocaleTimeString() : ''
  const source = inferSpanSource(span)
  const sourceLabel = source ? getAgentSourceLabel(source) : 'Unknown'
  const dotColor = getAgentColor(source)

  const attrObj: Record<string, unknown> = {}
  ;(span.attributes ?? []).forEach(a => {
    const v = a.value
    let val: unknown = v.stringValue ?? v.intValue ?? v.doubleValue ?? v.boolValue ?? v.arrayValue ?? v.kvlistValue ?? ''
    if (typeof val === 'string' && val.length > 200) val = val.slice(0, 200) + '… (' + val.length + ' chars)'
    attrObj[a.key] = val
  })
  const jsonStr = JSON.stringify(attrObj, null, 2)

  return (
    <div class="timeline-item" style="cursor:pointer" onClick={() => setOpen(o => !o)}>
      <div class="timeline-dot" style={'background:' + dotColor} />
      <div class="timeline-content">
        <div class="time">{timeStr}{dur > 0 ? ' · ' + formatMs(dur) : ''}</div>
        <div class="name">
          {span.name}{' '}
          <span style="font-size:10px;color:var(--muted)">({sourceLabel})</span>{' '}
          <span class="tl-chevron" style="font-size:9px;color:var(--muted)">{open ? '▼' : '▶'}</span>
        </div>
        <div id={'tl-detail-' + idx} class={clsx('tl-detail', { open })}>
          <pre class="tl-detail-pre">{jsonStr}</pre>
        </div>
      </div>
    </div>
  )
}

export function Timeline() {
  const spans = displaySpans.value
  if (spans.length === 0) {
    return <div class="empty-state">No spans received yet — start a Copilot, Claude, or Codex session</div>
  }

  const sorted = spans.slice().sort((a, b) => nanoToMs(b.startTime) - nanoToMs(a.startTime))

  return (
    <div id="timeline-content">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:10px;font-size:11px;color:var(--muted)">
        <span style="font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.4px">Agent Key</span>
        <span><span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + getAgentColor('copilot') + ';margin-right:5px'} />Copilot</span>
        <span><span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + getAgentColor('codex') + ';margin-right:5px'} />Codex</span>
        <span><span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + getAgentColor('claude_code') + ';margin-right:5px'} />Claude</span>
      </div>
      <div class="timeline-container">
        <div class="timeline-line" />
        {sorted.slice(0, 50).map((s, idx) => (
          <TimelineItem key={s.spanId + '-' + idx} span={s} idx={idx} />
        ))}
      </div>
    </div>
  )
}
