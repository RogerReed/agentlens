import { sessionSummary, filteredSessions } from '../state'
import { getAgentColor, formatCompact, formatMs, formatSessionTime } from '../utils'

export function SessionSearch() {
  const results = filteredSessions.value
  const hasAny = (sessionSummary.value?.sessions?.length ?? 0) > 0

  if (results.length === 0) {
    return (
      <div id="search-content">
        <div class="empty-state">{hasAny ? 'No sessions match the active filters.' : 'No sessions recorded yet.'}</div>
      </div>
    )
  }

  return (
    <div id="search-content">
      <div style="font-size:10px;color:var(--muted);margin-bottom:8px">
        {results.length} session{results.length !== 1 ? 's' : ''}
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <thead>
            <tr style="border-bottom:1px solid var(--vscode-panel-border);color:var(--muted);text-align:left">
              <th style="padding:4px 8px;min-width:130px">Session</th>
              <th style="padding:4px 8px;text-align:right">Tokens</th>
              <th style="padding:4px 8px;text-align:right">Duration</th>
              <th style="padding:4px 8px;text-align:right">Errors</th>
            </tr>
          </thead>
          <tbody>
            {results.map(s => (
              <tr key={s.sessionId} style="border-bottom:1px solid var(--vscode-panel-border)">
                <td style="padding:4px 8px">
                  <div style="display:flex;align-items:flex-start;gap:4px">
                    <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:2px;background:' + getAgentColor(s.source)} />
                    <div>
                      <div style="font-size:10px;color:var(--foreground);white-space:nowrap">{formatSessionTime(s)}</div>
                      {(s.userRequest ?? '').length > 0
                        ? <div style="font-size:9px;color:var(--muted);margin-top:1px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic" title={s.userRequest}>{s.userRequest}</div>
                        : <div style="font-size:9px;color:var(--muted);font-style:italic">—</div>
                      }
                    </div>
                  </div>
                </td>
                <td style="padding:4px 8px;text-align:right">{formatCompact(s.inputTokens + s.outputTokens)}</td>
                <td style="padding:4px 8px;text-align:right;color:var(--muted)">{formatMs(s.durationMs)}</td>
                <td style="padding:4px 8px;text-align:right">
                  {s.errors > 0 ? <span style="color:var(--vscode-charts-red,#e57373)">{s.errors}</span> : <span style="color:var(--muted)">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
