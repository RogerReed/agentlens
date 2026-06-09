import { useState } from 'preact/hooks'
import { enableOtelIngestion, enableLogIngestion, otlpPort, vscode } from '../state'

function sendConfig(key: string, value: boolean) {
  if (vscode) {
    vscode.postMessage({ type: 'setVsCodeConfig', key, value })
  }
}

export function sendConfirmClear() {
  if (vscode) {
    vscode.postMessage({ type: 'confirmClear' })
  } else {
    if (!confirm('Clear all AgentLens session data? This cannot be undone.')) return
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
