import { useState } from 'preact/hooks'
import { displaySessions, sessionTimelines, vscode } from '../state'
import { getAgentColor, getAgentSourceLabel, getSessionGlobalNumber } from '../utils'
import type { SessionSummaryCard, TimelineEntry } from '../types'

function requestTimeline(sessionId: string) {
  if (vscode) {
    vscode.postMessage({ type: 'loadSessionDetail', sessionId })
  }
}

function ErrorEntry({ entry }: { entry: TimelineEntry }) {
  const [open, setOpen] = useState(false)
  return (
    <div class="error-item" style="margin-left:12px;margin-bottom:4px">
      <div class="error-item-header" onClick={() => setOpen(o => !o)} style="cursor:pointer">
        <span class="error-chevron">{open ? '▼' : '▶'}</span>
        <span style="font-size:11px;font-weight:600">{entry.label}</span>
        {entry.durationMs > 0 && <span style="font-size:10px;color:var(--muted);margin-left:8px">{entry.durationMs}ms</span>}
      </div>
      {open && entry.errorMessage && (
        <div class="wf-detail-row" style="padding-left:20px;margin-top:4px">
          <span class="wf-detail-key">Message</span>
          <span class="wf-detail-val" style="color:var(--error)">{entry.errorMessage}</span>
        </div>
      )}
      {open && entry.timestamp && (
        <div class="wf-detail-row" style="padding-left:20px">
          <span class="wf-detail-key">Time</span>
          <span class="wf-detail-val">{entry.timestamp}</span>
        </div>
      )}
    </div>
  )
}

function SessionErrorGroup({ sess }: { sess: SessionSummaryCard }) {
  const [open, setOpen] = useState(false)
  const timelines = sessionTimelines.value
  const timeline = timelines[sess.sessionId]
  const errorEntries = timeline?.filter(e => e.isError) ?? []
  const dotColor = getAgentColor(sess.source)

  const toggle = () => {
    if (!open && !timeline) { requestTimeline(sess.sessionId) }
    setOpen(o => !o)
  }

  return (
    <div class="error-item" style="margin-bottom:8px">
      <div class="error-item-header" onClick={toggle} style="cursor:pointer">
        <span class="error-chevron">{open ? '▼' : '▶'}</span>
        <span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dotColor + ';margin-right:6px;vertical-align:middle'} title={getAgentSourceLabel(sess.source)} />
        <span class="error-name">{sess.userRequest || '[session]'}</span>
        <span style="font-size:10px;color:var(--error);margin-left:auto;white-space:nowrap">
          {sess.errors} error{sess.errors !== 1 ? 's' : ''}
        </span>
        <span style="font-size:10px;color:var(--muted);margin-left:8px">
          #{getSessionGlobalNumber(sess) || sess.sessionId.slice(0, 8)}
        </span>
      </div>
      {open && (
        <div style="padding-top:4px">
          {!timeline && <div style="font-size:11px;color:var(--muted);padding-left:20px">Loading timeline…</div>}
          {timeline && errorEntries.length === 0 && (
            <div style="font-size:11px;color:var(--muted);padding-left:20px">No individual error entries found in timeline.</div>
          )}
          {errorEntries.map((e, i) => <ErrorEntry key={e.spanId + i} entry={e} />)}
        </div>
      )}
    </div>
  )
}

export function Errors() {
  const sessions = displaySessions.value
  const errorSessions = sessions.filter(s => s.errors > 0)

  if (sessions.length === 0) {
    return <div id="errors-content"><div class="empty-state">No agent sessions recorded — start a Copilot, Claude, or Codex session</div></div>
  }
  if (errorSessions.length === 0) {
    return <div id="errors-content"><div class="empty-state">No errors recorded in the current session window</div></div>
  }

  return (
    <div id="errors-content">
      <div class="tab-stats" style="margin-bottom:12px">
        <div><strong class="tab-stat-val err">{errorSessions.reduce((a, s) => a + s.errors, 0)}</strong> total errors</div>
        <div><strong class="tab-stat-val">{errorSessions.length}</strong> session{errorSessions.length !== 1 ? 's' : ''} affected</div>
      </div>
      <div class="errors-list">
        {errorSessions.map(sess => (
          <SessionErrorGroup key={sess.sessionId} sess={sess} />
        ))}
      </div>
    </div>
  )
}
