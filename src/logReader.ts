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

function copilotOtelPaths(): string[] {
  const files: string[] = []

  // Explicit env override — a single file path.
  const envFile = process.env['COPILOT_OTEL_FILE_EXPORTER_PATH']
  if (envFile && fs.existsSync(envFile)) files.push(envFile)

  // Default directory: ~/.copilot/otel/*.jsonl
  const otelDir = path.join(homeDir(), '.copilot', 'otel')
  if (fs.existsSync(otelDir)) {
    try {
      fs.readdirSync(otelDir)
        .filter(f => f.endsWith('.jsonl'))
        .forEach(f => files.push(path.join(otelDir, f)))
    } catch { /* ignore */ }
  }

  // Deduplicate
  return [...new Set(files)]
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
   * Scans all log directories and returns new/updated session results.
   * Only files that are new or have grown are re-parsed (incremental).
   *
   * The OTEL-wins guard lives in DatabaseWriter.enqueue(), so log cards
   * for sessions already owned by OTEL are silently dropped at write time.
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

  // ── Copilot CLI (OTEL file exporter) ─────────────────────────────────────────
  // Requires env vars set before starting the CLI session:
  //   COPILOT_OTEL_ENABLED=true
  //   COPILOT_OTEL_EXPORTER_TYPE=file
  //   COPILOT_OTEL_FILE_EXPORTER_PATH=~/.copilot/otel/<filename>.jsonl

  private _scanCopilot(): LogSessionResult[] {
    const results: LogSessionResult[] = []
    const sessionMap = new Map<string, CopilotSessionAccum>()

    for (const filePath of copilotOtelPaths()) {
      const lines = this._readNewLines(filePath)
      if (!lines) continue

      for (const line of lines) {
        if (!line.includes('"attributes"')) continue
        let span: Record<string, unknown>
        try { span = JSON.parse(line) as Record<string, unknown> } catch { continue }
        this._accumulateCopilotSpan(span, sessionMap)
      }
    }

    for (const [sessionId, acc] of sessionMap) {
      if (!acc.firstTimestamp) continue
      results.push({
        workspace: '',
        card: _buildCard(sessionId, 'copilot', acc.model, acc.firstTimestamp, acc.lastTimestamp, {
          totalInput: acc.totalInput,
          totalOutput: acc.totalOutput,
          totalCacheRead: acc.totalCacheRead,
          totalCacheCreate: acc.totalCacheCreate,
          turns: acc.turns,
          totalToolCalls: 0,
          toolCounts: {},
          filesRead: new Set(),
          filesChanged: new Set(),
          filesSearched: new Set(),
          userRequest: '',
          timeline: [],
        }),
      })
    }

    return results
  }

  private _accumulateCopilotSpan(
    span: Record<string, unknown>,
    sessionMap: Map<string, CopilotSessionAccum>,
  ): void {
    // Attributes can be an object or an OTEL array: [{key, value: {stringValue}}]
    const attrs = _flattenOtelAttrs(span['attributes'])

    const inputTokens  = _numAttr(attrs, 'gen_ai.usage.input_tokens')
    const outputTokens = _numAttr(attrs, 'gen_ai.usage.output_tokens')
    if (inputTokens === 0 && outputTokens === 0) return  // not a usage span

    const sessionId = String(
      attrs['copilot_chat.chat_session_id'] ?? attrs['thread.id'] ?? attrs['session.id'] ?? ''
    )
    if (!sessionId) return

    const model = String(attrs['gen_ai.request.model'] ?? attrs['gen_ai.response.model'] ?? 'copilot')
    const cacheRead   = _numAttr(attrs, 'gen_ai.usage.cache_read.input_tokens')
    const cacheCreate = _numAttr(attrs, 'gen_ai.usage.cache_creation.input_tokens')
    const ts = String(span['timestamp'] ?? span['startTimeUnixNano'] ?? span['time'] ?? '')

    const acc = sessionMap.get(sessionId) ?? {
      firstTimestamp: '', lastTimestamp: '', model, totalInput: 0, totalOutput: 0,
      totalCacheRead: 0, totalCacheCreate: 0, turns: 0,
    }
    if (ts && (!acc.firstTimestamp || ts < acc.firstTimestamp)) acc.firstTimestamp = ts
    if (ts && ts > acc.lastTimestamp) acc.lastTimestamp = ts
    acc.model       = model
    acc.totalInput  += inputTokens
    acc.totalOutput += outputTokens
    acc.totalCacheRead   += cacheRead
    acc.totalCacheCreate += cacheCreate
    acc.turns++
    sessionMap.set(sessionId, acc)
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

      const startByte = prev?.bytesRead ?? 0
      const len = stat.size - startByte
      if (len <= 0) {
        this.fileState.set(filePath, { bytesRead: stat.size, mtimeMs: stat.mtimeMs })
        return null
      }

      const fd  = fs.openSync(filePath, 'r')
      const buf = Buffer.alloc(len)
      fs.readSync(fd, buf, 0, len, startByte)
      fs.closeSync(fd)
      this.fileState.set(filePath, { bytesRead: stat.size, mtimeMs: stat.mtimeMs })
      return buf.toString('utf8').split('\n').filter(l => l.trim())
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

// ── Copilot accumulator ───────────────────────────────────────────────────────

interface CopilotSessionAccum {
  firstTimestamp: string
  lastTimestamp: string
  model: string
  totalInput: number
  totalOutput: number
  totalCacheRead: number
  totalCacheCreate: number
  turns: number
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
  const cacheHitRate = acc.totalInput > 0 ? acc.totalCacheRead / acc.totalInput : 0

  return {
    sessionId,
    traceId: sessionId,
    source,
    dataSource: 'log',
    userRequest: acc.userRequest.slice(0, 500),
    model,
    turns: acc.turns,
    inputTokens: acc.totalInput,
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

// ── OTEL attribute helpers ────────────────────────────────────────────────────

/** Normalises OTEL attributes — supports both object and array forms. */
function _flattenOtelAttrs(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (Array.isArray(raw)) {
    const result: Record<string, unknown> = {}
    for (const item of raw as Array<{ key?: string; value?: Record<string, unknown> }>) {
      if (!item.key) continue
      const v = item.value
      result[item.key] = v?.['stringValue'] ?? v?.['intValue'] ?? v?.['doubleValue'] ?? v?.['boolValue'] ?? null
    }
    return result
  }
  return raw as Record<string, unknown>
}

function _numAttr(attrs: Record<string, unknown>, key: string): number {
  const v = attrs[key]
  if (typeof v === 'number') return v
  if (typeof v === 'string') return parseInt(v) || 0
  return 0
}

// ── Text content helpers ──────────────────────────────────────────────────────

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
