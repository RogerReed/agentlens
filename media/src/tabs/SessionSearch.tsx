import { useState, useRef, useEffect } from 'preact/hooks'
import { searchResults, vscode } from '../state'
import { getAgentColor, getAgentSourceLabel, formatCompact, formatMs, formatSessionTime } from '../utils'
import type { SearchQuery } from '../types'

const DATE_PRESETS: Array<{ label: string; sinceMs: number | null }> = [
  { label: 'All time',    sinceMs: null },
  { label: 'Today',       sinceMs: -1 },    // -1 = resolve at search time to start-of-today
  { label: 'Last 7 days', sinceMs: 7  * 86_400_000 },
  { label: 'Last 30 days',sinceMs: 30 * 86_400_000 },
]

function resolveSince(sinceMs: number | null): number | undefined {
  if (sinceMs === null) return undefined
  if (sinceMs === -1) {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime()
  }
  return Date.now() - sinceMs
}

const SORT_OPTIONS: Array<{ label: string; orderBy: SearchQuery['orderBy']; dir: 'ASC' | 'DESC' }> = [
  { label: 'Recent',        orderBy: 'start_time',   dir: 'DESC' },
  { label: 'Most expensive',orderBy: 'cost_usd',     dir: 'DESC' },
  { label: 'Longest',       orderBy: 'duration_ms',  dir: 'DESC' },
  { label: 'Most tokens',   orderBy: 'total_tokens', dir: 'DESC' },
  { label: 'Most errors',   orderBy: 'errors',       dir: 'DESC' },
]

export function SessionSearch() {
  const [text, setText] = useState('')
  const [dateIdx, setDateIdx] = useState(0)
  const [sortIdx, setSortIdx] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { sendSearch() }, [])

  function sendSearch(overrides: Partial<{ text: string; dateIdx: number; sortIdx: number }> = {}) {
    const t    = overrides.text    !== undefined ? overrides.text    : text
    const dIdx = overrides.dateIdx !== undefined ? overrides.dateIdx : dateIdx
    const sIdx = overrides.sortIdx !== undefined ? overrides.sortIdx : sortIdx

    const sinceVal = resolveSince(DATE_PRESETS[dIdx].sinceMs)
    const sort = SORT_OPTIONS[sIdx]
    const query: SearchQuery = {
      text:     t || undefined,
      since:    sinceVal,
      orderBy:  sort.orderBy,
      orderDir: sort.dir,
      limit:    50,
      offset:   0,
    }
    vscode?.postMessage({ type: 'searchSessions', query })
  }

  function handleTextChange(newText: string) {
    setText(newText)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => sendSearch({ text: newText }), 300)
  }

  function handleDateChange(idx: number) { setDateIdx(idx); sendSearch({ dateIdx: idx }) }
  function handleSortChange(idx: number) { setSortIdx(idx); sendSearch({ sortIdx: idx }) }

  const results = searchResults.value

  return (
    <div id="search-content">
      {/* Controls */}
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <input
          type="text"
          placeholder="Search by session request…"
          value={text}
          onInput={e => handleTextChange((e.target as HTMLInputElement).value)}
          style="flex:1;min-width:180px;padding:5px 8px;font-size:12px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
        />
      </div>

      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
        <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
          <span style="font-size:10px;color:var(--muted);margin-right:2px">Date</span>
          {DATE_PRESETS.map((p, i) => (
            <button
              key={i}
              class={'tab-mini' + (dateIdx === i ? ' active' : '')}
              onClick={() => handleDateChange(i)}
            >{p.label}</button>
          ))}
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
          <span style="font-size:10px;color:var(--muted);margin-right:2px">Sort</span>
          {SORT_OPTIONS.map((s, i) => (
            <button
              key={i}
              class={'tab-mini' + (sortIdx === i ? ' active' : '')}
              onClick={() => handleSortChange(i)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      {!results && (
        <div class="empty-state">Enter a search term or change filters to search historical sessions.</div>
      )}
      {results && results.sessions.length === 0 && (
        <div class="empty-state">No sessions matched.</div>
      )}
      {results && results.sessions.length > 0 && (
        <>
          <div style="font-size:10px;color:var(--muted);margin-bottom:8px">
            Showing {results.sessions.length} of {results.totalCount} result{results.totalCount !== 1 ? 's' : ''}
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:11px">
              <thead>
                <tr style="border-bottom:1px solid var(--vscode-panel-border);color:var(--muted);text-align:left">
                  <th style="padding:4px 8px">Agent</th>
                  <th style="padding:4px 8px">Request</th>
                  <th style="padding:4px 8px">Date</th>
                  <th style="padding:4px 8px;text-align:right">Tokens</th>
                  <th style="padding:4px 8px;text-align:right">Duration</th>
                  <th style="padding:4px 8px;text-align:right">Errors</th>
                </tr>
              </thead>
              <tbody>
                {results.sessions.map(s => (
                  <tr key={s.sessionId} style="border-bottom:1px solid var(--vscode-panel-border)">
                    <td style="padding:4px 8px;white-space:nowrap">
                      <span style={'display:inline-block;width:6px;height:6px;border-radius:50%;background:' + getAgentColor(s.source) + ';margin-right:4px;vertical-align:middle'} />
                      {getAgentSourceLabel(s.source)}
                    </td>
                    <td style="padding:4px 8px;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title={s.userRequest}>
                      {s.userRequest || <span style="color:var(--muted);font-style:italic">—</span>}
                    </td>
                    <td style="padding:4px 8px;color:var(--muted);font-size:10px;white-space:nowrap">
                      {formatSessionTime(s)}
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
            {results.totalCount > results.sessions.length && (
              <div style="font-size:10px;color:var(--muted);padding:8px">
                {results.totalCount - results.sessions.length} more — refine your search to narrow down.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
