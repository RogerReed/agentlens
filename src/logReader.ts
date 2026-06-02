/**
 * Reads local session logs for Claude Code, Codex, and Copilot CLI and
 * synthesises SessionSummaryCard records from them.
 *
 * Agent log paths (Mac/Linux → Windows):
 *
 *   Claude Code  ~/.claude/projects/<project>/<uuid>.jsonl
 *                %APPDATA%\Claude\projects\<project>\<uuid>.jsonl   (Windows)
 *                Override: CLAUDE_CONFIG_DIR (comma-separated list of config dirs)
 *
 *   Codex        ~/.codex/sessions/<project>/<uuid>.jsonl
 *                Override: CODEX_HOME (comma-separated list of home dirs)
 *
 *   Copilot CLI  ~/.copilot/otel/*.jsonl  (requires env setup — see below)
 *                Override: COPILOT_OTEL_FILE_EXPORTER_PATH (explicit file path)
 *
 * Data available from logs (vs OTEL):
 *   Available: session/session ID, workspace, model, timestamps, token counts
 *              (incl. cache reads/writes), tool calls from content blocks
 *   Not available: TTFT, per-tool timing, streaming speed, loop signals
 */

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import type { SessionSummaryCard, TimelineEntry } from './summarizers/summarizerTypes'

// ── Cross-platform home resolution ────────────────────────────────────────────

function homeDir(): string {
  return os.homedir()
}

function claudeProjectsDirs(): string[] {
  // Env override: comma-separated list of Claude config dirs (each must have a projects/ sub-dir).
  const envVal = process.env['CLAUDE_CONFIG_DIR']
  if (envVal) {
    return envVal.split(',').map(p => p.trim()).filter(Boolean)
      .map(p => (p.endsWith('projects') ? p : path.join(p, 'projects')))
  }

  const home = homeDir()
  const candidates: string[] = [path.join(home, '.claude', 'projects')]

  // Windows: Claude Code uses %APPDATA%\Claude\projects
  if (process.platform === 'win32') {
    const appData = process.env['APPDATA']
    if (appData) candidates.unshift(path.join(appData, 'Claude', 'projects'))
  } else {
    // XDG_CONFIG_HOME on Linux/Mac
    const xdg = process.env['XDG_CONFIG_HOME']
    if (xdg) candidates.push(path.join(xdg, 'claude', 'projects'))
  }

  return candidates.filter(d => { try { return fs.statSync(d).isDirectory() } catch { return false } })
}

function codexSessionsDirs(): string[] {
  const envVal = process.env['CODEX_HOME']
  if (envVal) {
    return envVal.split(',').map(p => p.trim()).filter(Boolean)
      .map(p => path.join(p, 'sessions'))
  }
  const base = path.join(homeDir(), '.codex', 'sessions')
  return fs.existsSync(base) ? [base] : []
}

function copilotSessionStateDir(): string | null {
  // Copilot CLI writes session logs to ~/.copilot/session-state/<uuid>/events.jsonl
  // automatically, with no env setup required.
  const dir = path.join(homeDir(), '.copilot', 'session-state')
  return fs.existsSync(dir) ? dir : null
}

// ── File state tracking ───────────────────────────────────────────────────────

interface FileState {
  bytesRead: number
  mtimeMs: number
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface LogReaderOptions {
  log?: (msg: string) => void
}

export interface LogSessionResult {
  card: SessionSummaryCard
  /** Workspace path extracted from the log file (cwd). May be empty for Copilot. */
  workspace: string
}

export class LogReader {
  private readonly log: (msg: string) => void
  private readonly fileState = new Map<string, FileState>()

  constructor(options: LogReaderOptions = {}) {
    this.log = options.log ?? (() => { /* silent */ })
  }

  /**
   * Collects all session files across all agents, sorted newest-first by mtime.
   * Does NOT read file contents. Used by the startup batch-loader to process
   * files in priority order without one big synchronous block.
   */
  collectFileMeta(): Array<{ filePath: string; mtimeMs: number; agentKey: string }> {
    const entries: Array<{ filePath: string; mtimeMs: number; agentKey: string }> = []

    // Claude
    for (const projectsDir of claudeProjectsDirs()) {
      for (const filePath of this._collectJsonlFiles(projectsDir)) {
        try { entries.push({ filePath, mtimeMs: fs.statSync(filePath).mtimeMs, agentKey: 'claude' }) } catch { /* skip */ }
      }
    }
    // Codex
    for (const sessionsDir of codexSessionsDirs()) {
      for (const filePath of this._collectJsonlFiles(sessionsDir)) {
        try { entries.push({ filePath, mtimeMs: fs.statSync(filePath).mtimeMs, agentKey: 'codex' }) } catch { /* skip */ }
      }
    }
    // Copilot session-state
    const stateDir = copilotSessionStateDir()
    if (stateDir) {
      try {
        for (const d of fs.readdirSync(stateDir)) {
          const f = path.join(stateDir, d, 'events.jsonl')
          try { entries.push({ filePath: f, mtimeMs: fs.statSync(f).mtimeMs, agentKey: 'copilot' }) } catch { /* skip */ }
        }
      } catch { /* ignore */ }
    }

    // Newest first — caller processes in this order so recent sessions appear first.
    entries.sort((a, b) => b.mtimeMs - a.mtimeMs)
    return entries
  }

  /**
   * Parses a single file identified by collectFileMeta() and returns a result if
   * the file is new or has grown since the last scan. Returns null if unchanged.
   */
  parseFile(filePath: string, agentKey: string): LogSessionResult | null {
    const sessionId = agentKey === 'copilot'
      ? path.basename(path.dirname(filePath))  // directory name is session UUID
      : path.basename(filePath, '.jsonl')

    switch (agentKey) {
      case 'claude':  return this._processFile(filePath, () => this._parseClaudeFile(filePath))
      case 'codex':   return this._processFile(filePath, () => this._parseCodexFile(filePath, ''))
      case 'copilot': return this._processFile(filePath, () => this._parseCopilotFile(filePath, sessionId))
      default:        return null
    }
  }

  /** Returns all directories that should be watched for file changes. */
  getWatchDirs(): string[] {
    return [
      ...claudeProjectsDirs(),
      ...codexSessionsDirs(),
      ...((() => { const d = copilotSessionStateDir(); return d ? [d] : [] })()),
    ]
  }

  /**
   * Scans all log directories and returns new/updated session results.
   * Files that are new or have changed since the last scan are re-parsed.
   */
  scan(): LogSessionResult[] {
    return [
      ...this._scanClaude(),
      ...this._scanCodex(),
      ...this._scanCopilot(),
    ]
  }

  // ── Claude Code ─────────────────────────────────────────────────────────────

  private _scanClaude(): LogSessionResult[] {
    const results: LogSessionResult[] = []
    for (const projectsDir of claudeProjectsDirs()) {
      this._collectJsonlFiles(projectsDir).forEach(filePath => {
        const result = this._processFile(filePath, () => this._parseClaudeFile(filePath))
        if (result) results.push(result)
      })
    }
    return results
  }

  private _parseClaudeFile(filePath: string): LogSessionResult | null {
    const lines = this._readNewLines(filePath)
    if (!lines) return null

    const sessionId = path.basename(filePath, '.jsonl')

    let workspace = ''
    let model = ''
    let firstTimestamp = ''
    let lastTimestamp = ''
    let userRequest = ''
    let totalInput = 0, totalOutput = 0, totalCacheRead = 0, totalCacheCreate = 0
    let turns = 0, totalToolCalls = 0
    const filesChanged = new Set<string>()
    const filesRead    = new Set<string>()
    const toolCounts: Record<string, number> = {}
    const timeline: TimelineEntry[] = []
    let idx = 0

    for (const line of lines) {
      let entry: Record<string, unknown>
      try { entry = JSON.parse(line) as Record<string, unknown> } catch { continue }

      const ts = entry['timestamp'] as string | undefined
      if (ts) { if (!firstTimestamp) firstTimestamp = ts; lastTimestamp = ts }
      if (entry['cwd'] && !workspace) workspace = entry['cwd'] as string

      if (entry['type'] === 'user') {
        const content = (entry['message'] as Record<string, unknown>)?.['content']
        const text = _extractTextContent(content)
        if (!userRequest && text) userRequest = text
        timeline.push({ type: 'user_input', spanId: `log-u-${idx}`, label: 'User', durationMs: 0, isError: false, timestamp: ts ?? '', responseText: text })
        idx++
      }

      if (entry['type'] === 'assistant') {
        const msg = entry['message'] as Record<string, unknown> | undefined
        if (msg?.['model']) model = msg['model'] as string
        const usage = msg?.['usage'] as Record<string, number> | undefined
        if (usage) {
          totalInput       += usage['input_tokens']              ?? 0
          totalOutput      += usage['output_tokens']             ?? 0
          totalCacheRead   += usage['cache_read_input_tokens']   ?? 0
          totalCacheCreate += usage['cache_creation_input_tokens'] ?? 0
          turns++
        }
        const content = (msg?.['content'] as Array<Record<string, unknown>>) ?? []
        let hasToolCall = false
        for (const block of content) {
          if (block['type'] === 'tool_use' && block['name']) {
            hasToolCall = true; totalToolCalls++
            const name = block['name'] as string
            toolCounts[name] = (toolCounts[name] ?? 0) + 1
            const inp = (block['input'] ?? {}) as Record<string, unknown>
            const fp  = String(inp['file_path'] ?? inp['filePath'] ?? inp['path'] ?? '')
            if (fp) {
              if (name === 'Read' || name === 'read_file') filesRead.add(fp)
              else if (['Edit','Write','MultiEdit','replace_string_in_file','create_file'].includes(name)) filesChanged.add(fp)
            }
          }
        }
        const responseText = (content.find(b => b['type'] === 'text') as Record<string,string> | undefined)?.['text']
        timeline.push({ type: hasToolCall ? 'tool' : 'llm', spanId: `log-a-${idx}`, label: hasToolCall ? 'Tool calls' : 'Response', model: model || undefined, inputTokens: usage?.['input_tokens'], outputTokens: usage?.['output_tokens'], durationMs: 0, isError: false, timestamp: ts ?? '', responseText })
        idx++
      }
    }

    if (!firstTimestamp) return null
    return { workspace, card: _buildCard(sessionId, 'claude_code', model || 'claude', firstTimestamp, lastTimestamp, { totalInput, totalOutput, totalCacheRead, totalCacheCreate, turns, totalToolCalls, toolCounts, filesRead, filesChanged, filesSearched: new Set(), userRequest, timeline }) }
  }

  // ── Codex ───────────────────────────────────────────────────────────────────

  private _scanCodex(): LogSessionResult[] {
    const results: LogSessionResult[] = []
    for (const sessionsDir of codexSessionsDirs()) {
      this._collectJsonlFiles(sessionsDir).forEach(filePath => {
        const result = this._processFile(filePath, () => this._parseCodexFile(filePath, sessionsDir))
        if (result) results.push(result)
      })
    }
    return results
  }

  private _parseCodexFile(filePath: string, _sessionsDir: string): LogSessionResult | null {
    const lines = this._readNewLines(filePath)
    if (!lines) return null

    const sessionId = path.basename(filePath, '.jsonl')
    // Derive workspace from parent directory name (URL-encoded project path).
    const workspace = path.dirname(filePath)

    let model = ''
    let firstTimestamp = ''
    let lastTimestamp = ''
    let totalInput = 0, totalOutput = 0, totalCacheRead = 0
    let turns = 0

    for (const line of lines) {
      let entry: Record<string, unknown>
      try { entry = JSON.parse(line) as Record<string, unknown> } catch { continue }

      const ts = entry['timestamp'] as string | undefined
      if (ts) { if (!firstTimestamp) firstTimestamp = ts; lastTimestamp = ts }

      // turn_context carries the model name
      if (entry['type'] === 'turn_context') {
        const payload = entry['payload'] as Record<string, unknown> | undefined
        if (payload?.['model']) model = String(payload['model'])
      }

      // event_msg with token_count payload has per-turn usage
      if (entry['type'] === 'event_msg') {
        const payload = entry['payload'] as Record<string, unknown> | undefined
        if (payload?.['type'] === 'token_count') {
          const info = payload['info'] as Record<string, unknown> | undefined
          if (info?.['model']) model = String(info['model'])
          const lastUsage = info?.['last_token_usage'] as Record<string, number> | undefined
          if (lastUsage) {
            totalInput    += lastUsage['input_tokens']         ?? 0
            totalOutput   += lastUsage['output_tokens']        ?? 0
            totalCacheRead += lastUsage['cached_input_tokens'] ?? 0
            turns++
          }
        }
      }
    }

    if (!firstTimestamp) return null
    return {
      workspace,
      card: _buildCard(sessionId, 'codex', model || 'codex', firstTimestamp, lastTimestamp, { totalInput, totalOutput, totalCacheRead, totalCacheCreate: 0, turns, totalToolCalls: 0, toolCounts: {}, filesRead: new Set(), filesChanged: new Set(), filesSearched: new Set(), userRequest: '', timeline: [] }),
    }
  }

  // ── Copilot CLI ──────────────────────────────────────────────────────────────
  // Reads ~/.copilot/session-state/<uuid>/events.jsonl — written automatically,
  // no env setup required. Each directory is one session (dirname = session ID).
  //
  // Key event types:
  //   session.start        → data.sessionId, data.selectedModel, data.startTime, data.context.cwd
  //   user.message         → data.transformedContent (user request text)
  //   assistant.message    → data.outputTokens, data.toolRequests
  //   session.shutdown     → data.currentTokens (total context size at end)

  private _scanCopilot(): LogSessionResult[] {
    const results: LogSessionResult[] = []
    const stateDir = copilotSessionStateDir()
    if (!stateDir) return results

    let sessionDirs: string[]
    try {
      sessionDirs = fs.readdirSync(stateDir)
    } catch { return results }

    for (const sessionDirName of sessionDirs) {
      const eventsFile = path.join(stateDir, sessionDirName, 'events.jsonl')
      const result = this._processFile(eventsFile, () => this._parseCopilotFile(eventsFile, sessionDirName))
      if (result) results.push(result)
    }

    return results
  }

  private _parseCopilotFile(filePath: string, sessionId: string): LogSessionResult | null {
    const lines = this._readNewLines(filePath)
    if (!lines) return null

    let workspace = ''
    let model = ''
    let firstTimestamp = ''
    let lastTimestamp = ''
    let userRequest = ''
    let totalOutput = 0
    let totalInputFromShutdown = 0
    let turns = 0, totalToolCalls = 0
    const toolCounts: Record<string, number> = {}
    const filesChanged = new Set<string>()

    for (const line of lines) {
      let event: Record<string, unknown>
      try { event = JSON.parse(line) as Record<string, unknown> } catch { continue }

      const ts = event['timestamp'] as string | undefined
      if (ts) { if (!firstTimestamp) firstTimestamp = ts; lastTimestamp = ts }

      const type = event['type'] as string | undefined
      const data = event['data'] as Record<string, unknown> | undefined
      if (!type || !data) continue

      if (type === 'session.start') {
        if (data['selectedModel']) model = String(data['selectedModel'])
        const ctx = data['context'] as Record<string, unknown> | undefined
        if (ctx?.['cwd']) workspace = String(ctx['cwd'])
        if (data['startTime'] && !firstTimestamp) firstTimestamp = String(data['startTime'])
      }

      if (type === 'user.message' && !userRequest) {
        userRequest = _extractCopilotUserText(String(data['transformedContent'] ?? ''))
      }

      if (type === 'assistant.message') {
        const outTok = data['outputTokens'] as number | undefined
        if (outTok) { totalOutput += outTok; turns++ }
        const toolReqs = data['toolRequests'] as Array<Record<string, unknown>> | undefined
        if (toolReqs) {
          for (const req of toolReqs) {
            const name = String(req['name'] ?? '')
            if (!name) continue
            totalToolCalls++
            toolCounts[name] = (toolCounts[name] ?? 0) + 1
            // Track file paths from write/edit tools
            const args = req['arguments'] as Record<string, unknown> | undefined
            const fp = String(args?.['path'] ?? args?.['file_path'] ?? '')
            if (fp && (name === 'edit' || name === 'write' || name === 'create')) {
              filesChanged.add(fp)
            }
          }
        }
        if (data['model']) model = String(data['model'])
      }

      // session.shutdown has total context token counts
      if (type === 'session.shutdown') {
        totalInputFromShutdown = (data['currentTokens'] as number) ?? 0
      }
    }

    if (!firstTimestamp) return null

    // Input tokens: use session.shutdown total if available (output already counted),
    // otherwise fall back to output as a rough proxy.
    const totalInput = totalInputFromShutdown > 0
      ? Math.max(0, totalInputFromShutdown - totalOutput)
      : 0

    return {
      workspace,
      card: _buildCard(sessionId, 'copilot', model || 'copilot', firstTimestamp, lastTimestamp, {
        totalInput,
        totalOutput,
        totalCacheRead: 0,
        totalCacheCreate: 0,
        turns,
        totalToolCalls,
        toolCounts,
        filesRead: new Set(),
        filesChanged,
        filesSearched: new Set(),
        userRequest: userRequest.slice(0, 500),
        timeline: [],
      }),
    }
  }

  // ── Shared helpers ────────────────────────────────────────────────────────────

  private _collectJsonlFiles(dir: string): string[] {
    const results: string[] = []
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) results.push(...this._collectJsonlFiles(full))
        else if (entry.isFile() && entry.name.endsWith('.jsonl')) results.push(full)
      }
    } catch { /* directory gone or no permission */ }
    return results
  }

  /** Returns only the new bytes since last read, split into lines. Returns null if unchanged. */
  private _readNewLines(filePath: string): string[] | null {
    try {
      const stat = fs.statSync(filePath)
      const prev = this.fileState.get(filePath)
      if (prev && stat.mtimeMs === prev.mtimeMs && stat.size === prev.bytesRead) return null

      // Always re-read the whole file so each scan produces a complete card.
      // Incremental reads (seeking to prev.bytesRead) produced partial cards that
      // then replaced the full card in logSessions, losing prior-turn data.
      const content = fs.readFileSync(filePath, 'utf-8')
      this.fileState.set(filePath, { bytesRead: stat.size, mtimeMs: stat.mtimeMs })
      return content.split('\n').filter(l => l.trim())
    } catch (err) {
      this.log(`[LogReader] read error ${filePath}: ${err}`)
      return null
    }
  }

  /** Checks if a file has changed since last scan; if so, delegates to parseFn. */
  private _processFile(
    filePath: string,
    parseFn: () => LogSessionResult | null,
  ): LogSessionResult | null {
    try {
      const stat = fs.statSync(filePath)
      const prev = this.fileState.get(filePath)
      if (prev && stat.mtimeMs === prev.mtimeMs && stat.size === prev.bytesRead) return null
      // parseFn reads its own bytes via _readNewLines; state update happens there.
      return parseFn()
    } catch {
      return null
    }
  }
}

// ── Shared card builder ───────────────────────────────────────────────────────

interface CardAccum {
  totalInput: number
  totalOutput: number
  totalCacheRead: number
  totalCacheCreate: number
  turns: number
  totalToolCalls: number
  toolCounts: Record<string, number>
  filesRead: Set<string>
  filesChanged: Set<string>
  filesSearched: Set<string>
  userRequest: string
  timeline: TimelineEntry[]
}

function _buildCard(
  sessionId: string,
  source: 'claude_code' | 'codex' | 'copilot',
  model: string,
  firstTimestamp: string,
  lastTimestamp: string,
  acc: CardAccum,
): SessionSummaryCard {
  const startMs  = _parseTs(firstTimestamp)
  const endMs    = _parseTs(lastTimestamp)
  const durationMs = (endMs > 0 && startMs > 0) ? Math.max(0, endMs - startMs) : 0
  // Use total context (raw + cache read + cache create) as the denominator so the
  // rate stays 0–1. Using raw input_tokens alone produces rates >> 1 in multi-turn
  // sessions where the cached context dwarfs the new tokens added each turn.
  const totalContext = acc.totalInput + acc.totalCacheRead + acc.totalCacheCreate
  const cacheHitRate = totalContext > 0 ? acc.totalCacheRead / totalContext : 0

  return {
    sessionId,
    traceId: sessionId,
    source,
    dataSource: 'log',
    userRequest: acc.userRequest.slice(0, 500),
    model,
    turns: acc.turns,
    inputTokens: totalContext,
    outputTokens: acc.totalOutput,
    cacheReadTokens: acc.totalCacheRead,
    cacheCreateTokens: acc.totalCacheCreate,
    cacheHitRate,
    durationMs,
    startTime: startMs > 0 ? new Date(startMs).toISOString() : '',
    filesRead:     Array.from(acc.filesRead),
    filesSearched: Array.from(acc.filesSearched),
    filesChanged:  Array.from(acc.filesChanged),
    toolCounts: acc.toolCounts,
    totalToolCalls: acc.totalToolCalls,
    totalLlmCalls: acc.turns,
    errors: 0,
    outcome: acc.totalToolCalls > 0 ? 'tool_calls' : 'text_response',
    timeline: acc.timeline,
    backgroundSpans: [],
    loopSignals: [],
  }
}

// ── Text content helpers ──────────────────────────────────────────────────────

/**
 * Extracts the real user text from Copilot's `transformedContent` field, which
 * can be prefixed with injected XML-like blocks:
 *   <current_datetime>...</current_datetime>
 *   <system_reminder>...</system_reminder>
 * Returns the first non-empty line that isn't inside such a block.
 */
function _extractCopilotUserText(raw: string): string {
  // Split into lines, skip lines that are entirely part of injected XML blocks.
  const lines = raw.split('\n')
  let inTag = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Opening XML-like injection tag — enter skip mode
    if (/^<[a-z_]+[^>]*>/.test(trimmed) && !trimmed.startsWith('</')) {
      // If the tag closes on the same line, skip just this line
      if (/<\/[a-z_]+>$/.test(trimmed)) continue
      inTag = true
      continue
    }
    // Closing tag — exit skip mode
    if (/^<\/[a-z_]+>/.test(trimmed)) { inTag = false; continue }
    if (inTag) continue
    return trimmed
  }
  return ''
}

function _extractTextContent(content: unknown): string {
  if (!content) return ''
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content)) {
    for (const block of content as Array<Record<string, unknown>>) {
      if (block['type'] === 'text' && typeof block['text'] === 'string' && block['text'].trim()) {
        return (block['text'] as string).trim()
      }
    }
  }
  return ''
}

function _parseTs(ts: string): number {
  if (!ts) return 0
  // ISO string
  const ms = Date.parse(ts)
  if (!isNaN(ms)) return ms
  // Unix nanoseconds (very large numbers)
  const n = parseInt(ts)
  if (!isNaN(n) && n > 1e15) return Math.floor(n / 1e6)  // ns → ms
  return 0
}
