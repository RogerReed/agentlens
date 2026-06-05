import { useState } from 'preact/hooks'
import { filteredSessions, vscode } from '../state'

function send(type: string, sessionIds: string[]) {
  if (vscode) {
    vscode.postMessage({ type, sessionIds })
  } else {
    window.dispatchEvent(new MessageEvent('message', { data: { type, sessionIds } }))
  }
}

export function Export() {
  const [rawDone, setRawDone] = useState(false)
  const [redactedDone, setRedactedDone] = useState(false)

  const sessions = filteredSessions.value
  const empty = sessions.length === 0

  const doExport = () => {
    send('exportSessionData', sessions.map(s => s.sessionId))
    setRawDone(true)
    setTimeout(() => setRawDone(false), 3000)
  }

  const doRedacted = () => {
    send('exportSessionDataRedacted', sessions.map(s => s.sessionId))
    setRedactedDone(true)
    setTimeout(() => setRedactedDone(false), 3000)
  }

  return (
    <div id="export-content">

      <div class="export-cards">

        <div class="export-card">
          <div class="export-card-header">
            <span class="export-card-title">Export Session Data</span>
            <span class="export-card-badge export-badge-raw">Full</span>
          </div>
          <p class="export-card-desc">
            All recorded sessions exported as JSON — includes prompt text, token counts,
            tool usage, file changes, cost estimates, and efficiency signals.
          </p>
          <ul class="export-card-includes">
            <li>Prompt text (userRequest)</li>
            <li>Token counts, cache stats, model names</li>
            <li>Tool call counts and file paths changed</li>
            <li>Duration, errors, outcome, loop signals</li>
          </ul>
          <div class="export-card-warning">Keep private — includes prompt text.</div>
          <button
            class={'export-btn' + (rawDone ? ' export-btn-done' : '')}
            onClick={doExport}
            disabled={empty}
          >
            {rawDone ? '✓ Exported' : 'Export Session Data'}
          </button>
        </div>

        <div class="export-card export-card-redacted">
          <div class="export-card-header">
            <span class="export-card-title">Export Session Data (Redacted)</span>
            <span class="export-card-badge export-badge-redacted">Safer to share</span>
          </div>
          <p class="export-card-desc">
            Same export with prompt text and file paths replaced. Safe to attach to bug reports
            or share with teammates for cost and efficiency analysis.
          </p>
          <ul class="export-card-includes">
            <li><span class="export-redacted-label">[redacted]</span> Prompt text</li>
            <li><span class="export-redacted-label">[redacted]</span> File names and paths</li>
            <li>✓ Token counts, cache stats, model names</li>
            <li>✓ Tool call counts (no paths)</li>
            <li>✓ Duration, errors, outcome, loop signals</li>
          </ul>
          <div class="export-card-safe">Safer to share — no prompt text or file paths.</div>
          <button
            class={'export-btn export-btn-secondary' + (redactedDone ? ' export-btn-done' : '')}
            onClick={doRedacted}
            disabled={empty}
          >
            {redactedDone ? '✓ Exported' : 'Export Session Data (Redacted)'}
          </button>
        </div>

      </div>

      <div class="export-replay-box">
        <div class="export-replay-title">About session data exports</div>
        <p class="export-replay-desc">
          These exports contain aggregated session summaries — token counts, tool usage,
          cost estimates, file changes, and efficiency signals. They are useful for
          cost analysis, sharing with teammates, and offline review.
        </p>
        <p class="export-replay-note">
          <strong>Note:</strong> Session summary exports cannot be replayed with
          <code>pnpm run demo --file</code>. Replay requires raw OTEL span data,
          which is not yet persisted to disk. See the open issue for raw span export support.
        </p>
      </div>
    </div>
  )
}
