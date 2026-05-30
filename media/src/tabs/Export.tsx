import { useState } from 'preact/hooks'
import { displaySessions, vscode } from '../state'

function send(type: string) {
  if (vscode) {
    vscode.postMessage({ type })
  } else {
    window.dispatchEvent(new MessageEvent('message', { data: { type } }))
  }
}

export function Export() {
  const [rawDone, setRawDone] = useState(false)
  const [redactedDone, setRedactedDone] = useState(false)
  const standalone = !!(window as { __STANDALONE__?: boolean }).__STANDALONE__

  const sessionCount = displaySessions.value.length

  const doExport = () => {
    send('exportSessionData')
    setRawDone(true)
    setTimeout(() => setRawDone(false), 3000)
  }

  const doRedacted = () => {
    send('exportSessionDataRedacted')
    setRedactedDone(true)
    setTimeout(() => setRedactedDone(false), 3000)
  }

  const empty = sessionCount === 0

  return (
    <div id="export-content">
      <div class="export-meta">
        {sessionCount} session{sessionCount !== 1 ? 's' : ''}
        {standalone && <span class="export-meta-mode"> · browser download</span>}
        {!standalone && <span class="export-meta-mode"> · written to workspace root</span>}
      </div>

      <div class="export-cards">

        <div class="export-card">
          <div class="export-card-header">
            <span class="export-card-title">Export OTEL Data</span>
            <span class="export-card-badge export-badge-raw">Raw</span>
          </div>
          <p class="export-card-desc">
            All span attributes exported as-is — includes prompt text, tool inputs,
            tool outputs, and any other captured telemetry.
          </p>
          <ul class="export-card-includes">
            <li>Prompt text and LLM responses</li>
            <li>Tool call inputs and outputs</li>
            <li>Token counts, timing, model names</li>
            <li>File paths and diffs</li>
          </ul>
          <div class="export-card-warning">Keep private — may contain sensitive content.</div>
          <button
            class={'export-btn' + (rawDone ? ' export-btn-done' : '')}
            onClick={doExport}
            disabled={empty}
          >
            {rawDone ? '✓ Exported' : 'Export OTEL Data'}
          </button>
        </div>

        <div class="export-card export-card-redacted">
          <div class="export-card-header">
            <span class="export-card-title">Export Redacted</span>
            <span class="export-card-badge export-badge-redacted">Safer to share</span>
          </div>
          <p class="export-card-desc">
            Same export with all sensitive values replaced by <code>[redacted]</code>
            before the file is written. Safe to attach to bug reports or share with teammates.
          </p>
          <ul class="export-card-includes">
            <li><span class="export-redacted-label">[redacted]</span> Prompt text and LLM responses</li>
            <li><span class="export-redacted-label">[redacted]</span> Tool call inputs and outputs</li>
            <li>✓ Token counts, timing, model names</li>
            <li>✓ Span structure and trace IDs</li>
            <li><span class="export-redacted-label">[redacted]</span> user.id, user.email, org.*</li>
          </ul>
          <div class="export-card-safe">Safer to share — review before sending, as file paths and custom attributes are not redacted.</div>
          <button
            class={'export-btn export-btn-secondary' + (redactedDone ? ' export-btn-done' : '')}
            onClick={doRedacted}
            disabled={empty}
          >
            {redactedDone ? '✓ Exported' : 'Export Redacted'}
          </button>
        </div>

      </div>

      <div class="export-replay-box">
        <div class="export-replay-title">Replay an export in the dashboard</div>
        <p class="export-replay-desc">
          Replay any exported file to re-examine a past session without running an agent.
          Works with both the VS Code extension and the standalone server — whichever is
          on port <code>4318</code>.
        </p>
        <pre class="export-replay-cmd">pnpm run demo -- --file ./export_redacted_claude_main_20260522_152343.json</pre>
        <p class="export-replay-note">
          Each replay assigns fresh trace IDs so the session appears as a new entry.
          Pass <code>--speed 4</code> to pace the replay instead of sending all spans at once.
        </p>
      </div>
    </div>
  )
}
