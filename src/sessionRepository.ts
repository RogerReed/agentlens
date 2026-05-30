import * as fs from 'fs'
import * as vscode from 'vscode'
import { SessionStore } from './sessionStore'
import { DatabaseReader, type DailyStatRow, type LifetimeStats, type SearchQuery, type BurnRate, type Projection } from './database/reader'
import { DatabaseWriter } from './database/writer'
import { summarizeSpans } from './spanSummarizer'
import type { SessionSummaryCard, TimelineEntry } from './summarizers/summarizerTypes'

export type { DailyStatRow, LifetimeStats, SearchQuery, BurnRate, Projection }

/**
 * Merges historical sessions from SQLite with live sessions from the in-memory
 * span window. Live sessions always win on conflict (same sessionId) — they are
 * fresher. Result is sorted by startTime DESC.
 */
export function mergeSessions(
  dbSessions: SessionSummaryCard[],
  liveSessions: SessionSummaryCard[],
): SessionSummaryCard[] {
  const liveIds = new Set(liveSessions.map(s => s.sessionId))
  return [
    ...liveSessions,
    ...dbSessions.filter(s => !liveIds.has(s.sessionId)),
  ].sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime))
}

/**
 * Single access point for session data throughout the extension.
 * Combines DatabaseReader (historical), DatabaseWriter (persistence),
 * and SessionStore (live span window).
 */
export class SessionRepository {
  constructor(
    private readonly reader: DatabaseReader,
    private readonly writer: DatabaseWriter,
    private readonly store: SessionStore,
  ) {}

  /** Returns merged session list: live window + historical DB, sorted newest-first. */
  listSessions(filter?: {
    source?: 'copilot' | 'claude_code' | 'codex'
    limit?: number
  }): SessionSummaryCard[] {
    const dbSessions = this.reader.listSessions(filter)
    const liveSpans = this.store.getSpans()
    const liveSessions = liveSpans.length > 0 ? summarizeSpans(liveSpans).sessions : []
    const merged = mergeSessions(dbSessions, liveSessions)
    if (filter?.limit != null && merged.length > filter.limit) {
      return merged.slice(0, filter.limit)
    }
    return merged
  }

  /** Returns full timeline entries for one session (no blob content). */
  loadSessionTimeline(sessionId: string): TimelineEntry[] {
    return this.reader.loadSessionTimeline(sessionId)
  }

  /** Reads one blob file. Returns null if not found. */
  async loadBlob(
    spanId: string,
    field: 'response' | 'thinking' | 'tool-input' | 'full-result' | 'edit-old' | 'edit-new',
    editIndex?: number,
  ): Promise<string | null> {
    return this.reader.loadBlob(spanId, field, editIndex)
  }

  /** Returns daily token + cost stats for the last N days, optionally filtered by source. */
  queryDailyStats(options: { since: number; source?: string }): DailyStatRow[] {
    return this.reader.queryDailyStats(options)
  }

  /** Returns lifetime aggregate stats across all non-sidechain sessions. */
  queryLifetimeStats(): LifetimeStats {
    return this.reader.queryLifetimeStats()
  }

  /** Full-text + filter session search with pagination. */
  searchSessions(query: SearchQuery): { sessions: SessionSummaryCard[]; totalCount: number } {
    return this.reader.searchSessions(query)
  }

  /** Burn rate for an active session. Returns null if < 2 LLM entries with timestamps. */
  queryBurnRate(sessionId: string): { burnRate: BurnRate; projection: Projection | null } | null {
    return this.reader.queryBurnRate(sessionId)
  }

  /** Returns storage size stats for the DB file and blobs directory. */
  getStorageStats(dbPath: string, blobsDir: string): { dbBytes: number; blobBytes: number; blobCount: number } {
    let dbBytes = 0
    let blobBytes = 0
    let blobCount = 0
    try { dbBytes = fs.statSync(dbPath).size } catch { /* ok */ }
    try {
      const files = fs.readdirSync(blobsDir)
      for (const f of files) {
        try {
          blobBytes += fs.statSync(`${blobsDir}/${f}`).size
          blobCount++
        } catch { /* ok */ }
      }
    } catch { /* ok */ }
    return { dbBytes, blobBytes, blobCount }
  }

  /** Enqueues a session write — thin delegation to DatabaseWriter. */
  enqueue(card: SessionSummaryCard, workspace: string): void {
    this.writer.enqueue(card, workspace)
  }

  /** Waits for all pending DB writes to complete. */
  async drain(): Promise<void> {
    return this.writer.drain()
  }

  /** Clears all three SQLite tables. */
  clearAll(): void {
    this.writer.clearAll()
  }

  /** Exposes the raw SessionStore for callers that still need it (e.g. status bar). */
  get store_(): SessionStore {
    return this.store
  }

  /** Exposes onUpdate from the underlying store. */
  onUpdate(fn: (traceId?: string) => void): { dispose(): void } {
    return this.store.onUpdate(fn)
  }

  /** Clears the in-memory span window. */
  clearStore(): void {
    this.store.clear()
  }

  /** Saves the DB to disk (called after each drain for cross-window sync). */
  saveDb(save: () => void): void {
    save()
  }

  /** Deletes all blob files under storageUri/blobs/. Returns count deleted. */
  async clearBlobs(storageUri: vscode.Uri): Promise<number> {
    const blobsUri = vscode.Uri.joinPath(storageUri, 'blobs')
    let count = 0
    try {
      const entries = await vscode.workspace.fs.readDirectory(blobsUri)
      await Promise.all(
        entries
          .filter(([, type]) => type === vscode.FileType.File)
          .map(async ([name]) => {
            try {
              await vscode.workspace.fs.delete(vscode.Uri.joinPath(blobsUri, name))
              count++
            } catch { /* ignore individual delete failures */ }
          })
      )
    } catch { /* blobs dir absent — nothing to clear */ }
    return count
  }
}
