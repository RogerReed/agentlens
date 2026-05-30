import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'
import type { SessionSummaryCard, TimelineEntry, EditDetail } from '../summarizers/summarizerTypes'

interface ReadableDb {
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>
}

export class DatabaseReader {
  constructor(
    private readonly db: ReadableDb,
    private readonly storageUri: vscode.Uri,
  ) {}

  listSessions(filter?: {
    source?: 'copilot' | 'claude_code' | 'codex'
    since?: number
    limit?: number
  }): SessionSummaryCard[] {
    let sql = 'SELECT * FROM sessions'
    const conditions: string[] = []

    if (filter?.source) {
      conditions.push(`source = '${filter.source}'`)
    }
    if (filter?.since != null) {
      conditions.push(`start_time >= ${filter.since}`)
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    sql += ' ORDER BY start_time DESC'
    if (filter?.limit != null) {
      sql += ` LIMIT ${filter.limit}`
    }

    const results = this.db.exec(sql)
    if (!results[0]) return []

    const { columns, values } = results[0]
    const col = (row: unknown[], name: string) => row[columns.indexOf(name)]

    return values.map(row => {
      const startMs = col(row, 'start_time') as number
      return {
        sessionId:        col(row, 'session_id') as string,
        traceId:          col(row, 'trace_id') as string,
        source:           col(row, 'source') as 'copilot' | 'claude_code' | 'codex',
        userRequest:      (col(row, 'user_request') as string) ?? '',
        model:            (col(row, 'model') as string) ?? '',
        turns:            (col(row, 'turns') as number) ?? 0,
        inputTokens:      (col(row, 'input_tokens') as number) ?? 0,
        outputTokens:     (col(row, 'output_tokens') as number) ?? 0,
        cacheReadTokens:  (col(row, 'cache_read_tokens') as number) ?? 0,
        cacheCreateTokens:(col(row, 'cache_create_tokens') as number) ?? 0,
        cacheHitRate:     (col(row, 'cache_hit_rate') as number) ?? 0,
        durationMs:       (col(row, 'duration_ms') as number) ?? 0,
        startTime:        startMs > 0 ? new Date(startMs).toISOString() : '',
        filesRead:        this._parseJson<string[]>(col(row, 'files_read') as string, []),
        filesSearched:    this._parseJson<string[]>(col(row, 'files_searched') as string, []),
        filesChanged:     this._parseJson<string[]>(col(row, 'files_changed') as string, []),
        filesChangedNote: (col(row, 'files_changed_note') as string | null) ?? undefined,
        toolCounts:       this._parseJson<Record<string, number>>(col(row, 'tool_counts') as string, {}),
        totalToolCalls:   (col(row, 'total_tool_calls') as number) ?? 0,
        totalLlmCalls:    (col(row, 'total_llm_calls') as number) ?? 0,
        errors:           (col(row, 'errors') as number) ?? 0,
        outcome:          (col(row, 'outcome') as 'text_response' | 'tool_calls' | 'unknown') ?? 'unknown',
        loopSignals:      this._parseJson(col(row, 'loop_signals') as string, []),
        timeline:         [],
        backgroundSpans:  [],
      } satisfies SessionSummaryCard
    })
  }

  loadSessionTimeline(sessionId: string): TimelineEntry[] {
    const entryResults = this.db.exec(
      `SELECT * FROM timeline_entries WHERE session_id = '${this._esc(sessionId)}' ORDER BY position ASC`
    )
    if (!entryResults[0]) return []

    const { columns: ec, values: ev } = entryResults[0]
    const ecol = (row: unknown[], name: string) => row[ec.indexOf(name)]

    const entryIds: number[] = []
    const entries: TimelineEntry[] = ev.map(row => {
      const id = ecol(row, 'id') as number
      entryIds.push(id)
      return {
        type:         ecol(row, 'type') as TimelineEntry['type'],
        spanId:       ecol(row, 'span_id') as string,
        label:        (ecol(row, 'label') as string) ?? '',
        model:        (ecol(row, 'model') as string | null) ?? undefined,
        inputTokens:  (ecol(row, 'input_tokens') as number | null) ?? undefined,
        outputTokens: (ecol(row, 'output_tokens') as number | null) ?? undefined,
        ttft:         (ecol(row, 'ttft') as number | null) ?? undefined,
        durationMs:   (ecol(row, 'duration_ms') as number) ?? 0,
        action:       (ecol(row, 'action') as string | null) ?? undefined,
        decision:     (ecol(row, 'decision') as string | null) ?? undefined,
        isError:      ((ecol(row, 'is_error') as number) ?? 0) === 1,
        errorMessage: (ecol(row, 'error_message') as string | null) ?? undefined,
        timestamp:    (ecol(row, 'timestamp') as string) ?? '',
      } satisfies TimelineEntry
    })

    if (entryIds.length === 0) return entries

    // Load edit_details for all entries in one query using IN clause.
    const idList = entryIds.join(',')
    const editResults = this.db.exec(
      `SELECT * FROM edit_details WHERE timeline_entry_id IN (${idList}) ORDER BY timeline_entry_id, id ASC`
    )

    if (editResults[0]) {
      const { columns: dc, values: dv } = editResults[0]
      const dcol = (row: unknown[], name: string) => row[dc.indexOf(name)]

      const editsByEntry = new Map<number, EditDetail[]>()
      for (const row of dv) {
        const entryId = dcol(row, 'timeline_entry_id') as number
        if (!editsByEntry.has(entryId)) editsByEntry.set(entryId, [])
        editsByEntry.get(entryId)!.push({
          filePath: (dcol(row, 'file_path') as string) ?? '',
          toolName: (dcol(row, 'tool_name') as string | null) ?? undefined,
          // Blob string fields (oldString, newString) are omitted here — loaded via loadBlob.
        })
      }

      for (let i = 0; i < entries.length; i++) {
        const edits = editsByEntry.get(entryIds[i])
        if (edits) entries[i].editDetails = edits
      }
    }

    return entries
  }

  async loadBlob(
    spanId: string,
    field: 'response' | 'thinking' | 'tool-input' | 'full-result' | 'edit-old' | 'edit-new',
    editIndex?: number,
  ): Promise<string | null> {
    const filename = this._blobFilename(spanId, field, editIndex)
    const fileUri = vscode.Uri.joinPath(this.storageUri, 'blobs', filename)
    try {
      const data = await vscode.workspace.fs.readFile(fileUri)
      return Buffer.from(data).toString('utf8')
    } catch {
      return null
    }
  }

  private _blobFilename(spanId: string, field: string, editIndex?: number): string {
    if (field === 'edit-old') return `${spanId}-${editIndex ?? 0}-old.txt`
    if (field === 'edit-new') return `${spanId}-${editIndex ?? 0}-new.txt`
    const suffixMap: Record<string, string> = {
      'response': 'response.txt',
      'thinking': 'thinking.txt',
      'tool-input': 'tool-input.txt',
      'full-result': 'full-result.txt',
    }
    return `${spanId}-${suffixMap[field] ?? field}`
  }

  private _parseJson<T>(raw: string | null | undefined, fallback: T): T {
    if (!raw) return fallback
    try { return JSON.parse(raw) as T } catch { return fallback }
  }

  private _esc(s: string): string {
    return s.replace(/'/g, "''")
  }
}

/**
 * Opens the DB file at storagePath using a fresh fs.readFileSync snapshot.
 * Used by non-collector windows for cross-window sync — safe for concurrent reads
 * since sql.js loads the entire file into memory.
 */
export function openReadonlySnapshot(
  storagePath: string,
  storageUri: vscode.Uri,
): DatabaseReader | null {
  const dbPath = path.join(storagePath, 'agentlens.db')
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
    const SQL = (require('sql.js') as any)
    const fileBuffer = fs.readFileSync(dbPath)
    const db = new SQL.Database(fileBuffer)
    return new DatabaseReader(db, storageUri)
  } catch {
    return null
  }
}
