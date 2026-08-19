import { useEffect, useState } from 'preact/hooks'
import { enableOtelIngestion, enableLogIngestion, otlpPort, vscode, otelReconfigureResult, type OtelReconfigureResult } from '../state'

function sendConfig(key: string, value: boolean) {
  if (vscode) {
    vscode.postMessage({ type: 'setVsCodeConfig', key, value })
  }
}

const CLEAR_ALL_CONFIRM_TEXT = 'Clear all AgentLens data? OTEL session data is deleted permanently. AgentLens log cache is cleared and will be rebuilt from your local agent log files (the log files themselves are not deleted).'

export function sendConfirmClear() {
  if (vscode) {
    vscode.postMessage({ type: 'confirmClear' })
  } else {
    if (!confirm(CLEAR_ALL_CONFIRM_TEXT)) return
    fetch('/action', { method: 'POST', body: JSON.stringify({ type: 'clearAll' }),
      headers: { 'Content-Type': 'application/json' } })
  }
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--fg)">{label}</div>
        {description && <div style="font-size:11px;color:var(--muted);margin-top:2px">{description}</div>}
      </div>
      <label class="toggle-switch" style="margin:0">
        <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
        <span class="toggle-track"><span class="toggle-thumb" /></span>
        <span class={'toggle-label' + (checked ? ' on' : '')}>{checked ? 'Enabled' : 'Disabled'}</span>
      </label>
    </div>
  )
}

export function IngestionToggles() {
  const otelOn = enableOtelIngestion.value
  const logOn = enableLogIngestion.value
  const port = otlpPort.value

  return (
    <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
      <div style="font-size:12px;font-weight:600;color:var(--fg);margin-bottom:6px">Data Ingestion</div>
      <ToggleRow
        label="Accept OTEL spans"
        description={`Server stays running on port ${port}; turning this off silently drops incoming data.`}
        checked={otelOn}
        onChange={v => sendConfig('enableOtelIngestion', v)}
      />
      <ToggleRow
        label="Read session logs"
        description="Scans local Claude Code, Codex, and Copilot log files."
        checked={logOn}
        onChange={v => sendConfig('enableLogIngestion', v)}
      />
      <div style="padding-top:10px;margin-top:4px;border-top:1px solid var(--border)">
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">Permanently deletes all stored sessions. Log-sourced sessions rebuild from local log files on next scan.</div>
        <button
          onClick={sendConfirmClear}
          style="padding:3px 10px;font-size:11px;cursor:pointer;border:1px solid var(--vscode-testing-iconFailed,#f44);border-radius:3px;background:transparent;color:var(--vscode-testing-iconFailed,#f44)"
        >
          Clear All Data
        </button>
      </div>
    </div>
  )
}

function summarizeReconfigure(result: OtelReconfigureResult): string {
  if ('error' in result) return `Failed: ${result.error}`
  const labels: Record<string, string> = { claudeCode: 'Claude Code', codex: 'Codex', copilot: 'Copilot' }
  const changed = Object.entries(result).filter(([, r]) => r.changed).map(([k]) => labels[k])
  const errors = Object.entries(result).filter(([, r]) => r.error).map(([k, r]) => `${labels[k]} (${r.error})`)
  if (errors.length > 0) return `Failed: ${errors.join(', ')}`
  if (changed.length === 0) return 'Already up to date — no changes needed.'
  return `Configured: ${changed.join(', ')}. Restart the agent(s) to start streaming traces.`
}

export function OtelReconfigureButton() {
  const [running, setRunning] = useState(false)
  const result = otelReconfigureResult.value

  function run() {
    setRunning(true)
    otelReconfigureResult.value = null
    if (vscode) {
      vscode.postMessage({ type: 'reconfigureOtel' })
    } else {
      fetch('/action', { method: 'POST', body: JSON.stringify({ type: 'reconfigureOtel' }),
        headers: { 'Content-Type': 'application/json' } })
        .then(r => r.json())
        .then(results => { otelReconfigureResult.value = results })
        .catch(e => { otelReconfigureResult.value = { error: String(e) } })
        .finally(() => setRunning(false))
    }
  }

  useEffect(() => {
    if (result) setRunning(false)
  }, [result])

  return (
    <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
      <div style="font-size:12px;font-weight:600;color:var(--fg);margin-bottom:4px">Configure OTEL</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">
        Re-applies AgentLens's OTEL settings to Claude Code, Codex, and Copilot. AgentLens already does this automatically on startup — use this if you changed one of those agent's telemetry settings yourself and want to point it back at AgentLens.
      </div>
      <button
        onClick={run}
        disabled={running}
        style="padding:3px 10px;font-size:11px;cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--fg)"
      >
        {running ? 'Configuring…' : 'Configure OTEL'}
      </button>
      {result && <div style="font-size:11px;color:var(--muted);margin-top:6px">{summarizeReconfigure(result)}</div>}
    </div>
  )
}

export function McpToggle() {
  const w = window as unknown as Record<string, unknown>
  const [enabled, setEnabled] = useState(typeof w.__MCP_ENABLED__ === 'boolean' ? w.__MCP_ENABLED__ as boolean : true)
  const port = typeof w.__MCP_PORT__ === 'number' ? w.__MCP_PORT__ as number : 4316

  function toggle() {
    const next = !enabled
    setEnabled(next)
    sendConfig('enableMcpServer', next)
  }

  return (
    <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:var(--fg)">MCP Server</span>
        <label class="toggle-switch" style="margin:0">
          <input type="checkbox" checked={enabled} onChange={toggle} />
          <span class="toggle-track"><span class="toggle-thumb" /></span>
          <span class={'toggle-label' + (enabled ? ' on' : '')}>{enabled ? 'Enabled' : 'Disabled'}</span>
        </label>
      </div>
      {enabled && (
        <div style="font-size:11px;color:var(--muted)">
          Listening at <code style="font-size:10px;background:var(--card-bg);padding:1px 4px;border-radius:3px">http://localhost:{port}/mcp</code>
        </div>
      )}
      <div style="font-size:10px;color:var(--muted);margin-top:4px">Restart to apply changes.</div>
    </div>
  )
}
