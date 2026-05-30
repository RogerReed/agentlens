import * as vscode from 'vscode'
import { Span, SpanAttribute, SessionSummary } from './types'

export type { Span, SessionSummary } from './types'

export class SessionStore {
  private spans: Span[] = []
  private summary: SessionSummary = this.emptySummary()
  private onUpdateCallbacks: Array<(traceId?: string) => void> = []

  onUpdate(fn: (traceId?: string) => void): { dispose(): void } {
    this.onUpdateCallbacks.push(fn)
    return { dispose: () => {
      const i = this.onUpdateCallbacks.indexOf(fn)
      if (i >= 0) { this.onUpdateCallbacks.splice(i, 1) }
    }}
  }

  private notifyUpdate(traceId?: string): void {
    for (const fn of this.onUpdateCallbacks) { fn(traceId) }
  }

  constructor(
    private context: vscode.ExtensionContext,
  ) {
    // Persist across reloads
    const saved = context.globalState.get<Span[]>('agentLens.spans', [])
    this.spans = saved
    this.recomputeSummary()
  }

  addSpan(span: Span) {
    if (span.receivedAt === undefined) { span.receivedAt = Date.now() }
    this.spans.push(span)
    this.updateSummary(span)
    this.context.globalState.update('agentLens.spans', this.spans)
    this.notifyUpdate(span.traceId)
  }

  private updateSummary(span: Span) {
    this.summary.totalSpans++
    this.summary.lastUpdated = new Date()

    // Detect agent sessions
    if (span.name.includes('agent') || span.name.includes('session')) {
      this.summary.agentSessions++
    }

    // Track tool calls
    if (span.name.includes('tool')) {
      const toolName = span.name.replace('tool/', '')
      this.summary.toolCalls[toolName] = 
        (this.summary.toolCalls[toolName] ?? 0) + 1
    }

    // Extract token usage — covers Copilot and Claude Code (which splits into cache_read/cache_creation)
    const attrs = span.attributes || []
    const intAttr = (key: string) => {
      const a = attrs.find((x: SpanAttribute) => x.key === key)
      return parseInt(String(a?.value?.intValue ?? a?.value?.stringValue ?? 0)) || 0
    }
    const tokensFound = intAttr('input_tokens') + intAttr('prompt_tokens')
      + intAttr('cache_read_tokens') + intAttr('cache_creation_tokens')
      + intAttr('gen_ai.usage.input_tokens')
      + intAttr('gen_ai.usage.cache_read.input_tokens') + intAttr('gen_ai.usage.cache_creation.input_tokens')
      + intAttr('output_tokens') + intAttr('completion_tokens')
      + intAttr('gen_ai.usage.output_tokens')
    this.summary.tokensUsed += tokensFound

    // Track files changed (write operations only)
    const getAttrVal = (key: string) =>
      span.attributes.find((a: SpanAttribute) => a.key === key)?.value?.stringValue || ''

    // Copilot uses gen_ai.tool.name + gen_ai.tool.call.arguments
    // Claude Code uses tool_name + tool_input
    const toolName = getAttrVal('gen_ai.tool.name') || getAttrVal('tool_name')
    const argsStr = getAttrVal('gen_ai.tool.call.arguments') || getAttrVal('tool_input') || getAttrVal('input')

    const copilotWriteTools = new Set(['replace_string_in_file', 'multi_replace_string_in_file', 'create_file', 'edit_notebook_file', 'apply_patch'])
    const claudeWriteTools = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])
    const isWriteTool = copilotWriteTools.has(toolName) || claudeWriteTools.has(toolName)

    if (isWriteTool && argsStr) {
      try {
        const args = JSON.parse(argsStr)
        // apply_patch: extract file paths from patch content
        if (toolName === 'apply_patch') {
          const patchContent = args.command || args.patch || args.input || ''
          const patchLines = patchContent.split('\n')
          for (const line of patchLines) {
            // Matches: *** Update File: /path, *** Add File: /path, *** Delete File: /path, *** /path
            // Explicitly excludes *** Begin Patch and *** End Patch lines
            const m = line.match(/^\*\*\*\s+(?:Update File:|Add File:|Delete File:)?\s*(.+)/)
            if (m) {
              const fp = m[1].trim()
              if (fp && fp.includes('/') && !this.summary.filesChanged.includes(fp)) {
                this.summary.filesChanged.push(fp)
              }
            }
          }
        } else {
          // filePath (Copilot camelCase) or file_path (Claude Code snake_case)
          const fp = args.filePath || args.file_path
          if (fp && !this.summary.filesChanged.includes(String(fp))) {
            this.summary.filesChanged.push(String(fp))
          }
        }
        // Copilot: multi_replace_string_in_file.replacements[]
        if (args.replacements && Array.isArray(args.replacements)) {
          for (const r of args.replacements) {
            const rfp = r.filePath || r.file_path
            if (rfp && !this.summary.filesChanged.includes(String(rfp))) {
              this.summary.filesChanged.push(String(rfp))
            }
          }
        }
        // Claude Code: MultiEdit.edits[]
        if (args.edits && Array.isArray(args.edits)) {
          for (const e of args.edits) {
            const efp = e.file_path || e.filePath
            if (efp && !this.summary.filesChanged.includes(String(efp))) {
              this.summary.filesChanged.push(String(efp))
            }
          }
        }
      } catch { /* ignore parse errors */ }
    }

    // Track errors
    if (span.status?.code === 2) {this.summary.errors++}
  }

  getSummary() { return this.summary }
  getSpans() { return this.spans }
  export() { return { summary: this.summary, spans: this.spans } }

  // Injects or overwrites a single attribute on an existing span. Used to attach
  // gen_ai log event content (e.g. gen_ai.output.messages) to a span after the fact.
  injectSpanAttribute(traceId: string, spanId: string, key: string, value: string): boolean {
    const span = this.spans.find(s => s.traceId === traceId && s.spanId === spanId)
    if (!span) { return false }
    const existing = span.attributes.find(a => a.key === key)
    if (existing) {
      existing.value = { stringValue: value }
    } else {
      span.attributes.push({ key, value: { stringValue: value } })
    }
    this.notifyUpdate(traceId)
    return true
  }
  
  syncFromGlobalState() {
    const saved = this.context.globalState.get<Span[]>('agentLens.spans', [])
    if (saved.length === this.spans.length) { return }
    this.spans = saved
    this.recomputeSummary()
    this.notifyUpdate()
  }

  clear() {
    this.spans = []
    this.summary = this.emptySummary()
    this.context.globalState.update('agentLens.spans', [])
  }

  private recomputeSummary() {
    this.summary = this.emptySummary()
    this.spans.forEach(s => this.updateSummary(s))
  }

  private emptySummary(): SessionSummary {
    return {
      totalSpans: 0,
      agentSessions: 0,
      toolCalls: {},
      totalDurationMs: 0,
      tokensUsed: 0,
      filesChanged: [],
      errors: 0,
      lastUpdated: new Date()
    }
  }
}
